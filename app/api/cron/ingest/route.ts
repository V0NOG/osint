import { NextResponse } from 'next/server'
import { runIngestionPipeline } from '@/lib/ingestion/pipeline'

/**
 * GET /api/cron/ingest
 * Called by Vercel Cron or local dev cron. Protected by CRON_SECRET.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const results = await runIngestionPipeline('all')
    const totals = results.reduce(
      (acc, r) => ({
        fetched: acc.fetched + r.fetched,
        ingested: acc.ingested + r.ingested,
        skipped: acc.skipped + r.skipped,
        errors: acc.errors + r.errors,
      }),
      { fetched: 0, ingested: 0, skipped: 0, errors: 0 }
    )
    console.log(`[cron/ingest] ingested ${totals.ingested} new events`)
    return NextResponse.json({ ok: true, ...totals, timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('[cron/ingest] Failed:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
