import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface SupportRequest {
  messages: ChatMessage[];
}

interface ClassifiedResponse {
  reply: string;
  type: "answer" | "bug" | "feature" | "feedback";
  summary: string;
}

const ALLOWED_ORIGINS = [
  "https://aireply.co.kr",
  "https://www.aireply.co.kr",
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



const SYSTEM_PROMPT = `너는 "리플라이(Reply)" 앱의 AI 고객센터 담당자야. 친절하고 간결하게 답변해.

## 리플라이 앱 정보
- AI가 메시지를 분석해서 톤별 답장 3개를 생성해주는 서비스
- 3개 탭: 답장 만들기 / 답장 검토 / 말하기
- 답장 만들기: 받은 메시지 입력 → 톤 선택(정중/단호/유연/친근) → 답장 3개 생성
- 맞춤형 답장: 관계(11종) > 목적 > 전략(6종) 3단계 선택 가능
- 답장 확장: 생성된 답장을 '더 강하게 / 부드럽게 / 짧게' 조절
- 답장 검토: 내가 쓴 답장의 맞춤법/톤/인상/개선점 분석
- 말하기: 하고 싶은 말을 톤에 맞는 완성된 메시지로
- 사용량: 로그인 10회/일, 비로그인 5회/일 (각 기능 독립)
- PWA: 홈화면 추가로 앱처럼 사용 가능
- 모바일 공유: 안드로이드 공유 메뉴에서 바로 보내기
- Chrome 확장: 우클릭 메뉴로 어디서든 답장 생성

## 응답 규칙
1. 사용법 질문 → 친절하게 답변
2. 버그 신고 → 접수 확인 + 감사 인사
3. 기능 요청 → 접수 확인 + 검토 약속
4. 일반 피드백 → 감사 인사 + 반영 약속
5. 앱과 무관한 질문 → 부드럽게 앱 관련 질문으로 유도

## 출력 형식
반드시 순수 JSON만 출력해. 마크다운 코드블록(\`\`\`json) 사용 금지. 설명 텍스트 금지. JSON 한 줄만 반환.
{"reply":"답변 내용","type":"answer|bug|feature|feedback","summary":"한줄 요약"}

type 분류:
- answer: 사용법 질문에 대한 답변 (신고 불필요)
- bug: 오류/버그 신고
- feature: 기능 요청/개선 제안
- feedback: 사용 후기/일반 의견

reply 규칙: 이모지 사용 금지. 자연스러운 한국어로 답변.`;

async function notifyKevin(type: string, summary: string, detail: string): Promise<void> {
  const typeLabels: Record<string, string> = {
    bug: "버그 신고",
    feature: "기능 요청",
    feedback: "사용자 피드백",
  };
  try {
    await fetch("https://pocket-mission.pages.dev/api/robin-notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": process.env.ROBIN_NOTIFY_SECRET ?? "",
      },
      body: JSON.stringify({
        title: `[리플라이] ${typeLabels[type] ?? type}`,
        body: `${summary}\n---\n${detail.substring(0, 200)}`,
      }),
    });
  } catch {
    // 알림 실패해도 사용자 응답은 정상 진행
  }
}

export async function POST(request: NextRequest) {
  if (!isOriginAllowed(request)) {
    return Response.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
  }

  const { allowed } = await checkRateLimit(request, null, {
    authenticatedLimit: 20,
    anonymousLimit: 20,
    prefix: "support",
  });

  if (!allowed) {
    return Response.json(
      { error: "오늘 문의 한도(20건)를 초과했습니다. 내일 다시 이용해 주세요." },
      { status: 429 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "서비스 설정 오류입니다." }, { status: 500 });
  }

  let body: SupportRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (!body.messages || body.messages.length === 0) {
    return Response.json({ error: "메시지가 필요합니다." }, { status: 400 });
  }

  // 최근 6개 메시지만 유지 (비용 절약)
  const recentMessages = body.messages.slice(-6);

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: recentMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // 마크다운 코드블록 제거 (```json ... ``` → 순수 JSON)
    const text = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    let parsed: ClassifiedResponse;
    try {
      parsed = JSON.parse(text);
    } catch {
      // JSON 파싱 실패 시 텍스트에서 JSON 추출 시도
      const jsonMatch = text.match(/\{[\s\S]*"reply"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          parsed = { reply: rawText.replace(/```(?:json)?|```/g, "").trim(), type: "answer", summary: "" };
        }
      } else {
        parsed = { reply: rawText.replace(/```(?:json)?|```/g, "").trim(), type: "answer", summary: "" };
      }
    }

    // 버그/기능요청/피드백이면 케빈 님에게 알림
    if (parsed.type !== "answer") {
      const userMessage = recentMessages.filter((m) => m.role === "user").pop()?.content ?? "";
      await notifyKevin(parsed.type, parsed.summary, userMessage);
    }

    return Response.json({
      reply: parsed.reply,
      type: parsed.type,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI 응답 생성 실패";
    return Response.json({ error: message }, { status: 500 });
  }
}
