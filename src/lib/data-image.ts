const DATA_IMAGE_PATTERN = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/;

export function parseDataImage(value: unknown, maxChars: number) {
  if (typeof value !== "string" || value.length > maxChars) return null;

  const match = DATA_IMAGE_PATTERN.exec(value);
  if (!match) return null;

  const [, mimeType, data] = match;
  return { mimeType, data };
}
