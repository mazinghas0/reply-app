import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

interface GenerateRequest {
  message: string;
  tone: "polite" | "firm" | "flexible" | "friendly";
  speed?: "fast" | "quality";
}

interface Reply {
  label: string;
  content: string;
}

const TONE_LABELS: Record<GenerateRequest["tone"], string> = {
  polite: "정중하고 예의 바른",
  firm: "단호하고 명확한",
  flexible: "유연하고 열린 자세의",
  friendly: "친근하고 편안한",
};

const MODEL_MAP = {
  fast: "claude-haiku-4-5-20251001",
  quality: "claude-sonnet-4-20250514",
} as const;

const MAX_MESSAGE_LENGTH = 2000;
const RATE_LIMIT_PER_IP = 20;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

const ALLOWED_ORIGINS = [
  "https://reply-app-sepia.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

function isOriginAllowed(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (origin && ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed))) {
    return true;
  }

  if (
    referer &&
    ALLOWED_ORIGINS.some((allowed) => referer.startsWith(allowed))
  ) {
    return true;
  }

  return false;
}

const ipRequestMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = ipRequestMap.get(ip);

  if (!record || now > record.resetAt) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_PER_IP - 1 };
  }

  if (record.count >= RATE_LIMIT_PER_IP) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_PER_IP - record.count };
}

export async function POST(request: NextRequest) {
  if (!isOriginAllowed(request)) {
    return Response.json(
      { error: "허용되지 않은 요청입니다." },
      { status: 403 }
    );
  }

  const clientIp = getClientIp(request);
  const { allowed, remaining } = checkRateLimit(clientIp);

  if (!allowed) {
    return Response.json(
      {
        error: "오늘 사용량을 초과했습니다. 내일 다시 이용해 주세요. (하루 20건)",
        remaining: 0,
      },
      { status: 429 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "서비스 설정 오류입니다. 관리자에게 문의해 주세요." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as GenerateRequest;

  if (!body.message || !body.tone) {
    return Response.json(
      { error: "메시지와 톤을 모두 입력해주세요." },
      { status: 400 }
    );
  }

  if (body.message.length > MAX_MESSAGE_LENGTH) {
    return Response.json(
      { error: `메시지는 ${MAX_MESSAGE_LENGTH}자 이내로 입력해주세요.` },
      { status: 400 }
    );
  }

  const toneDescription = TONE_LABELS[body.tone];

  if (!toneDescription) {
    return Response.json(
      { error: "올바른 톤을 선택해주세요." },
      { status: 400 }
    );
  }

  const speed = body.speed === "fast" ? "fast" : "quality";
  const model = MODEL_MAP[speed];

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model,
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `당신은 한국어 비즈니스 커뮤니케이션 전문가입니다.
아래 메시지에 대한 답장 3개를 만들어주세요.

규칙:
- 한국어 존댓말 사용
- 각 답장은 2~4문장
- 3개 답장은 서로 다른 접근 방식 (같은 톤이지만 내용/전략이 다르게)
- ${toneDescription} 톤으로 작성
- 비즈니스 상황에 적합한 자연스러운 표현

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트를 추가하지 마세요:
[
  {"label": "답장 제목 (3~5글자)", "content": "답장 내용"},
  {"label": "답장 제목 (3~5글자)", "content": "답장 내용"},
  {"label": "답장 제목 (3~5글자)", "content": "답장 내용"}
]

받은 메시지:
${body.message}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");

  if (!textBlock || textBlock.type !== "text") {
    return Response.json(
      { error: "AI 응답을 처리할 수 없습니다." },
      { status: 500 }
    );
  }

  const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/);

  if (!jsonMatch) {
    return Response.json(
      { error: "AI 응답 형식이 올바르지 않습니다." },
      { status: 500 }
    );
  }

  const replies = JSON.parse(jsonMatch[0]) as Reply[];

  return Response.json({ replies, remaining });
}
