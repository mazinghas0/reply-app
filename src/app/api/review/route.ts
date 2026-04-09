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
        { error: "체험 5회를 모두 사용했습니다. 로그인하면 매월 30크레딧을 받을 수 있어요.", remaining: 0 },
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

  const body = (await request.json()) as ReviewRequest;

  if (!body.draft?.trim()) {
    return Response.json({ error: "검토할 답장을 입력해주세요." }, { status: 400 });
  }

  if (body.draft.length > maxInputLength) {
    return Response.json(
      { error: `답장은 ${maxInputLength}자 이내로 입력해주세요.` },
      { status: 400 }
    );
  }

  const contextBlock = body.context?.trim()
    ? `\n\n참고 — 사용자가 답장하려는 원본 메시지:\n${body.context.trim()}`
    : "";

  const client = new Anthropic({ apiKey });

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `당신은 10년차 한국인 메신저 소통 전문가입니다.
사용자가 작성한 답장을 분석해 주세요.

분석 항목:
1. 맞춤법/문법 오류 (있으면)
   - 순수한 오타와 맞춤법 오류만 잡으세요
   - 오류로 취급하지 않는 것: 조사 생략("밥 먹었어?" OK), 줄임말("ㅇㅋ", "넵"), 메신저 특유 표현
2. 전체적인 톤 분석 (1=매우 차가움/공격적 ~ 5=매우 따뜻함/다정함)
   - label: 한 단어 톤 이름 (예: "사무적", "무난", "다정")
   - detail: 왜 이 톤으로 느껴지는지 구체적 근거 1문장
3. 받는 사람이 이 메시지를 받으면 어떤 감정을 느낄지 (2~3문장)
   - "기분이 좋을 것입니다" 같은 뻔한 분석 금지
   - 구체적인 심리 반응 서술 (예: "업무적으로만 대하는 느낌을 받아 거리감을 느낄 수 있어요")
4. 더 나은 표현 개선안 (있으면, 최대 2개)
   - 이미 잘 쓴 답장이면 suggestions는 빈 배열로

"AI 느낌 제거" 규칙 (개선안 작성 시):
- 개선안(improved)은 한국인이 카카오톡/업무 메신저에서 실제로 쓰는 문체로 작성
- 교과서적/문어체/번역체로 바꾸지 마세요
- 금지: "~의 경우", "~에 대해", "~하는 것이", "~드리고자", "또한", "따라서"
- 조사 생략, 간결한 표현 등 메신저 문체 특성은 존중하세요

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트를 추가하지 마세요:
{
  "spelling": [{"original": "틀린 표현", "corrected": "올바른 표현", "reason": "이유"}],
  "tone": {"label": "톤 이름", "score": 3, "detail": "톤 설명 한 줄"},
  "impression": "받는 사람 시점의 구체적 감정 분석 2~3문장",
  "suggestions": [{"original": "원문 표현", "improved": "개선 표현", "reason": "이유"}]
}

spelling이나 suggestions가 없으면 빈 배열 []로 응답하세요.

사용자가 작성한 답장:
${body.draft}${contextBlock}`,
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

  let review: ReviewResult;
  try {
    review = JSON.parse(jsonMatch[0]) as ReviewResult;
  } catch {
    return Response.json(
      { error: "AI 응답을 파싱할 수 없습니다. 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  return Response.json({ review, remaining });
}
