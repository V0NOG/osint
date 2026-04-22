import { NextResponse } from 'next/server'
import { searchAll } from '@/lib/db/search'
import { rateLimit, getClientIp } from '@/lib/utils/rate-limit'

export async function GET(req: Request) {
  const ip = getClientIp(req)
  if (!rateLimit(`search:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const limit = Math.min(Number(searchParams.get('limit') ?? '5'), 10)

  if (!q.trim()) {
    return NextResponse.json({ countries: [], events: [], forecasts: [], regions: [] })
  }

  try {
    const results = await searchAll(q, limit)
    return NextResponse.json(results)
  } catch (err) {
    console.error('[search] Error:', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
