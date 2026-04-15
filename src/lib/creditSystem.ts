import { getSupabase } from "./supabase";
import { type PlanId, getPlanConfig, validatePlan, CREDIT_COST, ANONYMOUS_MAX_INPUT } from "./planConfig";
import type { InitialAuth } from "@/lib/authTypes";

const REFERRAL_BONUS = 20;

interface CreditCheckResult {
  allowed: boolean;
  remaining: number;
  plan: PlanId;
}

interface UserCredits {
  clerk_user_id: string;
  credits: number;
  credits_reset_at: string;
  referral_code: string;
  plan: string;
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "RE-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getNextResetDate(): string {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return next.toISOString();
}

function isNewMonth(resetAt: string): boolean {
  const reset = new Date(resetAt);
  const now = new Date();
  return (
    now.getUTCFullYear() !== reset.getUTCFullYear() ||
    now.getUTCMonth() !== reset.getUTCMonth()
  );
}

async function ensureUser(userId: string): Promise<UserCredits | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: existing } = await supabase
    .from("user_credits")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (existing) return existing as UserCredits;

  const planConfig = getPlanConfig("free");

  let referralCode = generateReferralCode();
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: created, error } = await supabase
      .from("user_credits")
      .insert({
        clerk_user_id: userId,
        credits: planConfig.monthlyCredits,
        referral_code: referralCode,
        plan: "free",
      })
      .select()
      .single();

    if (created) {
      await supabase.from("credit_transactions").insert({
        clerk_user_id: userId,
        amount: planConfig.monthlyCredits,
        type: "monthly_reset",
        description: "첫 가입 크레딧 지급",
      });
      return created as UserCredits;
    }

    if (error?.code === "23505") {
      referralCode = generateReferralCode();
      continue;
    }

    const { data: retry } = await supabase
      .from("user_credits")
      .select("*")
      .eq("clerk_user_id", userId)
      .single();
    if (retry) return retry as UserCredits;
  }

  return null;
}

export async function checkAndDeductCredit(
  userId: string
): Promise<CreditCheckResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { allowed: true, remaining: 99, plan: "free" };
  }

  const user = await ensureUser(userId);
  if (!user) {
    return { allowed: true, remaining: 99, plan: "free" };
  }

  const plan = validatePlan(user.plan);
  const planConfig = getPlanConfig(plan);

  if (isNewMonth(user.credits_reset_at)) {
    await supabase
      .from("user_credits")
      .update({
        credits: planConfig.monthlyCredits,
        credits_reset_at: new Date().toISOString(),
      })
      .eq("clerk_user_id", userId);

    await supabase.from("credit_transactions").insert({
      clerk_user_id: userId,
      amount: planConfig.monthlyCredits,
      type: "monthly_reset",
      description: "월간 크레딧 리셋",
    });

    return { allowed: true, remaining: planConfig.monthlyCredits - CREDIT_COST, plan };
  }

  if (user.credits < CREDIT_COST) {
    return { allowed: false, remaining: user.credits, plan };
  }

  const newCredits = user.credits - CREDIT_COST;
  await supabase
    .from("user_credits")
    .update({ credits: newCredits })
    .eq("clerk_user_id", userId);

  await supabase.from("credit_transactions").insert({
    clerk_user_id: userId,
    amount: -CREDIT_COST,
    type: "usage",
    description: `답장 기능 사용 (${CREDIT_COST}크레딧)`,
  });

  return { allowed: true, remaining: newCredits, plan };
}

export async function getCredits(userId: string): Promise<{
  credits: number;
  referralCode: string;
  resetAt: string;
  plan: PlanId;
}> {
  const user = await ensureUser(userId);
  if (!user) {
    return { credits: 10, referralCode: "", resetAt: "", plan: "free" };
  }

  const plan = validatePlan(user.plan);
  const planConfig = getPlanConfig(plan);

  if (isNewMonth(user.credits_reset_at)) {
    const supabase = getSupabase();
    if (supabase) {
      await supabase
        .from("user_credits")
        .update({
          credits: planConfig.monthlyCredits,
          credits_reset_at: new Date().toISOString(),
        })
        .eq("clerk_user_id", userId);

      await supabase.from("credit_transactions").insert({
        clerk_user_id: userId,
        amount: planConfig.monthlyCredits,
        type: "monthly_reset",
        description: "월간 크레딧 리셋",
      });
    }
    return {
      credits: planConfig.monthlyCredits,
      referralCode: user.referral_code,
      resetAt: getNextResetDate(),
      plan,
    };
  }

  return {
    credits: user.credits,
    referralCode: user.referral_code,
    resetAt: getNextResetDate(),
    plan,
  };
}

export async function applyReferralCode(
  userId: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, message: "서비스를 사용할 수 없습니다" };

  const { data: existing } = await supabase
    .from("credit_transactions")
    .select("id")
    .eq("clerk_user_id", userId)
    .eq("type", "referral_applied")
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: false, message: "이미 추천 코드를 사용했어요" };
  }

  const { data: referrer } = await supabase
    .from("user_credits")
    .select("clerk_user_id, credits")
    .eq("referral_code", code.toUpperCase().trim())
    .single();

  if (!referrer) {
    return { success: false, message: "존재하지 않는 추천 코드예요" };
  }

  if (referrer.clerk_user_id === userId) {
    return { success: false, message: "본인의 추천 코드는 사용할 수 없어요" };
  }

  const user = await ensureUser(userId);
  if (!user) return { success: false, message: "사용자 정보를 찾을 수 없습니다" };

  await supabase
    .from("user_credits")
    .update({ credits: user.credits + REFERRAL_BONUS })
    .eq("clerk_user_id", userId);

  await supabase.from("credit_transactions").insert({
    clerk_user_id: userId,
    amount: REFERRAL_BONUS,
    type: "referral_applied",
    description: `추천 코드 적용 (추천인: ${referrer.clerk_user_id})`,
  });

  await supabase
    .from("user_credits")
    .update({ credits: referrer.credits + REFERRAL_BONUS })
    .eq("clerk_user_id", referrer.clerk_user_id);

  await supabase.from("credit_transactions").insert({
    clerk_user_id: referrer.clerk_user_id,
    amount: REFERRAL_BONUS,
    type: "referral_bonus",
    description: `추천 보너스 (추천된 사용자: ${userId})`,
  });

  return { success: true, message: `${REFERRAL_BONUS} 크레딧을 받았어요!` };
}

export async function getUserCreditsForSSR(userId: string | null): Promise<InitialAuth> {
  if (!userId) {
    return {
      isAuthenticated: false,
      plan: null,
      credits: null,
      monthlyCredits: 0,
      maxInputLength: ANONYMOUS_MAX_INPUT,
      allowSonnet: false,
      resetAt: null,
      referralCode: "",
    };
  }

  try {
    const { credits, referralCode, resetAt, plan } = await getCredits(userId);
    const planConfig = getPlanConfig(plan);
    return {
      isAuthenticated: true,
      plan,
      credits,
      monthlyCredits: planConfig.monthlyCredits,
      maxInputLength: planConfig.maxInputLength,
      allowSonnet: planConfig.allowSonnet,
      resetAt,
      referralCode,
    };
  } catch {
    return {
      isAuthenticated: true,
      plan: "free",
      credits: null,
      monthlyCredits: 0,
      maxInputLength: ANONYMOUS_MAX_INPUT,
      allowSonnet: false,
      resetAt: null,
      referralCode: "",
    };
  }
}

export { REFERRAL_BONUS };
