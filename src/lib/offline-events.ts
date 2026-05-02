import { randomUUID } from "crypto";

export type OfflineEventStream =
  | "attendance"
  | "grade"
  | "competency"
  | "behavior"
  | "material"
  | "announcement"
  | "exam"
  | "device"
  | "system";

export type OfflineEventInput = {
  eventId?: string;
  schoolId: string;
  actorId: string;
  deviceId: string;
  streamType: OfflineEventStream;
  streamId: string;
  action: string;
  lamportVersion: number;
  payload?: Record<string, unknown>;
  schemaVersion?: number;
  clientRecordedAt?: string | null;
  observedEventIds?: string[];
};

type RpcClient = {
  rpc: (
    functionName: string,
    args: Record<string, unknown>
  ) => PromiseLike<{ data: unknown; error: { message?: string } | null }>;
};

export function createOfflineEvent(input: OfflineEventInput): Required<OfflineEventInput> {
  return {
    eventId: input.eventId ?? randomUUID(),
    schoolId: input.schoolId,
    actorId: input.actorId,
    deviceId: input.deviceId,
    streamType: input.streamType,
    streamId: input.streamId,
    action: input.action,
    lamportVersion: input.lamportVersion,
    payload: input.payload ?? {},
    schemaVersion: input.schemaVersion ?? 1,
    clientRecordedAt: input.clientRecordedAt ?? null,
    observedEventIds: input.observedEventIds ?? [],
  };
}

export function validateOfflineEvent(input: OfflineEventInput) {
  if (!input.schoolId) throw new Error("schoolId is required.");
  if (!input.actorId) throw new Error("actorId is required.");
  if (!input.deviceId || input.deviceId.trim().length < 3) throw new Error("deviceId is required.");
  if (!input.streamType) throw new Error("streamType is required.");
  if (!input.streamId) throw new Error("streamId is required.");
  if (!/^[a-z][a-z0-9_]*$/.test(input.action)) throw new Error("action must be snake_case.");
  if (!Number.isInteger(input.lamportVersion) || input.lamportVersion <= 0) {
    throw new Error("lamportVersion must be a positive integer.");
  }
}

export async function appendOfflineEvent(client: RpcClient, input: OfflineEventInput) {
  validateOfflineEvent(input);
  const event = createOfflineEvent(input);
  const { data, error } = await client.rpc("append_offline_event", {
    p_event_id: event.eventId,
    p_school_id: event.schoolId,
    p_actor_id: event.actorId,
    p_device_id: event.deviceId,
    p_stream_type: event.streamType,
    p_stream_id: event.streamId,
    p_action: event.action,
    p_lamport_version: event.lamportVersion,
    p_payload: event.payload,
    p_schema_version: event.schemaVersion,
    p_client_recorded_at: event.clientRecordedAt,
    p_observed_event_ids: event.observedEventIds,
  });

  if (error) throw new Error(error.message ?? "Failed to append offline event.");
  return data;
}
