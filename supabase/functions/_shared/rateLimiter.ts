export type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

const buckets = new Map<string, { count: number; resetAt: number }>();

export const checkRateLimit = (
  key: string,
  config: RateLimitConfig = { maxRequests: 60, windowMs: 60_000 },
): { allowed: boolean; remaining: number; resetAt: number } => {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + config.windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt };
  }

  if (existing.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetAt: existing.resetAt,
  };
};

export const rateLimitResponse = (resetAt: number) =>
  new Response(JSON.stringify({ error: 'Rate limit exceeded', resetAt }), {
    status: 429,
    headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) },
  });
