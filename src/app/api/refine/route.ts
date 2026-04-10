import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

type RefineTone = "polite" | "firm" | "flexible" | "friendly";

interface RefineRequest {
  intent: string;
  tone: RefineTone;
  relationship?: string;
  purpose?: string;
  strategy?: string;
}

const TONE_INSTRUCTIONS: Record<RefineTone, string> = {
  polite: "정중하고 예의 바른 톤. 존댓말 + 격식. 과도한 존칭 금지, '~부탁드립니다' 수준.",
  firm: "단호하고 명확한 톤. 군더더기 제거, 핵심만 직접적으로 전달.",
  flexible: "유연하고 열린 톤. 상대 의견 존중, 여지를 남기는 문장. '~하면 어떨까요' 패턴.",
  friendly: "친근하고 편안한 톤. 가볍고 부담 없는 표현. 딱딱함 없이 자연스럽게.",
};

import { checkAnonymousTotal } from "@/lib/rateLimit";
import { checkAndDeductCredit } from "@/lib/creditSystem";
import { getPlanConfig, ANONYMOUS_MAX_INPUT, ANONYMOUS_TOTAL_USES } from "@/lib/planConfig";

const ALLOWED_ORIGINS = [
  "https://aireply.co.kr",
  "https://www.aireply.co.kr",
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
  let maxInputLength = ANONYMOUS_MAX_INPUT;

  if (userId) {
    const credit = await checkAndDeductCredit(userId);
    if (!credit.allowed) {
      return Response.json(
        { error: "이번 달 크레딧을 모두 사용했습니다. 다음 달에 자동 충전됩니다.", remaining: 0 },
        { status: 429 }
      );
    }
    remaining = credit.remaining;
    maxInputLength = getPlanConfig(credit.plan).maxInputLength;
  } else {
    const anonResult = await checkAnonymousTotal(request, ANONYMOUS_TOTAL_USES);
    if (!anonResult.allowed) {
      return Response.json(
        { error: "체험 5회를 모두 사용했습니다. 로그인하면 매월 10크레딧을 받을 수 있어요.", remaining: 0 },
        { status: 429 }
      );
    }
    remaining = anonResult.remaining;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "서비스 설정 오류입니다. 관리자에게 문의해 주세요." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as RefineRequest;

  if (!body.intent?.trim()) {
    return Response.json({ error: "하고 싶은 말을 입력해주세요." }, { status: 400 });
  }

  if (body.intent.length > maxInputLength) {
    return Response.json(
      { error: `내용은 ${maxInputLength}자 이내로 입력해주세요.` },
      { status: 400 }
    );
  }

  const toneInstruction = TONE_INSTRUCTIONS[body.tone];
  if (!toneInstruction) {
    return Response.json({ error: "올바른 톤을 선택해주세요." }, { status: 400 });
  }

  const contextParts: string[] = [];
  if (body.relationship) contextParts.push(`관계: ${body.relationship}`);
  if (body.purpose) contextParts.push(`목적: ${body.purpose}`);
  if (body.strategy) contextParts.push(`전략: ${body.strategy}`);
  const contextBlock = contextParts.length > 0
    ? `\n상황 맥락:\n${contextParts.join("\n")}\n`
    : "";

  const client = new Anthropic({ apiKey });

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `당신은 10년차 한국인 메신저 소통 전문가입니다.
사용자가 "하고 싶은 말"을 키워드, 메모, 또는 대충 적은 문장으로 입력합니다.
이것을 실제로 보낼 수 있는 완성된 메시지 3가지 버전으로 만들어주세요.

톤: ${toneInstruction}
${contextBlock}
3가지 버전:
1. "핵심 전달형" — 하고 싶은 말의 핵심을 간결하고 명확하게. 군더더기 없이 바로 전달.
2. "공감·배려형" — 상대방 입장을 먼저 배려하고, 부드럽게 전달. 관계를 해치지 않으면서도 의사를 분명히.
3. "상황 맞춤형" — 선택된 상황(관계/목적)에 가장 적합한 표현. 실전에서 바로 쓸 수 있는 완성도.

중요 규칙:
- 각 버전은 서로 확실히 다른 접근 방식이어야 합니다
- 키워드만 입력해도 완전한 문장으로 만들어주세요
- 한국인이 카카오톡/업무 메신저에서 실제로 쓰는 문체로 작성
- 금지 표현: "~의 경우", "~에 대해", "~하는 것이", "~드리고자", "또한", "따라서", "이에"
- 한 문장이 길어지면 끊어서 쓰기. 접속사 대신 마침표.
- 자연스러운 조사 생략 유지

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트를 추가하지 마세요:
{"replies":[{"label":"핵심 전달형","content":"..."},{"label":"공감·배려형","content":"..."},{"label":"상황 맞춤형","content":"..."}]}

사용자가 하고 싶은 말:
${body.intent}`,
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

  let result: { replies: Array<{ label: string; content: string }> };
  try {
    result = JSON.parse(jsonMatch[0]) as { replies: Array<{ label: string; content: string }> };
  } catch {
    return Response.json(
      { error: "AI 응답을 파싱할 수 없습니다. 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  return Response.json({ replies: result.replies, remaining });
}
