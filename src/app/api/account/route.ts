import { auth, clerkClient } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";

export async function DELETE() {
  let userId: string | null = null;
  try {
    const result = await auth();
    userId = result.userId;
  } catch {
    return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  // Supabase 데이터 삭제
  const supabase = getSupabase();
  if (supabase) {
    await Promise.all([
      supabase.from("user_credits").delete().eq("clerk_user_id", userId),
      supabase.from("credit_transactions").delete().eq("clerk_user_id", userId),
      supabase.from("style_samples").delete().eq("clerk_user_id", userId),
      supabase.from("user_presets").delete().eq("clerk_user_id", userId),
    ]);
  }

  // Clerk 계정 삭제
  try {
    const client = await clerkClient();
    await client.users.deleteUser(userId);
  } catch {
    return Response.json(
      { error: "계정 삭제 중 오류가 발생했습니다. 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  return Response.json({ success: true });
}
