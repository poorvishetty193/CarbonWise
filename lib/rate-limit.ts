const cache = new Map<string, { count: number; expiresAt: number }>();

/**
 * Validates request counts against sliding-window limits to prevent API overuse.
 * @param key Unique identifier key (e.g., client IP address).
 * @param limit Allowed transactions boundary per window. Default 10.
 * @param windowMs Expiration interval length in milliseconds. Default 60000 (1 min).
 * @returns Boolean representing if the caller is blocked.
 * @throws {never} This function does not throw.
 */
export function isRateLimited(key: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const record = cache.get(key);

  if (!record) {
    cache.set(key, { count: 1, expiresAt: now + windowMs });
    return false;
  }

  if (now > record.expiresAt) {
    cache.set(key, { count: 1, expiresAt: now + windowMs });
    return false;
  }

  record.count += 1;
  if (record.count > limit) {
    return true;
  }

  return false;
}
