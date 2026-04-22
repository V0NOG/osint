import { fetchRssFeed } from './adapters/rss'
import { fetchGdelt } from './adapters/gdelt'
import { fetchAcled } from './adapters/acled'
import { fetchUcdp } from './adapters/ucdp'
import { RSS_FEEDS } from './adapters/sources'
import { normalizeItem, isGeopoliticallyRelevant } from './normalize'
import { filterNewUrls, filterNewEventIds } from './dedup'
import { resolveCountryIds, clearCountryCache } from './resolve'
import { createEvent } from '@/lib/db/events'
import type { RawItem, IngestionResult } from './types'

// ─── Source runners ───────────────────────────────────────────────────────────

async function runRss(): Promise<RawItem[]> {
  const results = await Promise.allSettled(RSS_FEEDS.map((feed) => fetchRssFeed(feed)))
  const items: RawItem[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') items.push(...result.value)
  }
  return items
}

async function runGdelt(): Promise<RawItem[]> {
  return fetchGdelt(75)
}

async function runAcled(): Promise<RawItem[]> {
  return fetchAcled(100)
}

// ─── Main pipeline ────────────────────────────────────────────────────────────

export type IngestionSource = 'rss' | 'gdelt' | 'ucdp' | 'acled' | 'all'

export async function runIngestionPipeline(
  source: IngestionSource = 'all'
): Promise<IngestionResult[]> {
  clearCountryCache()

  let rawItems: RawItem[] = []

  if (source === 'rss' || source === 'all') {
    rawItems.push(...(await runRss()))
  }
  if (source === 'gdelt' || source === 'all') {
    rawItems.push(...(await runGdelt()))
  }
  if (source === 'ucdp' || source === 'all') {
    rawItems.push(...(await fetchUcdp(100)))
  }
  // ACLED requires a paid API licence — skipped unless explicitly selected
  if (source === 'acled') {
    rawItems.push(...(await runAcled()))
  }

  if (rawItems.length === 0) {
    return [{ source, fetched: 0, ingested: 0, skipped: 0, errors: 0, errorMessages: [] }]
  }

  // Filter out non-geopolitical articles (sports, entertainment, lifestyle, etc.)
  const fetched = rawItems.length
  rawItems = rawItems.filter(isGeopoliticallyRelevant)
  const filteredOut = fetched - rawItems.length
  if (filteredOut > 0) {
    console.log(`[pipeline] Filtered out ${filteredOut} non-geopolitical articles`)
  }

  // Dedup by source URL against existing EventSource records
  const allUrls = rawItems.map((i) => i.url)
  const newUrls = await filterNewUrls(allUrls)
  const fresh = rawItems.filter((i) => newUrls.has(i.url))

  // Normalize each fresh item (resolve country IDs in parallel batches)
  const normalized = await Promise.all(
    fresh.map(async (item) => {
      const countryIds = await resolveCountryIds(item.countryHints)
      return normalizeItem(item, countryIds)
    })
  )

  // Dedup by generated event ID (handles hash collisions)
  const newIds = await filterNewEventIds(normalized.map((e) => e.id))
  const toIngest = normalized.filter((e) => newIds.has(e.id))

  const result: IngestionResult = {
    source,
    fetched,
    ingested: 0,
    skipped: filteredOut + (rawItems.length - fresh.length),
    errors: 0,
    errorMessages: [],
  }

  for (const event of toIngest) {
    try {
      await createEvent(event)
      result.ingested++
    } catch (err) {
      result.errors++
      result.errorMessages.push(
        `"${event.title.slice(0, 60)}": ${err instanceof Error ? err.message : String(err)}`
      )
    }
  }

  return [result]
}
