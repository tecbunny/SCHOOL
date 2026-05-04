export const GENERATION_TYPES = [
  "audio_overview",
  "flashcards",
  "quiz",
  "slide_deck",
  "worksheet",
  "exam_paper",
  "grading_report",
] as const;

export type GenerationType = (typeof GENERATION_TYPES)[number];

export type GenerationStatus =
  | "pending"
  | "claimed"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export type JsonObject = Record<string, unknown>;

export type GenerationRow = {
  id: string;
  school_id: string;
  requester_id: string | null;
  class_station_id: string | null;
  source_material_id: string | null;
  generation_type: GenerationType;
  prompt: string;
  input_payload: JsonObject;
  output_payload: JsonObject;
  status: GenerationStatus;
  provider: string;
  provider_model: string | null;
  idempotency_key: string | null;
  priority: number;
  attempt_count: number;
  max_attempts: number;
  error_code: string | null;
  error_message: string | null;
  claimed_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

type SupabaseLike = {
  from: (table: string) => any;
};

export function isGenerationType(value: unknown): value is GenerationType {
  return typeof value === "string" && GENERATION_TYPES.includes(value as GenerationType);
}

export function normalizePriority(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value)) return 5;
  return Math.min(Math.max(value, 0), 10);
}

export function normalizePayload(value: unknown): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as JsonObject;
}

export async function createGeneration(
  supabase: SupabaseLike,
  input: {
    schoolId: string;
    requesterId: string;
    generationType: GenerationType;
    prompt: string;
    inputPayload?: JsonObject;
    sourceMaterialId?: string | null;
    idempotencyKey?: string | null;
    priority?: number;
  }
) {
  const { data, error } = await supabase
    .from("generations")
    .insert({
      school_id: input.schoolId,
      requester_id: input.requesterId,
      generation_type: input.generationType,
      prompt: input.prompt,
      input_payload: input.inputPayload ?? {},
      source_material_id: input.sourceMaterialId ?? null,
      idempotency_key: input.idempotencyKey ?? null,
      priority: input.priority ?? 5,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as GenerationRow;
}

export async function listGenerations(
  supabase: SupabaseLike,
  input: { schoolId: string; requesterId?: string; status?: GenerationStatus; limit?: number }
) {
  let query = supabase
    .from("generations")
    .select("*, generation_assets(*)")
    .eq("school_id", input.schoolId)
    .order("created_at", { ascending: false })
    .limit(input.limit ?? 20);

  if (input.requesterId) query = query.eq("requester_id", input.requesterId);
  if (input.status) query = query.eq("status", input.status);

  const { data, error } = await query;
  if (error) throw error;
  return data as Array<GenerationRow & { generation_assets?: unknown[] }>;
}

export async function claimNextGeneration(
  supabase: SupabaseLike,
  input: { schoolId: string; classStationId: string | null }
) {
  const { data: nextJob, error: selectError } = await supabase
    .from("generations")
    .select("*")
    .eq("school_id", input.schoolId)
    .eq("status", "pending")
    .order("priority", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (selectError) throw selectError;
  if (!nextJob) return null;

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("generations")
    .update({
      status: "claimed",
      class_station_id: input.classStationId,
      claimed_at: now,
      updated_at: now,
      attempt_count: ((nextJob as GenerationRow).attempt_count ?? 0) + 1,
      error_code: null,
      error_message: null,
    })
    .eq("id", (nextJob as GenerationRow).id)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data as GenerationRow | null;
}

export async function markGenerationProcessing(
  supabase: SupabaseLike,
  input: { generationId: string; classStationId?: string | null }
) {
  const now = new Date().toISOString();
  let query = supabase
    .from("generations")
    .update({ status: "processing", started_at: now, updated_at: now })
    .eq("id", input.generationId)
    .in("status", ["claimed", "pending"]);

  if (input.classStationId) query = query.eq("class_station_id", input.classStationId);

  const { data, error } = await query.select("*").single();
  if (error) throw error;
  return data as GenerationRow;
}

export async function completeGeneration(
  supabase: SupabaseLike,
  input: {
    generationId: string;
    schoolId?: string | null;
    classStationId?: string | null;
    outputPayload?: JsonObject;
    assets?: Array<{
      school_id?: string;
      class_station_id?: string | null;
      asset_kind: string;
      storage_scope?: string;
      local_path?: string | null;
      storage_bucket?: string | null;
      storage_object_path?: string | null;
      content_type?: string | null;
      byte_size?: number | null;
      checksum_sha256?: string | null;
      manifest?: JsonObject;
      cached_at?: string | null;
      expires_at?: string | null;
    }>;
  }
) {
  const now = new Date().toISOString();
  let query = supabase
    .from("generations")
    .update({
      status: "completed",
      output_payload: input.outputPayload ?? {},
      completed_at: now,
      updated_at: now,
      error_code: null,
      error_message: null,
    })
    .eq("id", input.generationId);

  if (input.schoolId) query = query.eq("school_id", input.schoolId);
  if (input.classStationId) query = query.eq("class_station_id", input.classStationId);

  const { data: generation, error } = await query.select("*").single();

  if (error) throw error;

  const assetRows = (input.assets ?? []).map((asset) => ({
    generation_id: input.generationId,
    school_id: asset.school_id ?? (generation as GenerationRow).school_id,
    class_station_id: asset.class_station_id ?? (generation as GenerationRow).class_station_id,
    asset_kind: asset.asset_kind,
    storage_scope: asset.storage_scope ?? "edge-cache",
    local_path: asset.local_path ?? null,
    storage_bucket: asset.storage_bucket ?? null,
    storage_object_path: asset.storage_object_path ?? null,
    content_type: asset.content_type ?? null,
    byte_size: asset.byte_size ?? null,
    checksum_sha256: asset.checksum_sha256 ?? null,
    manifest: asset.manifest ?? {},
    cached_at: asset.cached_at ?? now,
    expires_at: asset.expires_at ?? null,
  }));

  if (assetRows.length > 0) {
    const { error: assetError } = await supabase.from("generation_assets").insert(assetRows);
    if (assetError) throw assetError;
  }

  return generation as GenerationRow;
}

export async function failGeneration(
  supabase: SupabaseLike,
  input: {
    generationId: string;
    schoolId?: string | null;
    classStationId?: string | null;
    errorCode?: string | null;
    errorMessage: string;
  }
) {
  const now = new Date().toISOString();
  let query = supabase
    .from("generations")
    .update({
      status: "failed",
      error_code: input.errorCode ?? "GENERATION_FAILED",
      error_message: input.errorMessage,
      updated_at: now,
    })
    .eq("id", input.generationId);

  if (input.schoolId) query = query.eq("school_id", input.schoolId);
  if (input.classStationId) query = query.eq("class_station_id", input.classStationId);

  const { data, error } = await query.select("*").single();

  if (error) throw error;
  return data as GenerationRow;
}
