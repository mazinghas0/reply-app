import { getSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
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
