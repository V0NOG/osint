import { NextResponse } from 'next/server'
import { getEventById } from '@/lib/db/events'

interface RouteParams {
  params: { id: string }
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const event = await getEventById(params.id)
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(event)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}
