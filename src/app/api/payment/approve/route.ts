import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface KakaoApproveResponse {
  aid: string;
  tid: string;
  cid: string;
  sid?: string;
  partner_order_id: string;
  partner_user_id: string;
  payment_method_type: string;
  item_name: string;
  amount: {
    total: number;
    tax_free: number;
    vat: number;
    point: number;
    discount: number;
  };
  approved_at: string;
}

export async function GET(req: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aireply.co.kr";
  const url = new URL(req.url);
  const pgToken = url.searchParams.get("pg_token");

  if (!pgToken) {
    return NextResponse.redirect(`${appUrl}/payment/result?status=fail&reason=no_token`);
  }

  const cid = process.env.KAKAO_PAY_CID;
  const secretKey = process.env.KAKAO_PAY_SECRET_KEY;
  if (!cid || !secretKey) {
    return NextResponse.redirect(`${appUrl}/payment/result?status=fail&reason=config`);
  }

  let userId: string | null = null;
  try {
    const result = await auth();
    userId = result.userId;
  } catch {
    // Clerk not configured
  }

  if (!userId) {
    return NextResponse.redirect(`${appUrl}/sign-in`);
  }

  const cookieStore = await cookies();
  const tid = cookieStore.get("kp_tid")?.value;
  const partnerOrderId = cookieStore.get("kp_order")?.value;

  if (!tid || !partnerOrderId) {
    return NextResponse.redirect(`${appUrl}/payment/result?status=fail&reason=session_expired`);
  }

  const kakaoBody = {
    cid,
    tid,
    partner_order_id: partnerOrderId,
    partner_user_id: userId,
    pg_token: pgToken,
  };

  const kakaoRes = await fetch("https://open-api.kakaopay.com/online/v1/payment/approve", {
    method: "POST",
    headers: {
      Authorization: `SECRET_KEY ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(kakaoBody),
  });

  if (!kakaoRes.ok) {
    return NextResponse.redirect(`${appUrl}/payment/result?status=fail&reason=approve_failed`);
  }

  const kakaoData = (await kakaoRes.json()) as KakaoApproveResponse;

  const response = NextResponse.redirect(
    `${appUrl}/payment/result?status=success&amount=${kakaoData.amount.total}`
  );

  response.cookies.delete("kp_tid");
  response.cookies.delete("kp_order");
  response.cookies.delete("kp_plan");

  return response;
}
