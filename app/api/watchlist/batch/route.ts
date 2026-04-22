import { NextResponse } from 'next/server'
import { getCountriesByIds } from '@/lib/db/countries'
import { getEvents } from '@/lib/db/events'
import { getForecasts } from '@/lib/db/forecasts'

interface BatchRequest {
  countryIds?: string[]
  eventIds?: string[]
  forecastIds?: string[]
}

/**
 * POST /api/watchlist/batch
 * Accepts arrays of IDs and returns the full entity objects for each.
 * Used by the watchlist page to hydrate localStorage IDs with real data.
 */
export async function POST(req: Request) {
  try {
    const body: BatchRequest = await req.json()

    const [countries, allEvents, allForecasts] = await Promise.all([
      body.countryIds?.length ? getCountriesByIds(body.countryIds) : Promise.resolve([]),
      body.eventIds?.length
        ? getEvents({ limit: 200 }).then((evs) =>
            evs.filter((e) => body.eventIds!.includes(e.id))
          )
        : Promise.resolve([]),
      body.forecastIds?.length
        ? getForecasts({}).then((fcs) =>
            fcs.filter((f) => body.forecastIds!.includes(f.id))
          )
        : Promise.resolve([]),
    ])

    return NextResponse.json({ countries, events: allEvents, forecasts: allForecasts })
  } catch (err) {
    console.error('[watchlist/batch]', err)
    return NextResponse.json({ error: 'Failed to fetch watchlist data' }, { status: 500 })
  }
}
