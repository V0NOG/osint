import { NextResponse } from 'next/server'
import { getActorById } from '@/lib/db/actors'

interface Params {
  params: { id: string }
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const actor = await getActorById(params.id)
    if (!actor) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(actor)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch actor' }, { status: 500 })
  }
}
