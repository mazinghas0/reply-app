import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPresets, savePreset, deletePreset } from "@/lib/presetSystem";

interface SaveBody {
  name: string;
  tone: string;
  speed: string;
  relationship: string | null;
  relationshipCustom: string | null;
  purpose: string | null;
  purposeCustom: string | null;
  strategy: string | null;
}

export async function GET() {
  let userId: string | null = null;
  try {
    const result = await auth();
    userId = result.userId;
  } catch {
    return Response.json({ presets: [] });
  }
  if (!userId) return Response.json({ presets: [] });

  const presets = await getPresets(userId);
  return Response.json({ presets });
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

  const body = (await request.json()) as SaveBody;
  if (!body.name?.trim()) return Response.json({ error: "이름이 필요합니다." }, { status: 400 });

  const result = await savePreset(userId, {
    name: body.name.trim(),
    tone: body.tone || "polite",
    speed: body.speed || "quality",
    relationship: body.relationship,
    relationship_custom: body.relationshipCustom,
    purpose: body.purpose,
    purpose_custom: body.purposeCustom,
    strategy: body.strategy,
  });

  if (!result.success) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ success: true, preset: result.preset });
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
  const presetId = searchParams.get("id");
  if (!presetId) return Response.json({ error: "ID가 필요합니다." }, { status: 400 });

  const success = await deletePreset(userId, presetId);
  return Response.json({ success });
}
