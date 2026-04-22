import { NextResponse } from 'next/server'
import { resolveForecast } from '@/lib/db/forecasts'
import { ResolveForecastSchema } from '@/lib/api/schemas'

interface RouteParams {
  params: { id: string }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const body = await req.json()
    const parsed = ResolveForecastSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const forecast = await resolveForecast(params.id, parsed.data)
    return NextResponse.json(forecast)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to resolve forecast'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
