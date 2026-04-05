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

const MAX_DRAFT_LENGTH = 2000;
const RATE_LIMIT_AUTHENTICATED = 10;
const RATE_LIMIT_ANONYMOUS = 5;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

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

const requestMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function checkRateLimit(
  key: string,
  limit: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = requestMap.get(key);

  if (!record || now > record.resetAt) {
    requestMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
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

  const clientIp = getClientIp(request);
  const rateLimitKey = userId ? `refine:${userId}` : `refine:${clientIp}`;
  const limit = userId ? RATE_LIMIT_AUTHENTICATED : RATE_LIMIT_ANONYMOUS;
  const { allowed, remaining } = checkRateLimit(rateLimitKey, limit);

  if (!allowed) {
    const message = userId
      ? `오늘 리팩토링 사용량을 초과했습니다. (하루 ${RATE_LIMIT_AUTHENTICATED}건)`
      : `오늘 무료 리팩토링 사용량(${RATE_LIMIT_ANONYMOUS}건)을 초과했습니다. 로그인하면 하루 ${RATE_LIMIT_AUTHENTICATED}건까지 사용할 수 있어요.`;
    return Response.json({ error: message, remaining: 0 }, { status: 429 });
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
        content: `당신은 한국어 문장 다듬기 전문가입니다.
사용자가 대충 작성한 답장을 깔끔하게 다듬어주세요.

핵심 규칙:
- 원래 의미와 의도를 반드시 유지하세요
- 맞춤법과 문법 오류를 수정하세요
- 불필요한 내용을 추가하지 마세요
- 원문의 길이를 크게 늘리지 마세요
- ${toneInstruction}

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

  const result = JSON.parse(jsonMatch[0]) as { refined: string };

  return Response.json({ refined: result.refined, remaining });
}
