import { NextResponse } from 'next/server'
import { getRegionBySlug } from '@/lib/db/regions'

interface RouteParams {
  params: { slug: string }
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const region = await getRegionBySlug(params.slug)
    if (!region) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(region)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch region' }, { status: 500 })
  }
}
