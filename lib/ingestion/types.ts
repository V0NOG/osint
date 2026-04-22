import type { EventType, EventSeverity } from '@/lib/types'

export interface RawItem {
  /** Stable identifier derived from source URL or GUID — used for dedup */
  externalId: string
  title: string
  description: string
  url: string
  publishedAt: Date
  /** Human-readable source name e.g. "Reuters World" */
  sourceName: string
  /** Machine key e.g. "reuters-rss", "gdelt" */
  sourceKey: string
  tags: string[]
  /** Country names or ISO codes mentioned in the content */
  countryHints: string[]
}

export interface NormalizedEvent {
  id: string
  title: string
  summary: string
  eventType: EventType
  severity: EventSeverity
  date: string
  tags: string[]
  locationDescription?: string
  sources: Array<{
    title: string
    url: string
    reliability: 'high' | 'medium' | 'low'
    publishedAt?: string
  }>
  /** DB country IDs resolved from countryHints */
  countryIds: string[]
  actorIds: string[]
}

export interface IngestionResult {
  source: string
  fetched: number
  ingested: number
  skipped: number
  errors: number
  errorMessages: string[]
}
