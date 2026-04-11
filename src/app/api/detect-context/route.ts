import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";
import { getPlanConfig, validatePlan } from "@/lib/planConfig";

interface DetectRequest {
  message: string;
}

type RelationshipId =
  | "boss"
  | "colleague"
  | "subordinate"
  | "client"
  | "professor"
  | "senior"
  | "friend"
  | "partner"
  | "crush"
  | "family";

type PurposeId =
  | "accept"
  | "reject"
  | "report"
  | "suggest"
  | "ask"
  | "thank"
  | "apologize"
  | "schedule"
  | "urge"
  | "negotiate"
  | "complain"
  | "comfort"
  | "congrats"
  | "reconcile"
  | "dateAsk"
  | "keepDistance"
  | "appeal"
  | "react"
  | "greet";

const VALID_RELATIONSHIPS: RelationshipId[] = [
  "boss",
  "colleague",
  "subordinate",
  "client",
  "professor",
  "senior",
  "friend",
  "partner",
  "crush",
  "family",
];

const VALID_PURPOSES: PurposeId[] = [
  "accept",
  "reject",
  "report",
  "suggest",
  "ask",
  "thank",
  "apologize",
  "schedule",
  "urge",
  "negotiate",
  "complain",
  "comfort",
  "congrats",
  "reconcile",
  "dateAsk",
  "keepDistance",
  "appeal",
  "react",
  "greet",
];

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

function startOfTodayUtc(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return d.toISOString();
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
    userId = null;
  }

  if (!userId) {
    return Response.json(
      { error: "로그인이 필요한 기능이에요. 로그인하면 하루 3번 무료로 사용할 수 있어요.", requiresLogin: true },
      { status: 401 }
    );
  }

  const supabase = getSupabase();
  if (!supabase) {
    return Response.json({ error: "서비스 설정 오류입니다. 관리자에게 문의해 주세요." }, { status: 500 });
  }

  const { data: userRow } = await supabase
    .from("user_credits")
    .select("plan")
    .eq("clerk_user_id", userId)
    .single();

  const plan = validatePlan(userRow?.plan ?? "free");
  const planConfig = getPlanConfig(plan);
  const dailyLimit = planConfig.detectContextPerDay;

  const { count: usedToday } = await supabase
    .from("credit_transactions")
    .select("id", { count: "exact", head: true })
    .eq("clerk_user_id", userId)
    .eq("type", "context_detect")
    .gte("created_at", startOfTodayUtc());

  const used = usedToday ?? 0;
  if (used >= dailyLimit) {
    return Response.json(
      {
        error: `오늘의 상황 감지 횟수(${dailyLimit}회)를 모두 사용했어요. 내일 다시 이용해 주세요.`,
        remaining: 0,
        limit: dailyLimit,
      },
      { status: 429 }
    );
  }

  const body = (await request.json()) as DetectRequest;
  if (!body.message || typeof body.message !== "string") {
    return Response.json({ error: "메시지를 입력해 주세요." }, { status: 400 });
  }

  const trimmed = body.message.trim();
  if (trimmed.length < 5) {
    return Response.json({ error: "메시지가 너무 짧아서 감지하기 어려워요." }, { status: 400 });
  }
  if (trimmed.length > 1200) {
    return Response.json({ error: "메시지는 1200자 이내로 입력해 주세요." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "서비스 설정 오류입니다." }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });

  const prompt = `당신은 한국인의 메신저 대화 분석 전문가입니다.
아래 받은 메시지를 읽고, 답장을 쓰는 사람 입장에서 "상대 관계"와 "답장 목적"을 추정하세요.

[상대 관계 — 정확히 하나 선택]
- boss: 직장 상사
- colleague: 직장 동료 (같은 직급)
- subordinate: 직장 부하직원
- client: 거래처/비즈니스 파트너
- professor: 교수/선생님
- senior: 학교/군대/동아리 선후배
- friend: 편한 친구
- partner: 연인
- crush: 썸 단계
- family: 가족

[답장 목적 — 정확히 하나 선택]
- accept: 수락
- reject: 거절
- report: 보고
- suggest: 제안/의견 제시/지시
- ask: 질문/부탁/확인
- thank: 감사/격려
- apologize: 사과
- schedule: 일정 조율/약속 잡기
- urge: 독촉
- negotiate: 협상
- complain: 클레임/불만 제기
- comfort: 위로
- congrats: 축하
- reconcile: 화해
- dateAsk: 데이트 신청
- keepDistance: 거리 두기
- appeal: 호소/부탁
- react: 리액션 (어떻게 답할지 애매)
- greet: 안부 인사

받은 메시지:
"""
${trimmed}
"""

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 금지:
{"relationship": "<id>", "purpose": "<id>"}`;

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 80,
      messages: [{ role: "user", content: prompt }],
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

  interface DetectResult {
    relationship: string;
    purpose: string;
  }

  let parsed: DetectResult;
  try {
    parsed = JSON.parse(jsonMatch[0]) as DetectResult;
  } catch {
    return Response.json({ error: "AI 응답을 파싱할 수 없습니다. 다시 시도해 주세요." }, { status: 500 });
  }

  const relationship = parsed.relationship as RelationshipId;
  const purpose = parsed.purpose as PurposeId;

  if (!VALID_RELATIONSHIPS.includes(relationship) || !VALID_PURPOSES.includes(purpose)) {
    return Response.json(
      { error: "감지 결과를 확인할 수 없어요. 직접 선택해 주세요." },
      { status: 422 }
    );
  }

  await supabase.from("credit_transactions").insert({
    clerk_user_id: userId,
    amount: 0,
    type: "context_detect",
    description: `상황 자동 감지 (${relationship}/${purpose})`,
  });

  const remaining = Math.max(0, dailyLimit - used - 1);

  return Response.json({
    relationship,
    purpose,
    remaining,
    limit: dailyLimit,
  });
}
