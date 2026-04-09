import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

interface GenerateRequest {
  message: string;
  tone: "polite" | "firm" | "flexible" | "friendly";
  speed?: "fast" | "quality";
  hint?: string;
  relationship?: string;
  purpose?: string;
  strategy?: string;
  expand?: { original: string; variant: "stronger" | "softer" | "shorter" };
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

import { checkRateLimit } from "@/lib/rateLimit";
import { checkAndDeductCredit } from "@/lib/creditSystem";
import { getStylePromptBlock } from "@/lib/styleSystem";

const MAX_MESSAGE_LENGTH = 500;

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

export async function POST(request: NextRequest) {
  if (!isOriginAllowed(request)) {
    return Response.json(
      { error: "허용되지 않은 요청입니다." },
      { status: 403 }
    );
  }

  let userId: string | null = null;
  try {
    const result = await auth();
    userId = result.userId;
  } catch {
    // Clerk not configured — use anonymous rate limiting
  }

  // 로그인 유저: 월간 크레딧, 비로그인: 일일 제한
  let remaining = 0;
  if (userId) {
    const credit = await checkAndDeductCredit(userId);
    if (!credit.allowed) {
      return Response.json(
        { error: "이번 달 크레딧을 모두 사용했습니다. 다음 달에 자동 충전됩니다.", remaining: 0, isAuthenticated: true },
        { status: 429 }
      );
    }
    remaining = credit.remaining;
  } else {
    const rateResult = await checkRateLimit(request, null, {
      authenticatedLimit: 10,
      anonymousLimit: 3,
      prefix: "generate",
    });
    if (!rateResult.allowed) {
      return Response.json(
        { error: "무료 사용량(3회)을 초과했습니다. 로그인하면 매월 50크레딧을 받을 수 있어요.", remaining: 0, isAuthenticated: false },
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
  const hintBlock = body.hint?.trim()
    ? `\n사용자가 원하는 답장 방향: ${body.hint.trim()}\n이 방향에 맞춰서 답장을 작성하세요.`
    : "";

  // 맞춤 컨텍스트 블록
  const contextParts: string[] = [];
  if (body.relationship) contextParts.push(`상대 관계: ${body.relationship}`);
  if (body.purpose) contextParts.push(`답장 목적: ${body.purpose}`);
  if (body.strategy) contextParts.push(`커뮤니케이션 전략: ${body.strategy}`);
  const contextBlock = contextParts.length > 0
    ? `\n[맞춤 설정]\n${contextParts.join("\n")}\n위 설정에 맞춰 답장을 작성하세요. 특히 전략이 지정된 경우 해당 심리학 원리를 반영하세요.\n`
    : "";

  // 개인화 프롬프트 (로그인 유저, 5건 이상 스타일 샘플 시)
  const styleBlock = userId ? await getStylePromptBlock(userId) : "";

  // 확장 모드 (기존 답장 강도 조절)
  const expandData = body.expand;
  const isExpand = !!expandData;
  const expandPrompt = isExpand && expandData
    ? `아래는 이미 생성된 답장입니다. 이 답장을 기반으로 3가지 변형을 만들어주세요:
1번: 더 강하게 (더 직접적이고 명확하게)
2번: 더 부드럽게 (더 조심스럽고 공손하게)
3번: 더 짧게 (핵심만 간결하게)

원본 답장:
${expandData.original}

받은 메시지:
${body.message}`
    : "";

  const client = new Anthropic({ apiKey });

  const mainPrompt = isExpand
    ? `당신은 한국인의 메신저 소통 전문가입니다.
${expandPrompt}

"AI 느낌 제거" 규칙 (가장 중요):
- 한국인이 카카오톡/업무 메신저에서 실제로 보내는 문체로 작성
- 교과서적/문어체/번역체 표현 절대 금지
- 불필요한 조사 자연스럽게 생략
- 실제 한국인이 "사람이 쓴 것 같다"고 느끼게 작성

반드시 아래 JSON 형식으로만 응답하세요:
[
  {"label": "더 강하게", "content": "변형 내용"},
  {"label": "더 부드럽게", "content": "변형 내용"},
  {"label": "더 짧게", "content": "변형 내용"}
]`
    : `당신은 한국인의 메신저 소통 전문가입니다.
아래 메시지에 대한 답장 3개를 만들어주세요.
${contextBlock}${styleBlock}
규칙:
- 한국어 사용 (상대 관계에 맞는 말투 — 친구/썸이면 반말도 OK, 상사/거래처면 존댓말)
- 답장 길이는 상황에 맞게 자연스럽게 (짧은 메시지엔 짧게, 중요한 내용엔 길게)
- 3개 답장은 각각 다른 접근: 하나는 간결하게, 하나는 공감 위주, 하나는 구체적으로
- ${toneDescription} 톤으로 작성

"AI 느낌 제거" 규칙 (가장 중요):
- 한국인이 카카오톡/업무 메신저에서 실제로 보내는 문체로 작성
- 교과서적/문어체/번역체 표현 절대 금지
- 불필요한 조사(가, 을, 는, 에) 자연스럽게 생략
- 과도한 쉼표, 접속사("또한", "그러나", "따라서") 사용 자제
- "~의 경우", "~에 대해", "~하는 것이" 같은 번역체 금지
- 실제 한국인이 메시지를 받았을 때 "사람이 쓴 것 같다"고 느끼게 작성

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트를 추가하지 마세요:
[
  {"label": "답장 제목 (3~5글자)", "content": "답장 내용"},
  {"label": "답장 제목 (3~5글자)", "content": "답장 내용"},
  {"label": "답장 제목 (3~5글자)", "content": "답장 내용"}
]

받은 메시지:
${body.message}${hintBlock}`;

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model,
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: mainPrompt,
        },
      ],
    });
  } catch {
    return Response.json(
      { error: "AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해 주세요." },
      { status: 502 }
    );
  }

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

  let replies: Reply[];
  try {
    replies = JSON.parse(jsonMatch[0]) as Reply[];
  } catch {
    return Response.json(
      { error: "AI 응답을 파싱할 수 없습니다. 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  return Response.json({ replies, remaining, isAuthenticated: !!userId });
}
