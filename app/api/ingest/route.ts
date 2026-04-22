import { NextResponse } from 'next/server'
import { runIngestionPipeline, type IngestionSource } from '@/lib/ingestion/pipeline'

const VALID_SOURCES: IngestionSource[] = ['rss', 'gdelt', 'acled', 'all']

/**
 * POST /api/ingest?source=rss|gdelt|acled|all
 *
 * Protected by INGEST_API_KEY env var.
 * Pass the key as: Authorization: Bearer <key>
 */
export async function POST(req: Request) {
  // API key guard
  const apiKey = process.env.INGEST_API_KEY
  if (apiKey) {
    const auth = req.headers.get('authorization') ?? ''
    const provided = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (provided !== apiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const { searchParams } = new URL(req.url)
  const sourceParam = searchParams.get('source') ?? 'all'

  if (!VALID_SOURCES.includes(sourceParam as IngestionSource)) {
    return NextResponse.json(
      { error: `Invalid source. Must be one of: ${VALID_SOURCES.join(', ')}` },
      { status: 400 }
    )
  }

  try {
    const results = await runIngestionPipeline(sourceParam as IngestionSource)

    const totals = results.reduce(
      (acc, r) => ({
        fetched: acc.fetched + r.fetched,
        ingested: acc.ingested + r.ingested,
        skipped: acc.skipped + r.skipped,
        errors: acc.errors + r.errors,
      }),
      { fetched: 0, ingested: 0, skipped: 0, errors: 0 }
    )

    return NextResponse.json({
      ok: true,
      summary: totals,
      detail: results,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[ingest] Pipeline error:', err)
    return NextResponse.json(
      {
        error: 'Ingestion pipeline failed',
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    )
  }
}
