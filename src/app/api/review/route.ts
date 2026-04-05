import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

interface ReviewRequest {
  draft: string;
  context?: string;
}

interface SpellingFix {
  original: string;
  corrected: string;
  reason: string;
}

interface ToneAnalysis {
  label: string;
  score: number;
  detail: string;
}

interface Suggestion {
  original: string;
  improved: string;
  reason: string;
}

interface ReviewResult {
  spelling: SpellingFix[];
  tone: ToneAnalysis;
  impression: string;
  suggestions: Suggestion[];
}

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
  const rateLimitKey = userId ? `review:${userId}` : `review:${clientIp}`;
  const limit = userId ? RATE_LIMIT_AUTHENTICATED : RATE_LIMIT_ANONYMOUS;
  const { allowed, remaining } = checkRateLimit(rateLimitKey, limit);

  if (!allowed) {
    const message = userId
      ? `오늘 검토 사용량을 초과했습니다. (하루 ${RATE_LIMIT_AUTHENTICATED}건)`
      : `오늘 무료 검토 사용량(${RATE_LIMIT_ANONYMOUS}건)을 초과했습니다. 로그인하면 하루 ${RATE_LIMIT_AUTHENTICATED}건까지 사용할 수 있어요.`;
    return Response.json({ error: message, remaining: 0 }, { status: 429 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "서비스 설정 오류입니다. 관리자에게 문의해 주세요." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as ReviewRequest;

  if (!body.draft?.trim()) {
    return Response.json({ error: "검토할 답장을 입력해주세요." }, { status: 400 });
  }

  if (body.draft.length > MAX_DRAFT_LENGTH) {
    return Response.json(
      { error: `답장은 ${MAX_DRAFT_LENGTH}자 이내로 입력해주세요.` },
      { status: 400 }
    );
  }

  const contextBlock = body.context?.trim()
    ? `\n\n참고 — 사용자가 답장하려는 원본 메시지:\n${body.context.trim()}`
    : "";

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `당신은 한국어 커뮤니케이션 전문가입니다.
사용자가 작성한 답장을 분석해 주세요.

분석 항목:
1. 맞춤법/문법 오류 (있으면)
2. 전체적인 톤 분석 (1=매우 차가움 ~ 5=매우 따뜻함)
3. 받는 사람이 이 메시지를 어떻게 느낄지 (2~3문장)
4. 더 나은 표현 개선안 (있으면, 최대 2개)

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트를 추가하지 마세요:
{
  "spelling": [{"original": "틀린 표현", "corrected": "올바른 표현", "reason": "이유"}],
  "tone": {"label": "톤 이름", "score": 3, "detail": "톤 설명 한 줄"},
  "impression": "받는 사람 시점 분석 2~3문장",
  "suggestions": [{"original": "원문", "improved": "개선안", "reason": "이유"}]
}

spelling이나 suggestions가 없으면 빈 배열 []로 응답하세요.

사용자가 작성한 답장:
${body.draft}${contextBlock}`,
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

  const review = JSON.parse(jsonMatch[0]) as ReviewResult;

  return Response.json({ review, remaining });
}
