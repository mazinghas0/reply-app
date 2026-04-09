import { getSupabase } from "./supabase";

export interface Preset {
  id: string;
  name: string;
  tone: string;
  speed: string;
  relationship: string | null;
  relationship_custom: string | null;
  purpose: string | null;
  purpose_custom: string | null;
  strategy: string | null;
  created_at: string;
}

interface SaveInput {
  name: string;
  tone: string;
  speed: string;
  relationship: string | null;
  relationship_custom: string | null;
  purpose: string | null;
  purpose_custom: string | null;
  strategy: string | null;
}

const MAX_PRESETS_PER_USER = 10;

export async function getPresets(userId: string): Promise<Preset[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("user_presets")
    .select("*")
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []) as Preset[];
}

export async function savePreset(
  userId: string,
  input: SaveInput
): Promise<{ success: boolean; preset?: Preset; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "DB 연결 실패" };

  const { count } = await supabase
    .from("user_presets")
    .select("id", { count: "exact", head: true })
    .eq("clerk_user_id", userId);

  if ((count ?? 0) >= MAX_PRESETS_PER_USER) {
    return { success: false, error: `프리셋은 최대 ${MAX_PRESETS_PER_USER}개까지 저장할 수 있어요.` };
  }

  const { data, error } = await supabase
    .from("user_presets")
    .insert({
      clerk_user_id: userId,
      name: input.name,
      tone: input.tone,
      speed: input.speed,
      relationship: input.relationship,
      relationship_custom: input.relationship_custom,
      purpose: input.purpose,
      purpose_custom: input.purpose_custom,
      strategy: input.strategy,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, preset: data as Preset };
}

export async function deletePreset(userId: string, presetId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from("user_presets")
    .delete()
    .eq("id", presetId)
    .eq("clerk_user_id", userId);

  return !error;
}
