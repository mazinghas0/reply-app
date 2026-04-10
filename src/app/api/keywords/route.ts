import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  type KeywordKind,
  getCustomKeywords,
  saveCustomKeyword,
  deleteCustomKeyword,
} from "@/lib/customKeywords";
import { getCredits } from "@/lib/creditSystem";
import { getPlanConfig } from "@/lib/planConfig";

interface SaveBody {
  kind: KeywordKind;
  label: string;
  description?: string;
}

function isValidKind(value: string): value is KeywordKind {
  return value === "relationship" || value === "purpose";
}

export async function GET() {
  let userId: string | null = null;
  try {
    const result = await auth();
    userId = result.userId;
  } catch {
    return Response.json({ keywords: [] });
  }
  if (!userId) return Response.json({ keywords: [] });

  const keywords = await getCustomKeywords(userId);
  return Response.json({ keywords });
}

export async function POST(request: NextRequest) {
  let userId: string | null = null;
  try {
    const result = await auth();
    userId = result.userId;
  } catch {
    return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  if (!userId) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { plan } = await getCredits(userId);
  if (!getPlanConfig(plan).customKeywordsEnabled) {
    return Response.json(
      { error: "맞춤 키워드는 Max 플랜 전용 기능이에요." },
      { status: 403 }
    );
  }

  const body = (await request.json()) as SaveBody;
  if (!body.label?.trim()) {
    return Response.json({ error: "키워드 이름이 필요합니다." }, { status: 400 });
  }
  if (!isValidKind(body.kind)) {
    return Response.json({ error: "잘못된 종류입니다." }, { status: 400 });
  }

  const label = body.label.trim().slice(0, 30);
  const description = body.description?.trim().slice(0, 80) ?? null;

  const result = await saveCustomKeyword(userId, {
    kind: body.kind,
    label,
    description: description && description.length > 0 ? description : null,
  });

  if (!result.success) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json({ success: true, keyword: result.keyword });
}

export async function DELETE(request: NextRequest) {
  let userId: string | null = null;
  try {
    const result = await auth();
    userId = result.userId;
  } catch {
    return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  if (!userId) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const keywordId = searchParams.get("id");
  if (!keywordId) return Response.json({ error: "ID가 필요합니다." }, { status: 400 });

  const success = await deleteCustomKeyword(userId, keywordId);
  return Response.json({ success });
}
