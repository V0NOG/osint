import { NextResponse } from 'next/server'
import { getCountryBySlug } from '@/lib/db/countries'

interface RouteParams {
  params: { slug: string }
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const country = await getCountryBySlug(params.slug)
    if (!country) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(country)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch country' }, { status: 500 })
  }
}
