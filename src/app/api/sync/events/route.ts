import { NextResponse } from "next/server";

import { errorMessage, requireUser } from "@/lib/api-auth";
import { appendOfflineEvent, type OfflineEventInput } from "@/lib/offline-events";

const MAX_BATCH_SIZE = 250;
const EXAM_SUBMISSION_GRACE_MS = 5_000;

type SyncRequest = {
  events?: OfflineEventInput[];
};

function normalizeExamSubmission(event: OfflineEventInput): OfflineEventInput {
  if (event.streamType !== "exam" || event.action !== "test_submitted") return event;

  const payload = event.payload ?? {};
  const endsAt = typeof payload.ends_at === "string" ? new Date(payload.ends_at) : null;
  const submittedAt = typeof payload.submitted_at === "string" ? new Date(payload.submitted_at) : null;

  if (!endsAt || Number.isNaN(endsAt.getTime())) {
    throw new Error("Exam submissions must include a server-issued ends_at timestamp.");
  }
  if (!submittedAt || Number.isNaN(submittedAt.getTime())) {
    throw new Error("Exam submissions must include submitted_at.");
  }

  return {
    ...event,
    payload: {
      ...payload,
      server_received_at: new Date().toISOString(),
      server_timer_status:
        submittedAt.getTime() <= endsAt.getTime() + EXAM_SUBMISSION_GRACE_MS ? "on_time" : "late",
      late_by_seconds: Math.max(
        Math.ceil((submittedAt.getTime() - endsAt.getTime()) / 1000),
        0
      )
    }
  };
}

export async function POST(req: Request) {
  try {
    const auth = await requireUser(["principal", "teacher", "moderator", "student"]);
    if (!auth.ok) return auth.response;

    const body = (await req.json()) as SyncRequest;
    const events = body.events ?? [];

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: "At least one event is required." }, { status: 400 });
    }

    if (events.length > MAX_BATCH_SIZE) {
      return NextResponse.json({ error: `Batch limit is ${MAX_BATCH_SIZE} events.` }, { status: 413 });
    }

    const orderedEvents = [...events].sort((a, b) => {
      if (a.deviceId === b.deviceId) return a.lamportVersion - b.lamportVersion;
      return a.deviceId.localeCompare(b.deviceId);
    });

    const accepted = [];
    for (const event of orderedEvents) {
      if (event.actorId !== auth.context.user.id) {
        return NextResponse.json({ error: "Events can only be synced for the authenticated actor." }, { status: 403 });
      }

      if (event.schoolId !== auth.context.profile.school_id) {
        return NextResponse.json({ error: "Events can only be synced for the actor's school." }, { status: 403 });
      }

      accepted.push(await appendOfflineEvent(auth.context.supabase, normalizeExamSubmission(event)));
    }

    return NextResponse.json({ accepted });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
