import { getSupabase } from "./supabase";

interface StyleSample {
  id: string;
  original_text: string;
  edited_text: string;
  tone: string | null;
  relationship: string | null;
  created_at: string;
}

interface SaveResult {
  success: boolean;
  count: number;
}

const MIN_SAMPLES_FOR_PERSONALIZATION = 5;
const MAX_SAMPLES_PER_USER = 50;
const PROMPT_SAMPLE_COUNT = 8;

export async function saveStyleSample(
  userId: string,
  original: string,
  edited: string,
  tone?: string,
  relationship?: string
): Promise<SaveResult> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, count: 0 };

  // 원본과 수정본이 동일하면 저장하지 않음
  if (original.trim() === edited.trim()) {
    const { count } = await supabase
      .from("style_samples")
      .select("id", { count: "exact", head: true })
      .eq("clerk_user_id", userId);
    return { success: false, count: count ?? 0 };
  }

  await supabase.from("style_samples").insert({
    clerk_user_id: userId,
    original_text: original,
    edited_text: edited,
    tone: tone ?? null,
    relationship: relationship ?? null,
  });

  // 50건 초과 시 오래된 것 삭제
  const { data: allSamples } = await supabase
    .from("style_samples")
    .select("id, created_at")
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: false });

  if (allSamples && allSamples.length > MAX_SAMPLES_PER_USER) {
    const idsToDelete = allSamples
      .slice(MAX_SAMPLES_PER_USER)
      .map((s) => s.id);
    await supabase
      .from("style_samples")
      .delete()
      .in("id", idsToDelete);
  }

  const currentCount = allSamples ? Math.min(allSamples.length, MAX_SAMPLES_PER_USER) : 1;
  return { success: true, count: currentCount };
}

export async function getStyleSampleCount(userId: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;

  const { count } = await supabase
    .from("style_samples")
    .select("id", { count: "exact", head: true })
    .eq("clerk_user_id", userId);

  return count ?? 0;
}

export async function deleteAllStyleSamples(userId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from("style_samples")
    .delete()
    .eq("clerk_user_id", userId);

  return !error;
}

export async function getStylePromptBlock(userId: string): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) return "";

  const { data: samples } = await supabase
    .from("style_samples")
    .select("original_text, edited_text")
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(PROMPT_SAMPLE_COUNT);

  if (!samples || samples.length < MIN_SAMPLES_FOR_PERSONALIZATION) {
    return "";
  }

  const exampleLines = samples
    .map(
      (s: { original_text: string; edited_text: string }, i: number) =>
        `예시 ${i + 1}:\n- AI 원본: "${s.original_text}"\n- 사용자 수정: "${s.edited_text}"`
    )
    .join("\n\n");

  return `\n[개인화 — 이 사용자의 말투 습관]
이 사용자는 AI가 만든 답장을 다음과 같이 수정하는 경향이 있습니다.
이 패턴을 참고해서, 처음부터 사용자 스타일에 맞는 답장을 생성하세요.

${exampleLines}

위 수정 패턴에서 드러나는 사용자의 말투 특성(어미, 이모티콘 사용, 문장 길이, 격식 수준 등)을 반영하세요.\n`;
}
