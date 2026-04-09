import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

type RefineTone = "natural" | "polite" | "firm" | "flexible" | "friendly";

interface RefineRequest {
  draft: string;
  tone: RefineTone;
}

const TONE_INSTRUCTIONS: Record<RefineTone, string> = {
  natural: "원래 톤과 분위기를 최대한 유지하면서 문장만 매끄럽고 자연스럽게 다듬어주세요",
  polite: "정중하고 예의 바른 톤으로 변환해주세요. 존댓말을 사용하고 격식 있는 표현으로 바꿔주세요",
  firm: "단호하고 명확한 톤으로 변환해주세요. 프로페셔널하고 확신 있는 표현을 사용해주세요",
  flexible: "유연하고 열린 자세의 톤으로 변환해주세요. 상대방 의견을 존중하는 표현을 사용해주세요",
  friendly: "친근하고 편안한 톤으로 변환해주세요. 가볍고 부담 없는 표현을 사용해주세요",
};

import { checkRateLimit } from "@/lib/rateLimit";
import { checkAndDeductCredit } from "@/lib/creditSystem";

const MAX_DRAFT_LENGTH = 2000;

const ALLOWED_ORIGINS = [
  "https://reply-app-sepia.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

function isOriginAllowed(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (origin && ALLOWED_ORIGINS.some((a) => origin.startsWith(a))) return true;
  if (referer && ALLOWED_ORIGINS.some((a) => referer.startsWith(a))) return true;
  return false;
}

export async function POST(request: NextRequest) {
  if (!isOriginAllowed(request)) {
    return Response.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
  }

  let userId: string | null = null;
  try {
    const result = await auth();
    userId = result.userId;
  } catch {
    // Clerk not configured
  }

  let remaining = 0;
  if (userId) {
    const credit = await checkAndDeductCredit(userId);
    if (!credit.allowed) {
      return Response.json(
        { error: "이번 달 크레딧을 모두 사용했습니다. 다음 달에 자동 충전됩니다.", remaining: 0 },
        { status: 429 }
      );
    }
    remaining = credit.remaining;
  } else {
    const rateResult = await checkRateLimit(request, null, {
      authenticatedLimit: 10,
      anonymousLimit: 3,
      prefix: "refine",
    });
    if (!rateResult.allowed) {
      return Response.json(
        { error: "무료 사용량(3회)을 초과했습니다. 로그인하면 매월 50크레딧을 받을 수 있어요.", remaining: 0 },
        { status: 429 }
      );
    }
    remaining = rateResult.remaining;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "서비스 설정 오류입니다. 관리자에게 문의해 주세요." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as RefineRequest;

  if (!body.draft?.trim()) {
    return Response.json({ error: "다듬을 답장을 입력해주세요." }, { status: 400 });
  }

  if (body.draft.length > MAX_DRAFT_LENGTH) {
    return Response.json(
      { error: `답장은 ${MAX_DRAFT_LENGTH}자 이내로 입력해주세요.` },
      { status: 400 }
    );
  }

  const toneInstruction = TONE_INSTRUCTIONS[body.tone];
  if (!toneInstruction) {
    return Response.json({ error: "올바른 톤을 선택해주세요." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `당신은 한국인 직장인의 메신저 소통 전문가입니다.
사용자가 대충 작성한 답장의 오타/맞춤법만 잡고, 문체는 한국인이 카톡/메신저에서 실제로 쓰는 방식 그대로 유지해주세요.

핵심 규칙:
- 원래 의미, 의도, 문체를 반드시 유지
- 오타와 맞춤법 오류만 수정 (예: "돼엇슺니다" → "되었습니다", "수고하샷습니다" → "수고하셨습니다")
- ${toneInstruction}

"AI 느낌 제거" 규칙 (가장 중요):
- 교과서적/문어체/번역체 표현 절대 금지
- 원문에 없는 조사(가, 을, 는, 에, 중)를 추가하지 마세요 (예: "출고 종료" → "출고가 종료"로 바꾸지 말 것)
- 원문에 없는 쉼표, 접속사("또한", "그러나") 추가 금지
- 숫자 포맷은 원문 그대로 유지 (쉼표 강제 삽입 금지, "5588건" → "5,588건" 변환 금지)
- 문장을 길게 늘리거나 과도하게 정제하지 않기
- 한국인이 업무 메신저에서 실제로 보내는 느낌 그대로 유지

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트를 추가하지 마세요:
{"refined": "다듬어진 답장 내용"}

사용자가 작성한 원문:
${body.draft}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return Response.json({ error: "AI 응답을 처리할 수 없습니다." }, { status: 500 });
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return Response.json({ error: "AI 응답 형식이 올바르지 않습니다." }, { status: 500 });
  }

  let result: { refined: string };
  try {
    result = JSON.parse(jsonMatch[0]) as { refined: string };
  } catch {
    return Response.json(
      { error: "AI 응답을 파싱할 수 없습니다. 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  return Response.json({ refined: result.refined, remaining });
}
