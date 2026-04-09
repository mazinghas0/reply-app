import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

type RefineTone = "natural" | "polite" | "firm" | "flexible" | "friendly";

interface RefineRequest {
  draft: string;
  tone: RefineTone;
}

const TONE_INSTRUCTIONS: Record<RefineTone, { instruction: string; freedom: string }> = {
  natural: {
    instruction: "원래 톤을 유지하면서 문장을 매끄럽게 다듬어주세요",
    freedom: "오타/맞춤법 수정 + 어색한 어순 교정 + 불필요한 반복 제거. 의미와 분위기는 유지하되, 읽기 편하게 개선하세요.",
  },
  polite: {
    instruction: "정중하고 예의 바른 톤으로 바꿔주세요",
    freedom: "존댓말 전환, 격식 있는 표현 사용. 원문의 핵심 의미는 유지하되, 문체는 적극적으로 변환하세요.",
  },
  firm: {
    instruction: "단호하고 명확한 톤으로 바꿔주세요",
    freedom: "확신 있는 표현, 군더더기 제거, 핵심만 전달. 원문의 핵심 의미는 유지하되, 문체는 적극적으로 변환하세요.",
  },
  flexible: {
    instruction: "유연하고 열린 자세의 톤으로 바꿔주세요",
    freedom: "상대 의견을 존중하는 표현, 여지를 남기는 문장. 원문의 핵심 의미는 유지하되, 문체는 적극적으로 변환하세요.",
  },
  friendly: {
    instruction: "친근하고 편안한 톤으로 바꿔주세요",
    freedom: "가볍고 부담 없는 표현, 반말이나 편한 존댓말 사용. 원문의 핵심 의미는 유지하되, 문체는 적극적으로 변환하세요.",
  },
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

  const toneConfig = TONE_INSTRUCTIONS[body.tone];
  if (!toneConfig) {
    return Response.json({ error: "올바른 톤을 선택해주세요." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `당신은 한국인 직장인의 메신저 소통 전문가입니다.
사용자가 작성한 답장을 다듬어 주세요.

목표: ${toneConfig.instruction}
변경 범위: ${toneConfig.freedom}

중요: 원문과 다른 결과를 반드시 만들어주세요. 원문을 그대로 반환하지 마세요.
오타가 없더라도 문장 흐름, 어순, 표현을 개선하세요.

"AI 느낌 제거" 규칙:
- 한국인이 카카오톡/업무 메신저에서 실제로 쓰는 문체로 작성
- 교과서적/문어체/번역체 표현 금지 ("~의 경우", "~에 대해", "~하는 것이" 등)
- 숫자 포맷은 원문 그대로 유지 ("5588건" → "5,588건" 변환 금지)
- 과도하게 길게 늘리지 않기

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트를 추가하지 마세요:
{"refined": "다듬어진 답장 내용"}

사용자가 작성한 원문:
${body.draft}`,
        },
      ],
    });
  } catch {
    return Response.json(
      { error: "AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해 주세요." },
      { status: 502 }
    );
  }

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
