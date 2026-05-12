import jwt from "jsonwebtoken";

const OFFLINE_AUTH_SECRET = process.env.OFFLINE_AUTH_SECRET || "default-offline-secret-key-for-local-dev";

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

  return jwt.sign(payload, OFFLINE_AUTH_SECRET);
}

/**
 * Validate an offline token.
 */
export function validateOfflineToken(token: string): OfflineTokenPayload | null {
  try {
    const decoded = jwt.verify(token, OFFLINE_AUTH_SECRET) as OfflineTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}
