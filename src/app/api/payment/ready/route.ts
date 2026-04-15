import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { PLANS, type PlanId } from "@/lib/planConfig";

interface ReadyRequest {
  plan: PlanId;
}

interface KakaoReadyResponse {
  tid: string;
  next_redirect_pc_url: string;
  next_redirect_mobile_url: string;
  next_redirect_app_url: string;
  android_app_scheme: string;
  ios_app_scheme: string;
  created_at: string;
}

function isPaidPlan(plan: string): plan is Exclude<PlanId, "free"> {
  return plan === "plus" || plan === "pro" || plan === "max";
}

export async function POST(req: Request) {
  const cid = process.env.KAKAO_PAY_CID;
  const secretKey = process.env.KAKAO_PAY_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aireply.co.kr";

  if (!cid || !secretKey) {
    return Response.json(
      { error: "결제 시스템 준비 중입니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  let userId: string | null = null;
  try {
    const result = await auth();
    userId = result.userId;
  } catch {
    // Clerk not configured
  }

  if (!userId) {
    return Response.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  let body: ReadyRequest;
  try {
    body = (await req.json()) as ReadyRequest;
  } catch {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (!isPaidPlan(body.plan)) {
    return Response.json({ error: "유효한 플랜이 아닙니다." }, { status: 400 });
  }

  const planConfig = PLANS[body.plan];
  const partnerOrderId = `reply_${userId}_${Date.now()}`;
  const itemName = `리플라이 ${planConfig.label} 플랜 (월 정기결제)`;

  const kakaoBody = {
    cid,
    partner_order_id: partnerOrderId,
    partner_user_id: userId,
    item_name: itemName,
    quantity: 1,
    total_amount: planConfig.price,
    tax_free_amount: 0,
    approval_url: `${appUrl}/api/payment/approve`,
    cancel_url: `${appUrl}/payment/result?status=cancel`,
    fail_url: `${appUrl}/payment/result?status=fail`,
  };

  const kakaoRes = await fetch("https://open-api.kakaopay.com/online/v1/payment/ready", {
    method: "POST",
    headers: {
      Authorization: `SECRET_KEY ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(kakaoBody),
  });

  if (!kakaoRes.ok) {
    const errorText = await kakaoRes.text();
    return Response.json(
      { error: "카카오페이 결제 준비에 실패했습니다.", detail: errorText },
      { status: 502 }
    );
  }

  const kakaoData = (await kakaoRes.json()) as KakaoReadyResponse;

  const cookieStore = await cookies();
  cookieStore.set("kp_tid", kakaoData.tid, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  cookieStore.set("kp_order", partnerOrderId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  cookieStore.set("kp_plan", body.plan, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return Response.json({
    redirect_pc_url: kakaoData.next_redirect_pc_url,
    redirect_mobile_url: kakaoData.next_redirect_mobile_url,
  });
}
