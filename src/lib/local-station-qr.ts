import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type LocalQrSession = {
  sessionId: string;
  deviceId: string;
  nonce: string;
  status: "pending" | "verified" | "expired";
  issuedAt: string;
  expiresAt: string;
  verifiedAt?: string;
  studentId?: string;
  stationId: string;
  receipt?: string;
};

const LOCAL_STATE_DIR = process.env.EDUOS_LOCAL_STATE_DIR ?? path.join(process.cwd(), ".eduos-local");
const SESSION_FILE = path.join(LOCAL_STATE_DIR, "qr-sessions.json");
const DEFAULT_TTL_MS = 30_000;

function signingSecret() {
  if (process.env.EDUOS_STATION_SIGNING_SECRET) return process.env.EDUOS_STATION_SIGNING_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("EDUOS_STATION_SIGNING_SECRET is required for local QR authority.");
  }
  return "local-development-station-secret";
}

export function stationId() {
  return process.env.EDUOS_STATION_ID ?? "class-station-local";
}

function sign(value: unknown) {
  return createHmac("sha256", signingSecret())
    .update(JSON.stringify(value))
    .digest("base64url");
}

function constantTimeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function signedEnvelope<T extends object>(payload: T) {
  return {
    payload,
    signature: sign(payload),
  };
}

export function verifyEnvelope<T extends object>(envelope: { payload?: T; signature?: string }) {
  if (!envelope.payload || !envelope.signature) return false;
  return constantTimeEquals(sign(envelope.payload), envelope.signature);
}

async function ensureStore() {
  await mkdir(LOCAL_STATE_DIR, { recursive: true });
}

export async function readLocalQrSessions() {
  await ensureStore();
  try {
    const file = await readFile(SESSION_FILE, "utf8");
    return JSON.parse(file) as LocalQrSession[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeLocalQrSessions(sessions: LocalQrSession[]) {
  await ensureStore();
  await writeFile(SESSION_FILE, `${JSON.stringify(sessions, null, 2)}\n`, "utf8");
}

export async function createLocalQrSession(deviceId: string, ttlMs = DEFAULT_TTL_MS) {
  const now = new Date();
  const session: LocalQrSession = {
    sessionId: randomUUID(),
    deviceId,
    nonce: randomUUID(),
    status: "pending",
    issuedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + ttlMs).toISOString(),
    stationId: stationId(),
  };

  const sessions = await readLocalQrSessions();
  sessions.push(session);
  await writeLocalQrSessions(sessions);

  const qrPayload = signedEnvelope({
    typ: "eduportal.local_qr",
    sessionId: session.sessionId,
    deviceId: session.deviceId,
    nonce: session.nonce,
    stationId: session.stationId,
    issuedAt: session.issuedAt,
    expiresAt: session.expiresAt,
  });

  return { session, qrPayload };
}

export async function verifyLocalQrSession(input: {
  qrPayload: { payload?: Record<string, unknown>; signature?: string };
  studentId: string;
  faceVerified: boolean;
}) {
  if (!input.faceVerified) {
    return { ok: false as const, status: 403, error: "Face verification is required before QR unlock." };
  }

  if (!verifyEnvelope(input.qrPayload)) {
    return { ok: false as const, status: 403, error: "QR payload signature is invalid." };
  }

  const payload = input.qrPayload.payload;
  const sessionId = typeof payload?.sessionId === "string" ? payload.sessionId : "";
  const nonce = typeof payload?.nonce === "string" ? payload.nonce : "";
  const deviceId = typeof payload?.deviceId === "string" ? payload.deviceId : "";

  const sessions = await readLocalQrSessions();
  const sessionIndex = sessions.findIndex((session) => session.sessionId === sessionId);
  const session = sessions[sessionIndex];

  if (!session || session.status !== "pending") {
    return { ok: false as const, status: 404, error: "Invalid, expired, or already used QR session." };
  }

  if (session.nonce !== nonce || session.deviceId !== deviceId) {
    return { ok: false as const, status: 403, error: "QR payload does not match the local session." };
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    sessions[sessionIndex] = { ...session, status: "expired" };
    await writeLocalQrSessions(sessions);
    return { ok: false as const, status: 404, error: "Invalid, expired, or already used QR session." };
  }

  const verifiedAt = new Date().toISOString();
  const receiptPayload = {
    typ: "eduportal.local_unlock_receipt",
    sessionId: session.sessionId,
    deviceId: session.deviceId,
    studentId: input.studentId,
    stationId: session.stationId,
    verifiedAt,
  };
  const receipt = signedEnvelope(receiptPayload);

  sessions[sessionIndex] = {
    ...session,
    status: "verified",
    verifiedAt,
    studentId: input.studentId,
    receipt: JSON.stringify(receipt),
  };
  await writeLocalQrSessions(sessions);

  return { ok: true as const, session: sessions[sessionIndex], receipt };
}
