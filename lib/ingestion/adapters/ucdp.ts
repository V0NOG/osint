/**
 * UCDP (Uppsala Conflict Data Program) adapter
 * Free API — no authentication required
 * Docs: https://ucdpapi.pcr.uu.se/apidocs/
 *
 * Fetches recent georeferenced conflict events (GED — UCDP Georeferenced Event Dataset)
 * This is the best free structured replacement for ACLED.
 */
import type { RawItem } from '../types'
import { extractCountryHints, slugify } from '../utils'

interface UcdpEvent {
  id: string
  relid: string
  year: number
  active_year: number
  type_of_violence: number  // 1=state, 2=non-state, 3=one-sided
  conflict_dset_id?: number
  conflict_new_id?: number
  dyad_dset_id?: number
  dyad_new_id?: number
  dyad_name?: string
  conflict_name?: string
  side_a?: string
  side_a_dset_id?: number
  side_a_new_id?: number
  side_b?: string
  side_b_dset_id?: number
  side_b_new_id?: number
  source_article?: string
  source_office?: string
  source_date?: string
  source_headline?: string
  source_original?: string
  where_prec?: number
  where_coordinates?: string
  where_description?: string
  adm_1?: string
  adm_2?: string
  latitude?: number
  longitude?: number
  geom_wkt?: string
  priogrid_gid?: number
  country?: string
  country_id?: number
  region?: string
  event_clarity?: number
  date_prec?: number
  date_start?: string
  date_end?: string
  deaths_a?: number
  deaths_b?: number
  deaths_civilians?: number
  deaths_unknown?: number
  best?: number
  high?: number
  low?: number
  gwnoa?: string
  gwnob?: string
}

interface UcdpResponse {
  Result: UcdpEvent[]
  TotalCount: number
  pageSize: number
  page: number
  totalPages: number
}

const UCDP_API = 'https://ucdpapi.pcr.uu.se/api/gedevents'

const VIOLENCE_TYPE: Record<number, string> = {
  1: 'State-based conflict',
  2: 'Non-state conflict',
  3: 'One-sided violence',
}

export async function fetchUcdp(maxRecords = 100): Promise<RawItem[]> {
  const token = process.env.UCDP_API_TOKEN
  if (!token) {
    console.warn('[ucdp] Skipping — set UCDP_API_TOKEN in .env.local (register free at ucdp.uu.se)')
    return []
  }

  const currentYear = new Date().getFullYear()

  // Fetch current year + previous year to get recent events
  const years = [currentYear, currentYear - 1]
  const allItems: RawItem[] = []

  for (const year of years) {
    const params = new URLSearchParams({
      pagesize: String(Math.ceil(maxRecords / years.length)),
      page: '1',
    })

    let data: UcdpResponse
    try {
      const res = await fetch(`${UCDP_API}/${year}?${params}`, {
        signal: AbortSignal.timeout(12_000),
        headers: {
          'User-Agent': 'OSINT-Forecasting-Platform/1.0',
          Accept: 'application/json',
          'x-ucdp-access-token': token,
        },
      })

      if (!res.ok) {
        console.warn(`[ucdp] Skipping year ${year} — HTTP ${res.status}`)
        continue
      }

      data = await res.json()
    } catch (err) {
      console.warn(`[ucdp] Skipping year ${year} — fetch failed:`, err instanceof Error ? err.message : err)
      continue
    }

    const events = data.Result ?? []

    for (const ev of events) {
      if (!ev.date_start) continue

      const typeLabel = VIOLENCE_TYPE[ev.type_of_violence] ?? 'Armed conflict'
      const country = ev.country ?? ''
      const location = [ev.adm_1, ev.where_description].filter(Boolean).join(', ')
      const title = buildTitle(ev, typeLabel, country, location)
      const description = buildDescription(ev, typeLabel)
      const url = `https://ucdp.uu.se/event/${ev.id ?? ev.relid}`

      const tags = [
        'ucdp',
        typeLabel.toLowerCase().replace(/\s+/g, '-'),
        ...(ev.region ? [ev.region.toLowerCase().replace(/\s+/g, '-')] : []),
      ]

      const totalDeaths = (ev.best ?? 0) + (ev.deaths_civilians ?? 0)
      if (totalDeaths > 0) tags.push('fatalities')
      if (totalDeaths >= 100) tags.push('mass-casualties')

      allItems.push({
        externalId: `ucdp::${ev.id ?? slugify(url)}`,
        title,
        description,
        url,
        publishedAt: new Date(ev.date_start),
        sourceName: 'UCDP',
        sourceKey: 'ucdp',
        tags,
        countryHints: [
          ...extractCountryHints(`${title} ${description} ${country}`),
          ...(country ? extractCountryHints(country) : []),
        ],
      })
    }

    if (allItems.length >= maxRecords) break
  }

  return allItems.slice(0, maxRecords)
}

function buildTitle(ev: UcdpEvent, typeLabel: string, country: string, location: string): string {
  const parts: string[] = [typeLabel]

  if (ev.side_a && ev.side_b) {
    parts.push(`— ${ev.side_a} vs. ${ev.side_b}`)
  } else if (ev.dyad_name) {
    parts.push(`— ${ev.dyad_name}`)
  } else if (ev.conflict_name) {
    parts.push(`— ${ev.conflict_name}`)
  }

  if (location) parts.push(`in ${location}`)
  else if (country) parts.push(`in ${country}`)

  return parts.join(' ').slice(0, 300)
}

function buildDescription(ev: UcdpEvent, typeLabel: string): string {
  const parts: string[] = []

  if (ev.source_headline) {
    parts.push(ev.source_headline)
  } else {
    parts.push(`${typeLabel} event recorded by UCDP`)
  }

  const deaths = ev.best ?? 0
  const civilian = ev.deaths_civilians ?? 0
  if (deaths > 0) {
    parts.push(`Estimated ${deaths} battle-related deaths.`)
  }
  if (civilian > 0) {
    parts.push(`${civilian} civilian deaths reported.`)
  }

  if (ev.source_article) {
    parts.push(`Source: ${ev.source_article}`)
  }

  return parts.join(' ').slice(0, 600)
}
