import { NextResponse } from 'next/server'
import { getActors } from '@/lib/db/actors'

export async function GET() {
  try {
    const actors = await getActors()
    return NextResponse.json(actors)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch actors' }, { status: 500 })
  }
}
