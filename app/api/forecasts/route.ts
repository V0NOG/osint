import { NextResponse } from 'next/server'
import { getForecasts, createForecast } from '@/lib/db/forecasts'
import { CreateForecastSchema } from '@/lib/api/schemas'
import type { ForecastStatus } from '@/lib/types'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as ForecastStatus | null
    const regionId = searchParams.get('regionId')

    const forecasts = await getForecasts({
      ...(status && { status }),
      ...(regionId && { regionId }),
    })
    return NextResponse.json(forecasts)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch forecasts' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = CreateForecastSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const forecast = await createForecast(parsed.data)
    return NextResponse.json(forecast, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create forecast' }, { status: 500 })
  }
}
