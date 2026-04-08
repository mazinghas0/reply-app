import { auth } from "@clerk/nextjs/server";
import { applyReferralCode } from "@/lib/creditSystem";

export async function POST(req: Request) {
  let userId: string | null = null;
  try {
    const result = await auth();
    userId = result.userId;
  } catch {
    // Clerk not configured
  }

  if (!userId) {
    return Response.json(
      { success: false, message: "로그인이 필요해요" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const code = body.code;

  if (!code || typeof code !== "string" || code.trim().length < 4) {
    return Response.json(
      { success: false, message: "올바른 추천 코드를 입력해주세요" },
      { status: 400 }
    );
  }

  const result = await applyReferralCode(userId, code);

  return Response.json(result, {
    status: result.success ? 200 : 400,
  });
}
