import { NextResponse } from 'next/server'
import { getForecastById, updateForecast } from '@/lib/db/forecasts'
import { UpdateForecastSchema } from '@/lib/api/schemas'

interface RouteParams {
  params: { id: string }
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const forecast = await getForecastById(params.id)
    if (!forecast) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(forecast)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch forecast' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const body = await req.json()
    const parsed = UpdateForecastSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const forecast = await updateForecast(params.id, parsed.data)
    return NextResponse.json(forecast)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update forecast'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
