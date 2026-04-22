import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getEvents, createEvent } from '@/lib/db/events'
import { CreateEventSchema } from '@/lib/api/schemas'

const EventQuerySchema = z.object({
  severity: z.enum(['critical', 'high', 'moderate', 'low']).optional(),
  eventType: z.enum(['military', 'diplomatic', 'economic', 'political', 'humanitarian', 'cyber']).optional(),
  countryId: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = EventQuerySchema.safeParse({
      severity: searchParams.get('severity') ?? undefined,
      eventType: searchParams.get('eventType') ?? undefined,
      countryId: searchParams.get('countryId') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const events = await getEvents(parsed.data)
    return NextResponse.json(events)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = CreateEventSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const event = await createEvent(parsed.data)
    return NextResponse.json(event, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
