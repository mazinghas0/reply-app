import { auth } from "@clerk/nextjs/server";
import { getCredits } from "@/lib/creditSystem";

export async function GET() {
  let userId: string | null = null;
  try {
    const result = await auth();
    userId = result.userId;
  } catch {
    // Clerk not configured
  }

  if (!userId) {
    return Response.json({ credits: null, isAuthenticated: false });
  }

  const { credits, referralCode, resetAt } = await getCredits(userId);

  return Response.json({
    credits,
    referralCode,
    resetAt,
    isAuthenticated: true,
  });
}
