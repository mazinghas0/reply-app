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

import { checkAnonymousTotal } from "@/lib/rateLimit";
import { checkAndDeductCredit } from "@/lib/creditSystem";
import { getStylePromptBlock } from "@/lib/styleSystem";
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

  let remaining = 0;
  let maxInputLength = ANONYMOUS_MAX_INPUT;
  let allowSonnet = false;

  if (userId) {
    const credit = await checkAndDeductCredit(userId);
    if (!credit.allowed) {
      return Response.json(
        { error: "이번 달 크레딧을 모두 사용했습니다. 다음 달에 자동 충전됩니다.", remaining: 0, isAuthenticated: true },
        { status: 429 }
      );
    }
    remaining = credit.remaining;
    const planConfig = getPlanConfig(credit.plan);
    maxInputLength = planConfig.maxInputLength;
    allowSonnet = planConfig.allowSonnet;
  } else {
    const anonResult = await checkAnonymousTotal(request, ANONYMOUS_TOTAL_USES);
    if (!anonResult.allowed) {
      return Response.json(
        { error: "체험 5회를 모두 사용했습니다. 로그인하면 매월 10크레딧을 받을 수 있어요.", remaining: 0, isAuthenticated: false },
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

  const body = (await request.json()) as GenerateRequest;

  if (!body.message || !body.tone) {
    return Response.json(
      { error: "메시지와 톤을 모두 입력해주세요." },
      { status: 400 }
    );
  }

  if (body.message.length > maxInputLength) {
    return Response.json(
      { error: `메시지는 ${maxInputLength}자 이내로 입력해주세요.` },
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

  // Sonnet 모델은 Pro/Max 플랜만 사용 가능
  const speed = (body.speed === "quality" && allowSonnet) ? "quality" : "fast";
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
- 불필요한 조사 생략 ("보고서 보내드릴게요" O, "보고서를 보내드리겠습니다" X)
- 금지 표현: "~에 대해", "~의 경우", "또한", "따라서", "~드리고자"
- 실제 한국인이 "사람이 쓴 것 같다"고 느끼게 작성

반드시 아래 JSON 형식으로만 응답하세요:
[
  {"label": "더 강하게", "content": "변형 내용"},
  {"label": "더 부드럽게", "content": "변형 내용"},
  {"label": "더 짧게", "content": "변형 내용"}
]`
    : `당신은 10년차 한국인 메신저 소통 전문가입니다.
아래 메시지에 대한 답장 3개를 만들어주세요.
${contextBlock}${styleBlock}
규칙:
- 한국어 사용 (상대 관계에 맞는 말투 — 친구/썸이면 반말, 상사/거래처면 존댓말)
- 답장 길이는 원본 메시지 길이에 비례 (짧은 카톡엔 1~2줄, 긴 업무 메시지엔 3~4줄)
- 3개 답장은 반드시 서로 다른 전략:
  1번: 핵심만 담은 짧은 답장 (1~2문장)
  2번: 상대방 감정/상황에 공감하는 답장 (감정 언급 + 본론)
  3번: 구체적 행동/제안을 포함한 답장 (다음 단계 제시)
- ${toneDescription} 톤으로 작성

"AI 느낌 제거" 규칙 (가장 중요):
- 한국인이 카카오톡/업무 메신저에서 실제로 보내는 문체로 작성
- 금지 표현: "~에 대해", "~의 경우", "~하는 것이", "또한", "따라서", "그러나", "이에", "~드리고자"
- 금지 패턴: 과도한 존칭 나열, 불필요한 인사 반복, "감사합니다" 남발
- OK 패턴: 조사 생략 ("보고서 보내드릴게요"), 자연스러운 종결 ("~할게요", "~할까요")
- 메신저답게: 한 문장이 길면 끊어서 쓰기, 접속사 대신 마침표로 연결

label 규칙:
- 답장의 특징을 드러내는 3~5글자 (예: "깔끔 수락", "공감 답변", "일정 제안")
- 3개 label이 모두 달라야 함

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트를 추가하지 마세요:
[
  {"label": "답장 특징 3~5글자", "content": "답장 내용"},
  {"label": "답장 특징 3~5글자", "content": "답장 내용"},
  {"label": "답장 특징 3~5글자", "content": "답장 내용"}
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
