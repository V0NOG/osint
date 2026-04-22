import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db/client'

/**
 * POST /api/admin/reset
 *
 * Wipes all ingested events + generated forecasts from the DB.
 * Preserves: users, regions, countries, actors, ingestion feed config.
 * Admin-only.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { confirm } = await req.json().catch(() => ({}))
  if (confirm !== 'RESET') {
    return NextResponse.json(
      { error: 'Send { "confirm": "RESET" } to confirm data wipe' },
      { status: 400 }
    )
  }

  try {
    // Order matters due to FK constraints
    await prisma.forecastEvidence.deleteMany()
    await prisma.forecastHistoryEntry.deleteMany()
    await prisma.forecast.deleteMany()
    await prisma.eventSource.deleteMany()
    await prisma.geopoliticalEvent.deleteMany()

    return NextResponse.json({
      ok: true,
      message: 'Events and forecasts wiped. Regions, countries, actors, and feed config preserved.',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[admin/reset] Error:', err)
    return NextResponse.json(
      { error: 'Reset failed', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
