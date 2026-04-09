import { auth } from "@clerk/nextjs/server";
import { getCredits } from "@/lib/creditSystem";
import { getPlanConfig, ANONYMOUS_MAX_INPUT } from "@/lib/planConfig";

export async function GET() {
  let userId: string | null = null;
  try {
    const result = await auth();
    userId = result.userId;
  } catch {
    // Clerk not configured
  }

  if (!userId) {
    return Response.json({
      credits: null,
      isAuthenticated: false,
      plan: null,
      maxInputLength: ANONYMOUS_MAX_INPUT,
      allowSonnet: false,
      monthlyCredits: 0,
    });
  }

  const { credits, referralCode, resetAt, plan } = await getCredits(userId);
  const planConfig = getPlanConfig(plan);

  return Response.json({
    credits,
    referralCode,
    resetAt,
    isAuthenticated: true,
    plan,
    maxInputLength: planConfig.maxInputLength,
    allowSonnet: planConfig.allowSonnet,
    monthlyCredits: planConfig.monthlyCredits,
  });
}
