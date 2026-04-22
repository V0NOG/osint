import type { RawItem } from '../types'
import { extractCountryHints, slugify } from '../utils'

interface AcledEvent {
  event_date: string
  event_type: string
  sub_event_type: string
  country: string
  location: string
  notes: string
  fatalities: string | number
  source: string
}

interface AcledResponse {
  data?: AcledEvent[]
  count?: number
}

const ACLED_API = 'https://acleddata.com/api/acled/read'
const ACLED_TOKEN_URL = 'https://acleddata.com/oauth/token'
const FIELDS = 'event_date,event_type,sub_event_type,country,location,notes,fatalities,source'

// In-memory token cache (valid per server process lifetime)
let cachedToken: string | null = null
let tokenExpiresAt = 0

async function getAccessToken(): Promise<string | null> {
  const email = process.env.ACLED_EMAIL
  const password = process.env.ACLED_PASSWORD

  if (!email || !password) {
    console.warn('[acled] ACLED_EMAIL or ACLED_PASSWORD not set — skipping')
    return null
  }

  // Reuse cached token if still valid (with 5-min buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 5 * 60 * 1000) {
    return cachedToken
  }

  try {
    const body = [
      `username=${encodeURIComponent(email)}`,
      `password=${encodeURIComponent(password)}`,
      `grant_type=password`,
      `client_id=acled`,
    ].join('&')

    const res = await fetch(ACLED_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.warn(`[acled] Token request failed — HTTP ${res.status}:`, text)
      return null
    }

    const data = await res.json()
    cachedToken = data.access_token
    tokenExpiresAt = Date.now() + (data.expires_in ?? 86400) * 1000
    return cachedToken
  } catch (err) {
    console.warn('[acled] Token fetch failed:', err instanceof Error ? err.message : err)
    return null
  }
}

export async function fetchAcled(maxRecords = 100): Promise<RawItem[]> {
  const token = await getAccessToken()
  if (!token) return []

  const params = new URLSearchParams({
    limit: String(maxRecords),
    fields: FIELDS,
    _format: 'json',
    event_date: formatDateRange(),
    event_date_where: 'BETWEEN',
  })

  let data: AcledResponse
  try {
    const res = await fetch(`${ACLED_API}?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'OSINT-Forecasting-Platform/1.0',
      },
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      if (res.status === 401) cachedToken = null
      if (res.status === 403) {
        console.warn('[acled] Skipping — account does not have API data access (apply at acleddata.com)')
      } else {
        console.warn(`[acled] Skipping — HTTP ${res.status}`)
      }
      return []
    }

    data = await res.json()
  } catch (err) {
    console.warn('[acled] Skipping — fetch failed:', err instanceof Error ? err.message : err)
    return []
  }

  const events = data.data ?? []
  const items: RawItem[] = []

  for (const ev of events) {
    if (!ev.event_date || !ev.notes) continue

    const title = buildTitle(ev)
    const description = ev.notes.trim()
    const fatalities = Number(ev.fatalities ?? 0)
    const url = buildAcledUrl(ev)
    const publishedAt = new Date(ev.event_date)

    const tags = ['acled', ev.event_type?.toLowerCase().replace(/\s+/g, '-') ?? 'conflict']
    if (fatalities > 0) tags.push('fatalities')

    items.push({
      externalId: `acled::${slugify(url)}`,
      title,
      description: fatalities > 0 ? `${description} (${fatalities} reported fatalities)` : description,
      url,
      publishedAt,
      sourceName: 'ACLED',
      sourceKey: 'acled',
      tags,
      countryHints: [
        ...extractCountryHints(`${title} ${description}`),
        ...(ev.country ? extractCountryHints(ev.country) : []),
      ],
    })
  }

  return items
}

function buildTitle(ev: AcledEvent): string {
  const parts: string[] = []
  if (ev.event_type) parts.push(ev.event_type)
  if (ev.sub_event_type && ev.sub_event_type !== ev.event_type) parts.push(`(${ev.sub_event_type})`)
  if (ev.location) parts.push(`in ${ev.location}`)
  if (ev.country) parts.push(`— ${ev.country}`)
  return parts.join(' ').slice(0, 300)
}

function buildAcledUrl(ev: AcledEvent): string {
  const key = `${ev.event_date}-${ev.country}-${ev.location}-${ev.event_type}`
  return `https://acleddata.com/events/${slugify(key)}`
}

function formatDateRange(): string {
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - 30)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return `${fmt(start)}|${fmt(end)}`
}
