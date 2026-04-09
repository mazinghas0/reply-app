import { NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rateLimit";

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

export async function POST(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return Response.json({ success: false, message: "허용되지 않은 요청입니다." }, { status: 403 });
  }

  const { allowed } = await checkRateLimit(req, null, {
    authenticatedLimit: 5,
    anonymousLimit: 5,
    prefix: "waitlist",
  });
  if (!allowed) {
    return Response.json({ success: false, message: "요청이 너무 많습니다. 나중에 다시 시도해주세요." }, { status: 429 });
  }

  const body = await req.json();
  const email = body.email;

  if (!email || typeof email !== "string" || !email.includes("@") || email.length > 200) {
    return Response.json(
      { success: false, message: "올바른 이메일을 입력해주세요" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();
  if (!supabase) {
    return Response.json(
      { success: false, message: "서비스를 사용할 수 없습니다" },
      { status: 500 }
    );
  }

  const { error } = await supabase
    .from("waitlist")
    .insert({ email: email.trim().toLowerCase() });

  if (error) {
    if (error.code === "23505") {
      return Response.json({ success: true, message: "이미 등록된 이메일이에요" });
    }
    return Response.json(
      { success: false, message: "등록에 실패했습니다" },
      { status: 500 }
    );
  }

  return Response.json({ success: true, message: "등록 완료! PRO 출시 시 알려드릴게요" });
}
