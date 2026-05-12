import jwt from "jsonwebtoken";
import { getRequiredSecret } from "./secrets";

function getOfflineAuthSecret() {
  if (process.env.OFFLINE_AUTH_SECRET) return process.env.OFFLINE_AUTH_SECRET;
  if (process.env.NODE_ENV !== "production") return "default-offline-secret-key-for-local-dev";
  return getRequiredSecret("OFFLINE_AUTH_SECRET");
}

export type OfflineTokenPayload = {
  sub: string;
  role: string;
  school_id: string;
  iat: number;
  exp: number;
};

/**
 * Generate a short-lived offline token for use during prolonged internet outages.
 * This should be called when the user successfully authenticates online.
 */
export function generateOfflineToken(user: { id: string; role: string; school_id: string }, expiresInDays = 7): string {
  const payload = {
    sub: user.id,
    role: user.role,
    school_id: user.school_id,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (expiresInDays * 24 * 60 * 60)
  };

  return jwt.sign(payload, getOfflineAuthSecret());
}

/**
 * Validate an offline token.
 */
export function validateOfflineToken(token: string): OfflineTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getOfflineAuthSecret()) as OfflineTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}
