import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

type RefineTone = "natural" | "polite" | "firm" | "flexible" | "friendly" | "shorter" | "pressure_free" | "my_style";

interface RefineRequest {
  draft: string;
  tone: RefineTone;
}

const TONE_INSTRUCTIONS: Record<RefineTone, { instruction: string; freedom: string }> = {
  natural: {
    instruction: "원래 톤을 유지하면서 문장을 매끄럽게 다듬어주세요",
    freedom: "오타/맞춤법 수정 + 어색한 어순 교정 + 불필요한 반복 제거. 의미와 분위기는 그대로, 읽기 편하게만 개선. 예: '그거 제가 했는데요 잘 안됐어요' → '그거 제가 했는데 잘 안 됐어요'",
  },
  polite: {
    instruction: "정중하고 예의 바른 톤으로 바꿔주세요",
    freedom: "존댓말 전환 + 격식 있는 표현. 단, 과도한 존칭 나열은 금지. 예: '그거 해주세요' → '확인 후 진행 부탁드립니다'. '~하시겠습니까' 같은 과도한 격식은 피하고 '~부탁드립니다' 수준으로.",
  },
  firm: {
    instruction: "단호하고 명확한 톤으로 바꿔주세요",
    freedom: "확신 있는 표현 + 군더더기 제거 + 핵심만 전달. 예: '그건 좀 어려울 것 같은데 괜찮으시면...' → '그 일정은 어렵습니다. 다른 방법을 찾아보겠습니다.' 짧고 직접적으로.",
  },
  flexible: {
    instruction: "유연하고 열린 자세의 톤으로 바꿔주세요",
    freedom: "상대 의견 존중 + 여지를 남기는 문장. 예: '안 됩니다' → '다른 방향도 한번 생각해 볼까요?'. '~하면 어떨까요', '~도 괜찮을 것 같아요' 패턴 활용.",
  },
  friendly: {
    instruction: "친근하고 편안한 톤으로 바꿔주세요",
    freedom: "가볍고 부담 없는 표현 + 반말이나 편한 존댓말. 예: '검토 부탁드립니다' → '한번 봐주실 수 있어요?'. 딱딱함을 빼되 무례하지 않게.",
  },
  shorter: {
    instruction: "핵심만 남기고 최대한 짧게 줄여주세요",
    freedom: "불필요한 인사, 사족, 반복 제거. 핵심 메시지만 1~2문장으로. 예: '안녕하세요, 말씀하신 건 확인했고 제가 내일까지 처리해서 보내드리도록 하겠습니다. 감사합니다.' → '확인했습니다. 내일까지 보내드릴게요.' 의미 손실 없이 간결하게.",
  },
  pressure_free: {
    instruction: "상대가 부담 없이 읽을 수 있도록 바꿔주세요",
    freedom: "강요/압박 느낌 제거 + 선택지 제공 + 부드러운 어미. 예: '내일까지 보내주세요' → '내일까지 가능하시면 보내주시면 감사하겠습니다'. '~해주세요'보다 '~해주시면 좋겠어요', '~하면 어떨까요' 패턴. 상대의 상황을 배려하는 표현 추가.",
  },
  my_style: {
    instruction: "사용자의 평소 말투와 최대한 비슷하게 다듬어주세요",
    freedom: "사용자의 말투 패턴(어미, 이모티콘, 문장 길이, 격식 수준)을 최우선으로 반영. 톤이나 격식을 바꾸지 말고, 문장을 매끄럽게만 다듬되 '이 사람이 직접 쓴 것 같은' 느낌을 유지.",
  },
};

import { checkAnonymousTotal } from "@/lib/rateLimit";
import { checkAndDeductCredit } from "@/lib/creditSystem";
import { getPlanConfig, ANONYMOUS_MAX_INPUT, ANONYMOUS_TOTAL_USES } from "@/lib/planConfig";
import { getStylePromptBlock } from "@/lib/styleSystem";

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

  if (!body.draft?.trim()) {
    return Response.json({ error: "다듬을 답장을 입력해주세요." }, { status: 400 });
  }

  if (body.draft.length > maxInputLength) {
    return Response.json(
      { error: `답장은 ${maxInputLength}자 이내로 입력해주세요.` },
      { status: 400 }
    );
  }

  const toneConfig = TONE_INSTRUCTIONS[body.tone];
  if (!toneConfig) {
    return Response.json({ error: "올바른 톤을 선택해주세요." }, { status: 400 });
  }

  // "내 말투처럼" 선택 시 개인화 프롬프트 주입
  const styleBlock = (body.tone === "my_style" && userId) ? await getStylePromptBlock(userId) : "";

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
사용자가 작성한 답장을 다듬어 주세요.
${styleBlock}
목표: ${toneConfig.instruction}
변경 범위: ${toneConfig.freedom}

중요 규칙:
- 원문과 다른 결과를 반드시 만들어주세요. 원문 그대로 반환 금지.
- 오타가 없더라도 문장 흐름, 어순, 표현을 개선하세요.
- 원문보다 길이가 1.5배 이상 늘어나면 안 됩니다.
- 숫자 포맷은 원문 그대로 유지 ("5588건" → "5,588건" 변환 금지)

"AI 느낌 제거" 규칙:
- 한국인이 카카오톡/업무 메신저에서 실제로 쓰는 문체로 작성
- 금지 표현: "~의 경우", "~에 대해", "~하는 것이", "~드리고자", "또한", "따라서", "이에"
- 한 문장이 길어지면 끊어서 쓰기. 접속사 대신 마침표.
- 자연스러운 조사 생략 유지 ("확인했습니다" O, "확인을 했습니다" X)

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
