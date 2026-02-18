/**
 * In-memory rate limiter by key (e.g. IP).
 * Per-instance on Vercel; still reduces abuse from a single IP hitting one instance.
 * For multi-region / heavy abuse, consider Upstash Redis or Vercel KV.
 */

const stores = new Map()

function getStore(windowMs, max) {
  const key = `${windowMs}-${max}`
  if (!stores.has(key)) {
    stores.set(key, new Map())
  }
  return stores.get(key)
}

function prune(store, now, windowMs) {
  for (const [k, v] of store.entries()) {
    if (now - v.first > windowMs) store.delete(k)
  }
}

/**
 * Check rate limit. Returns { ok: true } or { ok: false, retryAfter: seconds }.
 * @param {string} key - e.g. client IP
 * @param {{ windowMs: number, max: number }} options - window in ms, max requests per window
 */
export function rateLimit(key, { windowMs, max }) {
  const store = getStore(windowMs, max)
  const now = Date.now()
  prune(store, now, windowMs)

  const entry = store.get(key)
  if (!entry) {
    store.set(key, { count: 1, first: now })
    return { ok: true }
  }
  if (now - entry.first > windowMs) {
    store.set(key, { count: 1, first: now })
    return { ok: true }
  }
  if (entry.count >= max) {
    const retryAfter = Math.ceil((entry.first + windowMs - now) / 1000)
    return { ok: false, retryAfter: Math.max(1, retryAfter) }
  }
  entry.count += 1
  return { ok: true }
}
