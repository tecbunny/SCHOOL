type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

const getClientKey = (req: Request) => {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = req.headers.get("x-real-ip")?.trim();
  return forwarded || realIp || "unknown";
};

export function isRateLimited(
  req: Request,
  scope: string,
  options: { limit: number; windowMs: number }
) {
  const now = Date.now();
  const key = `${scope}:${getClientKey(req)}`;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return false;
  }

  existing.count += 1;
  return existing.count > options.limit;
}

