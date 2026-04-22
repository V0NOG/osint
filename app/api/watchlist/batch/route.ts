import { NextResponse } from 'next/server'
import { getCountriesByIds } from '@/lib/db/countries'
import { getEventsByIds } from '@/lib/db/events'
import { getForecastsByIds } from '@/lib/db/forecasts'

interface BatchRequest {
  countryIds?: string[]
  eventIds?: string[]
  forecastIds?: string[]
}

export async function POST(req: Request) {
  try {
    const body: BatchRequest = await req.json()

    const [countries, events, forecasts] = await Promise.all([
      body.countryIds?.length ? getCountriesByIds(body.countryIds) : Promise.resolve([]),
      body.eventIds?.length ? getEventsByIds(body.eventIds) : Promise.resolve([]),
      body.forecastIds?.length ? getForecastsByIds(body.forecastIds) : Promise.resolve([]),
    ])

    return NextResponse.json({ countries, events, forecasts })
  } catch (err) {
    console.error('[watchlist/batch]', err)
    return NextResponse.json({ error: 'Failed to fetch watchlist data' }, { status: 500 })
  }
}
