import { NextResponse } from 'next/server'
import { runIngestionPipeline, type IngestionSource } from '@/lib/ingestion/pipeline'

const VALID_SOURCES: IngestionSource[] = ['rss', 'gdelt', 'acled', 'all']

/**
 * POST /api/admin/ingest?source=...
 * Internal route used by the admin UI — no API key required from the browser.
 * The pipeline runs server-side, so INGEST_API_KEY never needs to leave the server.
 */
export async function POST(req: Request) {
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
    console.error('[admin/ingest] Pipeline error:', err)
    return NextResponse.json(
      { error: 'Ingestion pipeline failed', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
