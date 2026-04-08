import { getSupabase } from "./supabase";

const MONTHLY_FREE_CREDITS = 50;
const REFERRAL_BONUS = 20;

interface CreditCheckResult {
  allowed: boolean;
  remaining: number;
}

interface UserCredits {
  clerk_user_id: string;
  credits: number;
  credits_reset_at: string;
  referral_code: string;
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

  // 신규 유저 생성
  let referralCode = generateReferralCode();
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: created, error } = await supabase
      .from("user_credits")
      .insert({
        clerk_user_id: userId,
        credits: MONTHLY_FREE_CREDITS,
        referral_code: referralCode,
      })
      .select()
      .single();

    if (created) {
      // 거래 내역 기록
      await supabase.from("credit_transactions").insert({
        clerk_user_id: userId,
        amount: MONTHLY_FREE_CREDITS,
        type: "monthly_reset",
        description: "첫 가입 크레딧 지급",
      });
      return created as UserCredits;
    }

    // referral_code 중복이면 재생성
    if (error?.code === "23505") {
      referralCode = generateReferralCode();
      continue;
    }

    // 다른 에러 (race condition으로 이미 생성됨)
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
    // Supabase 미설정 시 허용 (개발 환경 폴백)
    return { allowed: true, remaining: 99 };
  }

  const user = await ensureUser(userId);
  if (!user) {
    return { allowed: true, remaining: 99 };
  }

  // 월 리셋 체크
  if (isNewMonth(user.credits_reset_at)) {
    await supabase
      .from("user_credits")
      .update({
        credits: MONTHLY_FREE_CREDITS,
        credits_reset_at: new Date().toISOString(),
      })
      .eq("clerk_user_id", userId);

    await supabase.from("credit_transactions").insert({
      clerk_user_id: userId,
      amount: MONTHLY_FREE_CREDITS,
      type: "monthly_reset",
      description: "월간 크레딧 리셋",
    });

    return { allowed: true, remaining: MONTHLY_FREE_CREDITS - 1 };
  }

  // 잔액 확인
  if (user.credits <= 0) {
    return { allowed: false, remaining: 0 };
  }

  // 1 크레딧 차감
  const newCredits = user.credits - 1;
  await supabase
    .from("user_credits")
    .update({ credits: newCredits })
    .eq("clerk_user_id", userId);

  await supabase.from("credit_transactions").insert({
    clerk_user_id: userId,
    amount: -1,
    type: "usage",
    description: "답장 기능 사용",
  });

  return { allowed: true, remaining: newCredits };
}

export async function getCredits(userId: string): Promise<{
  credits: number;
  referralCode: string;
  resetAt: string;
}> {
  const user = await ensureUser(userId);
  if (!user) {
    return { credits: MONTHLY_FREE_CREDITS, referralCode: "", resetAt: "" };
  }

  // 월 리셋이 필요한 경우 리셋 후 반환
  if (isNewMonth(user.credits_reset_at)) {
    const supabase = getSupabase();
    if (supabase) {
      await supabase
        .from("user_credits")
        .update({
          credits: MONTHLY_FREE_CREDITS,
          credits_reset_at: new Date().toISOString(),
        })
        .eq("clerk_user_id", userId);

      await supabase.from("credit_transactions").insert({
        clerk_user_id: userId,
        amount: MONTHLY_FREE_CREDITS,
        type: "monthly_reset",
        description: "월간 크레딧 리셋",
      });
    }
    return {
      credits: MONTHLY_FREE_CREDITS,
      referralCode: user.referral_code,
      resetAt: getNextResetDate(),
    };
  }

  return {
    credits: user.credits,
    referralCode: user.referral_code,
    resetAt: getNextResetDate(),
  };
}

export async function applyReferralCode(
  userId: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, message: "서비스를 사용할 수 없습니다" };

  // 이미 추천 코드를 사용한 적 있는지 확인
  const { data: existing } = await supabase
    .from("credit_transactions")
    .select("id")
    .eq("clerk_user_id", userId)
    .eq("type", "referral_applied")
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: false, message: "이미 추천 코드를 사용했어요" };
  }

  // 추천 코드 소유자 찾기
  const { data: referrer } = await supabase
    .from("user_credits")
    .select("clerk_user_id, credits")
    .eq("referral_code", code.toUpperCase().trim())
    .single();

  if (!referrer) {
    return { success: false, message: "존재하지 않는 추천 코드예요" };
  }

  // 자기 자신 추천 차단
  if (referrer.clerk_user_id === userId) {
    return { success: false, message: "본인의 추천 코드는 사용할 수 없어요" };
  }

  // 추천받은 사람: 보너스 크레딧 지급
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

  // 추천한 사람: 보너스 크레딧 지급
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

export { MONTHLY_FREE_CREDITS, REFERRAL_BONUS };
