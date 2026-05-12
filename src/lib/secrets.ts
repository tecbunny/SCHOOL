import { timingSafeEqual } from "crypto";

export function getRequiredSecret(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

export function safeSecretEquals(actual: unknown, expected: unknown) {
  if (typeof actual !== "string" || typeof expected !== "string") return false;
  if (!actual || !expected) return false;

  const actualBuffer = Buffer.from(actual, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  if (actualBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(actualBuffer, expectedBuffer);
}
