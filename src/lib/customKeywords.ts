import { getSupabase } from "./supabase";

export type KeywordKind = "relationship" | "purpose";

export interface CustomKeyword {
  id: string;
  kind: KeywordKind;
  label: string;
  description: string | null;
  created_at: string;
}

interface SaveInput {
  kind: KeywordKind;
  label: string;
  description: string | null;
}

const MAX_KEYWORDS_PER_USER = 30;

export async function getCustomKeywords(userId: string): Promise<CustomKeyword[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("user_custom_keywords")
    .select("id, kind, label, description, created_at")
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []) as CustomKeyword[];
}

export async function saveCustomKeyword(
  userId: string,
  input: SaveInput
): Promise<{ success: boolean; keyword?: CustomKeyword; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "DB 연결 실패" };

  const { count } = await supabase
    .from("user_custom_keywords")
    .select("id", { count: "exact", head: true })
    .eq("clerk_user_id", userId);

  if ((count ?? 0) >= MAX_KEYWORDS_PER_USER) {
    return {
      success: false,
      error: `키워드는 최대 ${MAX_KEYWORDS_PER_USER}개까지 등록할 수 있어요.`,
    };
  }

  const { data, error } = await supabase
    .from("user_custom_keywords")
    .insert({
      clerk_user_id: userId,
      kind: input.kind,
      label: input.label,
      description: input.description,
    })
    .select("id, kind, label, description, created_at")
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, keyword: data as CustomKeyword };
}

export async function deleteCustomKeyword(
  userId: string,
  keywordId: string
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from("user_custom_keywords")
    .delete()
    .eq("id", keywordId)
    .eq("clerk_user_id", userId);

  return !error;
}

export const CUSTOM_KEYWORD_LIMIT = MAX_KEYWORDS_PER_USER;
