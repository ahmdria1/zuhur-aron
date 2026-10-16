export function allowHitIn(
  store: Map<string, number[]>,
  key: string,
  limit: number,
  windowMs: number,
  now: number,
): boolean {
  const fresh = (store.get(key) ?? []).filter((at) => now - at < windowMs);
  if (fresh.length >= limit) {
    store.set(key, fresh);
    return false;
  }
  fresh.push(now);
  store.set(key, fresh);
  return true;
}

const hits = new Map<string, number[]>();

export function allowHit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  return allowHitIn(hits, key, limit, windowMs, now);
}
