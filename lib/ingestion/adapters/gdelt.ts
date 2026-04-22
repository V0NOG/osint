import type { RawItem } from '../types'
import { extractCountryHints, slugify } from '../utils'

interface GdeltArticle {
  url: string
  title: string
  seendate: string
  domain: string
  language: string
  sourcecountry: string
}

interface GdeltResponse {
  articles?: GdeltArticle[]
}

const GDELT_API = 'https://api.gdeltproject.org/api/v2/doc/doc'

const GEOPOLITICAL_QUERY =
  '(conflict OR military OR sanctions OR coup OR protest OR airstrike OR treaty OR diplomacy OR crisis OR invasion OR election OR cybersecurity) sourcelang:english'

export async function fetchGdelt(maxRecords = 50): Promise<RawItem[]> {
  const params = new URLSearchParams({
    query: GEOPOLITICAL_QUERY,
    mode: 'artlist',
    maxrecords: String(maxRecords),
    sort: 'DateDesc',
    format: 'json',
  })

  let data: GdeltResponse
  try {
    const res = await fetch(`${GDELT_API}?${params}`, {
      signal: AbortSignal.timeout(15_000),
      headers: { 'User-Agent': 'OSINT-Forecasting-Platform/1.0' },
    })
    if (!res.ok) {
      const reason = res.status === 429 ? 'rate limited' : `HTTP ${res.status}`
      console.warn(`[gdelt] Skipping — ${reason}`)
      return []
    }
    data = await res.json()
  } catch (err) {
    console.warn('[gdelt] Skipping — fetch failed:', err instanceof Error ? err.message : err)
    return []
  }
  const articles = data.articles ?? []
  const items: RawItem[] = []

  for (const article of articles) {
    if (!article.url || !article.title) continue

    const description = article.title
    const publishedAt = parseGdeltDate(article.seendate)

    items.push({
      externalId: `gdelt::${slugify(article.url)}`,
      title: article.title.trim(),
      description,
      url: article.url,
      publishedAt,
      sourceName: article.domain ?? 'GDELT',
      sourceKey: 'gdelt',
      tags: ['gdelt', 'news'],
      countryHints: [
        ...extractCountryHints(article.title),
        ...(article.sourcecountry ? [article.sourcecountry] : []),
      ],
    })
  }

  return items
}

/** GDELT date format: YYYYMMDDHHMMSS */
function parseGdeltDate(raw: string): Date {
  if (!raw || raw.length < 8) return new Date()
  const y = raw.slice(0, 4)
  const mo = raw.slice(4, 6)
  const d = raw.slice(6, 8)
  const h = raw.slice(8, 10) || '00'
  const mi = raw.slice(10, 12) || '00'
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:00Z`)
}
