import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { saveStyleSample, getStyleSampleCount } from "@/lib/styleSystem";

interface StyleSaveRequest {
  original: string;
  edited: string;
  tone?: string;
  relationship?: string;
}

export async function POST(request: NextRequest) {
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

  const body = (await request.json()) as StyleSaveRequest;

  if (!body.original || !body.edited) {
    return Response.json({ error: "원본과 수정본이 필요합니다." }, { status: 400 });
  }

  const result = await saveStyleSample(
    userId,
    body.original,
    body.edited,
    body.tone,
    body.relationship
  );

  return Response.json({
    success: result.success,
    count: result.count,
    hasEnough: result.count >= 5,
  });
}

export async function GET() {
  let userId: string | null = null;
  try {
    const result = await auth();
    userId = result.userId;
  } catch {
    return Response.json({ count: 0, hasEnough: false });
  }

  if (!userId) {
    return Response.json({ count: 0, hasEnough: false });
  }

  const count = await getStyleSampleCount(userId);
  return Response.json({ count, hasEnough: count >= 5 });
}
