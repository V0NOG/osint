/**
 * ReliefWeb API adapter (UN Office for the Coordination of Humanitarian Affairs)
 * Free, no authentication required.
 * Docs: https://apidoc.rwlabs.org/
 *
 * Covers conflict events, humanitarian crises, displacement, and disaster response.
 * Good free replacement for ACLED at the humanitarian/conflict reporting level.
 */
import type { RawItem } from '../types'
import { extractCountryHints, slugify } from '../utils'

interface RWReport {
  id: number
  href: string
  fields: {
    title: string
    body?: string
    date?: { created?: string; changed?: string }
    source?: Array<{ name: string; shortname?: string }>
    country?: Array<{ name: string; iso3?: string }>
    theme?: Array<{ name: string }>
    disaster_type?: Array<{ name: string }>
    url_alias?: string
    origin?: string
  }
}

interface RWResponse {
  data: RWReport[]
  totalCount?: number
}

const RW_API = 'https://api.reliefweb.int/v2/reports'

const GEOPOLITICAL_THEMES = [
  'Conflict and Violence',
  'Peacekeeping and Peacebuilding',
  'Security',
  'Refugees and Internally Displaced Persons',
  'Humanitarian Financing',
  'Recovery and Reconstruction',
]

export async function fetchReliefWeb(maxRecords = 80): Promise<RawItem[]> {
  const appname = process.env.RELIEFWEB_APPNAME
  if (!appname) {
    console.warn('[reliefweb] Skipping — set RELIEFWEB_APPNAME in .env.local (register free at apidoc.reliefweb.int)')
    return []
  }
  const body = {
    limit: maxRecords,
    sort: ['date.created:desc'],
    filter: {
      operator: 'OR',
      conditions: [
        { field: 'theme.name', value: GEOPOLITICAL_THEMES, operator: 'OR' },
        { field: 'disaster_type.name', value: ['Conflict'], operator: 'OR' },
      ],
    },
    fields: {
      include: [
        'title', 'body', 'date', 'source', 'country',
        'theme', 'disaster_type', 'url_alias', 'origin',
      ],
    },
  }

  let data: RWResponse
  try {
    const res = await fetch(`${RW_API}?appname=${encodeURIComponent(appname)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OSINT-Forecasting-Platform/1.0',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
      console.warn(`[reliefweb] Skipping — HTTP ${res.status}`)
      return []
    }

    data = await res.json()
  } catch (err) {
    console.warn('[reliefweb] Skipping — fetch failed:', err instanceof Error ? err.message : err)
    return []
  }

  const items: RawItem[] = []

  for (const report of data.data ?? []) {
    const { fields } = report
    if (!fields.title) continue

    const url = fields.url_alias
      ? `https://reliefweb.int${fields.url_alias}`
      : `https://reliefweb.int/node/${report.id}`

    const sourceName = fields.source?.[0]?.shortname ?? fields.source?.[0]?.name ?? 'ReliefWeb'
    const publishedAt = fields.date?.created
      ? new Date(fields.date.created)
      : new Date()

    const bodyText = (fields.body ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const description = bodyText.slice(0, 600) || fields.title

    const countryNames = (fields.country ?? []).map((c) => c.name)
    const themes = (fields.theme ?? []).map((t) => t.name.toLowerCase().replace(/\s+/g, '-'))

    const tags = ['reliefweb', ...themes.slice(0, 3)]

    items.push({
      externalId: `reliefweb::${report.id}`,
      title: fields.title.trim(),
      description,
      url,
      publishedAt,
      sourceName,
      sourceKey: 'reliefweb',
      tags,
      countryHints: [
        ...countryNames,
        ...extractCountryHints(`${fields.title} ${description}`),
      ],
    })
  }

  return items
}
