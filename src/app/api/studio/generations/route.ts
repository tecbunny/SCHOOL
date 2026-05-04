import { NextResponse } from "next/server";

import { errorMessage, requireUser } from "@/lib/api-auth";
import {
  createGeneration,
  isGenerationType,
  listGenerations,
  normalizePayload,
  normalizePriority,
  type GenerationStatus,
} from "@/lib/generation-queue";

const MAX_PROMPT_LENGTH = 4_000;
const VALID_STATUSES = new Set<GenerationStatus>([
  "pending",
  "claimed",
  "processing",
  "completed",
  "failed",
  "cancelled",
]);

export async function GET(req: Request) {
  try {
    const auth = await requireUser(["student", "teacher", "principal"]);
    if (!auth.ok) return auth.response;

    const { supabase, profile, user } = auth.context;
    if (!profile.school_id) {
      return NextResponse.json({ error: "School context is required." }, { status: 400 });
    }

    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status");
    const status = statusParam && VALID_STATUSES.has(statusParam as GenerationStatus)
      ? (statusParam as GenerationStatus)
      : undefined;
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 20) || 20, 50);

    const generations = await listGenerations(supabase, {
      schoolId: profile.school_id,
      requesterId: profile.role === "student" ? user.id : undefined,
      status,
      limit,
    });

    return NextResponse.json({ generations });
  } catch (error: unknown) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireUser(["student", "teacher", "principal"]);
    if (!auth.ok) return auth.response;

    const { supabase, profile, user } = auth.context;
    if (!profile.school_id) {
      return NextResponse.json({ error: "School context is required." }, { status: 400 });
    }

    const body = await req.json();
    const generationType = body.generationType ?? body.generation_type;
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!isGenerationType(generationType)) {
      return NextResponse.json({ error: "A valid generation type is required." }, { status: 400 });
    }
    if (prompt.length < 10 || prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: `Prompt must be between 10 and ${MAX_PROMPT_LENGTH} characters.` },
        { status: 400 }
      );
    }
    if (profile.role === "student" && ["exam_paper", "grading_report"].includes(generationType)) {
      return NextResponse.json({ error: "Students cannot request exam papers or grading reports." }, { status: 403 });
    }

    const generation = await createGeneration(supabase, {
      schoolId: profile.school_id,
      requesterId: user.id,
      generationType,
      prompt,
      inputPayload: normalizePayload(body.inputPayload ?? body.input_payload),
      sourceMaterialId: typeof body.sourceMaterialId === "string" ? body.sourceMaterialId : null,
      idempotencyKey: typeof body.idempotencyKey === "string" ? body.idempotencyKey.slice(0, 120) : null,
      priority: normalizePriority(body.priority),
    });

    return NextResponse.json({ generation }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
