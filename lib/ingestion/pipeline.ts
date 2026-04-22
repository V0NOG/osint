import { fetchRssFeed } from './adapters/rss'
import { fetchGdelt } from './adapters/gdelt'
import { fetchUcdp } from './adapters/ucdp'
import { fetchReliefWeb } from './adapters/reliefweb'
import { ALL_RSS_FEEDS, CYBER_FEEDS, TRADE_FEEDS } from './adapters/sources'
import { normalizeItem, isGeopoliticallyRelevant } from './normalize'
import { filterNewUrls, filterNewEventIds } from './dedup'
import { resolveCountryIds, clearCountryCache } from './resolve'
import { findMatchingEvent } from './similarity'
import { createEvent } from '@/lib/db/events'
import { prisma } from '@/lib/db/client'
import type { RawItem, IngestionResult } from './types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Fetch enabled feed list from DB, fall back to static config if DB is empty */
async function getEnabledFeeds() {
  const dbFeeds = await prisma.ingestionFeed.findMany({ where: { enabled: true } })
  if (dbFeeds.length > 0) return dbFeeds
  return ALL_RSS_FEEDS.map((f) => ({ key: f.key, url: f.url, name: f.name }))
}

async function runRss(enabledKeys?: Set<string>): Promise<RawItem[]> {
  const feeds = enabledKeys
    ? ALL_RSS_FEEDS.filter((f) => enabledKeys.has(f.key))
    : ALL_RSS_FEEDS

  const results = await Promise.allSettled(feeds.map((feed) => fetchRssFeed(feed)))
  const items: RawItem[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') items.push(...result.value)
  }
  return items
}

// ─── Multi-source dedup ───────────────────────────────────────────────────────

async function loadRecentEventTitles() {
  const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000)
  const events = await prisma.geopoliticalEvent.findMany({
    where: { createdAt: { gte: cutoff } },
    select: { id: true, title: true, createdAt: true },
  })
  return events
}

async function addSourceToEvent(eventId: string, item: RawItem) {
  await prisma.eventSource.create({
    data: {
      title: item.sourceName,
      url: item.url,
      reliability: 'medium',
      publishedAt: item.publishedAt,
      eventId,
    },
  })
}

// ─── Main pipeline ────────────────────────────────────────────────────────────

export type IngestionSource = 'rss' | 'gdelt' | 'ucdp' | 'reliefweb' | 'cyber' | 'trade' | 'all'

export async function runIngestionPipeline(
  source: IngestionSource = 'all'
): Promise<IngestionResult[]> {
  clearCountryCache()

  // Load enabled feed keys from DB
  const enabledFeedRows = await prisma.ingestionFeed.findMany({
    where: { enabled: true },
    select: { key: true },
  })
  const enabledKeys = enabledFeedRows.length > 0
    ? new Set(enabledFeedRows.map((r) => r.key))
    : null // null = all feeds enabled (DB not seeded yet)

  let rawItems: RawItem[] = []

  if (source === 'rss' || source === 'all') {
    // General + humanitarian + conflict RSS
    const feeds = enabledKeys
      ? ALL_RSS_FEEDS.filter((f) => !['cyber', 'trade'].includes(f.domain ?? '') && enabledKeys.has(f.key))
      : ALL_RSS_FEEDS.filter((f) => !['cyber', 'trade'].includes(f.domain ?? ''))
    const results = await Promise.allSettled(feeds.map((feed) => fetchRssFeed(feed)))
    for (const r of results) {
      if (r.status === 'fulfilled') rawItems.push(...r.value)
    }
  }

  if (source === 'cyber' || source === 'all') {
    const feeds = enabledKeys
      ? CYBER_FEEDS.filter((f) => enabledKeys.has(f.key))
      : CYBER_FEEDS
    const results = await Promise.allSettled(feeds.map((feed) => fetchRssFeed(feed)))
    for (const r of results) {
      if (r.status === 'fulfilled') rawItems.push(...r.value)
    }
  }

  if (source === 'trade' || source === 'all') {
    const feeds = enabledKeys
      ? TRADE_FEEDS.filter((f) => enabledKeys.has(f.key))
      : TRADE_FEEDS
    const results = await Promise.allSettled(feeds.map((feed) => fetchRssFeed(feed)))
    for (const r of results) {
      if (r.status === 'fulfilled') rawItems.push(...r.value)
    }
  }

  if (source === 'gdelt' || source === 'all') {
    if (!enabledKeys || enabledKeys.has('gdelt')) {
      rawItems.push(...(await fetchGdelt(75)))
    }
  }

  if (source === 'ucdp' || source === 'all') {
    if (!enabledKeys || enabledKeys.has('ucdp')) {
      rawItems.push(...(await fetchUcdp(100)))
    }
  }

  if (source === 'reliefweb' || source === 'all') {
    if (!enabledKeys || enabledKeys.has('reliefweb')) {
      rawItems.push(...(await fetchReliefWeb(80)))
    }
  }

  if (rawItems.length === 0) {
    return [{ source, fetched: 0, ingested: 0, skipped: 0, errors: 0, errorMessages: [] }]
  }

  // Only apply keyword filter to GDELT (broad signal) — curated RSS/API sources are pre-filtered
  const FILTER_SOURCES = new Set(['gdelt'])
  const fetched = rawItems.length
  const generalItems = rawItems.filter(
    (i) => FILTER_SOURCES.has(i.sourceKey) ? isGeopoliticallyRelevant(i) : true
  )
  const filteredOut = fetched - generalItems.length

  // Dedup by URL
  const allUrls = generalItems.map((i) => i.url)
  const newUrls = await filterNewUrls(allUrls)
  const fresh = generalItems.filter((i) => newUrls.has(i.url))

  // Load recent events for title-similarity deduplication (multi-source)
  const recentEvents = await loadRecentEventTitles()

  // Normalize fresh items
  const normalized = await Promise.all(
    fresh.map(async (item) => {
      const countryIds = await resolveCountryIds(item.countryHints)
      return { item, event: normalizeItem(item, countryIds) }
    })
  )

  // Dedup by event ID
  const newIds = await filterNewEventIds(normalized.map((n) => n.event.id))

  const result: IngestionResult = {
    source,
    fetched,
    ingested: 0,
    skipped: filteredOut + (generalItems.length - fresh.length),
    errors: 0,
    errorMessages: [],
  }

  // Track titles added this batch for intra-batch dedup
  const batchEvents: Array<{ id: string; title: string; createdAt: Date }> = []

  for (const { item, event } of normalized) {
    // Check multi-source: same event already in DB?
    const matchInDb = findMatchingEvent(event.title, recentEvents)
    if (matchInDb) {
      try {
        await addSourceToEvent(matchInDb, item)
        result.skipped++
      } catch {
        // Source URL might already exist — ignore
      }
      continue
    }

    // Check intra-batch dedup
    const matchInBatch = findMatchingEvent(event.title, batchEvents)
    if (matchInBatch) {
      try {
        await addSourceToEvent(matchInBatch, item)
        result.skipped++
      } catch {
        // ignore
      }
      continue
    }

    // Skip if ID already exists (hash collision)
    if (!newIds.has(event.id)) {
      result.skipped++
      continue
    }

    try {
      await createEvent(event)
      const created = { id: event.id, title: event.title, createdAt: new Date() }
      batchEvents.push(created)
      recentEvents.push(created)
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
