import { NextResponse } from "next/server";

import { errorMessage, requireUser } from "@/lib/api-auth";
import { appendOfflineEvent, type OfflineEventInput } from "@/lib/offline-events";

const MAX_BATCH_SIZE = 250;

type SyncRequest = {
  events?: OfflineEventInput[];
};

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

      accepted.push(await appendOfflineEvent(auth.context.supabase, event));
    }

    return NextResponse.json({ accepted });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
