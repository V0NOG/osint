// Simple sliding-window rate limiter — in-memory, per process.
// Good enough for single-instance / small deploys. For multi-instance (Vercel),
// swap the Map for an Upstash Redis client.

const store = new Map<string, number[]>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const cutoff = now - windowMs
  const hits = (store.get(key) ?? []).filter((t) => t > cutoff)

  if (hits.length >= limit) return false

  hits.push(now)
  store.set(key, hits)
  return true
}

export function getClientIp(req: Request): string {
  const h = req.headers as unknown as { get(name: string): string | null }
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    h.get('x-real-ip') ??
    'unknown'
  )
}

// Periodically sweep stale keys to avoid unbounded memory growth
setInterval(() => {
  const cutoff = Date.now() - 60_000
  store.forEach((hits, key) => {
    const fresh = hits.filter((t: number) => t > cutoff)
    if (fresh.length === 0) store.delete(key)
    else store.set(key, fresh)
  })
}, 60_000)
