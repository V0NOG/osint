import type { RawItem, NormalizedEvent } from './types'
import type { EventType, EventSeverity } from '@/lib/types'
import { slugify } from './utils'

// ─── Relevance filter ─────────────────────────────────────────────────────────
// Articles must contain at least one geopolitical keyword to be ingested.
// This drops sports, entertainment, lifestyle, and other off-topic content.

const GEOPOLITICAL_KEYWORDS = [
  // Conflict & security
  'war', 'conflict', 'airstrike', 'missile', 'bomb', 'attack', 'military',
  'troops', 'army', 'navy', 'air force', 'soldier', 'combat', 'battle',
  'offensive', 'invasion', 'coup', 'insurgency', 'rebel', 'militia',
  'drone', 'artillery', 'nuclear', 'weapon', 'ammunition', 'ceasefire',
  'blockade', 'sanctions', 'siege',

  // Diplomacy & politics
  'diplomacy', 'diplomat', 'summit', 'treaty', 'agreement', 'alliance',
  'foreign minister', 'secretary of state', 'president', 'prime minister',
  'government', 'parliament', 'election', 'nato', 'un security council',
  'geopolit', 'bilateral', 'multilateral', 'negotiate', 'peace deal',
  'protest', 'demonstration', 'civil unrest', 'riot',

  // Intelligence & security
  'intelligence', 'spy', 'espionage', 'cyber', 'hack', 'surveillance',
  'terrorism', 'extremism', 'jihadist', 'isis', 'al-qaeda', 'hezbollah',
  'hamas', 'houthi', 'irgc', 'wagner',

  // Economy & resources (geopolitically relevant)
  'strait of hormuz', 'strait', 'chokepoint', 'oil embargo',
  'energy security', 'supply chain', 'critical mineral', 'rare earth',
  'tariff', 'trade war', 'imf', 'world bank', 'debt crisis',

  // Humanitarian
  'refugee', 'displaced', 'famine', 'genocide', 'human rights violation',
  'civilian casualties', 'war crime', 'ethnic cleansing',
]

/**
 * Returns true if the article contains enough geopolitical signal to ingest.
 * Requires at least 1 keyword match in the title+description.
 */
export function isGeopoliticallyRelevant(item: RawItem): boolean {
  const text = `${item.title} ${item.description}`.toLowerCase()
  return GEOPOLITICAL_KEYWORDS.some((kw) => text.includes(kw))
}

// ─── Event type classification ────────────────────────────────────────────────

const EVENT_TYPE_SIGNALS: Array<{ type: EventType; keywords: string[] }> = [
  {
    type: 'military',
    keywords: [
      'airstrike', 'missile', 'troops', 'military', 'army', 'navy', 'air force',
      'drone', 'bomb', 'attack', 'invasion', 'offensive', 'artillery',
      'soldier', 'combat', 'battle', 'clash', 'weapon', 'nuclear', 'ceasefire',
      'blockade', 'siege', 'insurgency', 'militia', 'warship',
    ],
  },
  {
    type: 'diplomatic',
    keywords: [
      'diplomacy', 'talks', 'summit', 'treaty', 'agreement', 'sanction',
      'ambassador', 'embassy', 'foreign minister', 'secretary of state',
      'bilateral', 'multilateral', 'nato', 'un security council',
      'negotiate', 'negotiation', 'peace deal', 'alliance', 'ceasefire',
    ],
  },
  {
    type: 'economic',
    keywords: [
      'trade', 'tariff', 'export', 'import', 'economic', 'gdp', 'inflation',
      'currency', 'oil', 'energy', 'gas', 'pipeline', 'supply chain',
      'investment', 'financial', 'market', 'debt', 'imf', 'world bank',
      'sanctions', 'embargo', 'critical mineral', 'rare earth',
    ],
  },
  {
    type: 'cyber',
    keywords: [
      'cyber', 'hack', 'ransomware', 'malware', 'breach', 'data leak',
      'infrastructure attack', 'ddos', 'espionage', 'intelligence operation',
    ],
  },
  {
    type: 'humanitarian',
    keywords: [
      'humanitarian', 'refugee', 'displaced', 'famine', 'flood', 'earthquake',
      'aid', 'relief', 'civilian casualties', 'death toll', 'evacuation',
      'human rights', 'war crime', 'genocide', 'ethnic cleansing',
    ],
  },
]

// ─── Severity classification ──────────────────────────────────────────────────
// Scored — requires a minimum hit count per tier to avoid over-classifying.

const SEVERITY_SIGNALS: Array<{ severity: EventSeverity; keywords: string[]; minHits: number }> = [
  {
    severity: 'critical',
    minHits: 2,
    keywords: [
      'nuclear', 'mass casualty', 'genocide', 'coup', 'invasion', 'world war',
      'catastrophic', 'collapse', 'imminent threat', 'existential', 'annihilat',
      'regime change', 'chemical weapon', 'biological weapon',
    ],
  },
  {
    severity: 'high',
    minHits: 1,
    keywords: [
      'airstrike', 'killed', 'offensive', 'crisis', 'emergency',
      'escalation', 'conflict', 'war', 'bomb', 'blockade', 'troops deployed',
      'missile strike', 'casualties', 'ceasefire collapsed',
    ],
  },
  {
    severity: 'moderate',
    minHits: 1,
    keywords: [
      'protest', 'tension', 'sanction', 'dispute', 'warning', 'concern',
      'instability', 'threat', 'ceasefire', 'standoff', 'unrest',
    ],
  },
]

function classifyEventType(text: string): EventType {
  const lower = text.toLowerCase()
  let best: EventType = 'political'
  let bestScore = 0

  for (const { type, keywords } of EVENT_TYPE_SIGNALS) {
    const score = keywords.filter((kw) => lower.includes(kw)).length
    if (score > bestScore) {
      bestScore = score
      best = type
    }
  }

  return best
}

function classifyEventSeverity(text: string): EventSeverity {
  const lower = text.toLowerCase()

  for (const { severity, keywords, minHits } of SEVERITY_SIGNALS) {
    const hits = keywords.filter((kw) => lower.includes(kw)).length
    if (hits >= minHits) return severity
  }

  return 'low'
}

// ─── Normalizer ───────────────────────────────────────────────────────────────

export function normalizeItem(
  item: RawItem,
  resolvedCountryIds: string[]
): NormalizedEvent {
  const fullText = `${item.title} ${item.description}`
  const eventType = classifyEventType(fullText)
  const severity = classifyEventSeverity(fullText)

  const summary =
    item.description.length > 600
      ? item.description.slice(0, 597) + '...'
      : item.description || item.title

  const id = `ing-${slugify(item.externalId)}`

  return {
    id,
    title: item.title.slice(0, 300),
    summary,
    eventType,
    severity,
    date: item.publishedAt.toISOString().slice(0, 10),
    tags: item.tags,
    sources: [
      {
        title: item.sourceName,
        url: item.url,
        reliability: 'high',
        publishedAt: item.publishedAt.toISOString(),
      },
    ],
    countryIds: resolvedCountryIds,
    actorIds: [],
  }
}
