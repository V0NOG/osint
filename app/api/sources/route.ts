import { NextResponse } from 'next/server'
import { getFeeds, toggleFeed, addCustomFeed, deleteFeed } from '@/lib/db/feeds'
import { z } from 'zod'

export async function GET() {
  try {
    const feeds = await getFeeds()
    return NextResponse.json(feeds)
  } catch (err) {
    console.error('[sources] GET error:', err)
    return NextResponse.json({ error: 'Failed to load feeds' }, { status: 500 })
  }
}

const ToggleSchema = z.object({
  key: z.string(),
  enabled: z.boolean(),
})

const AddSchema = z.object({
  name: z.string().min(2),
  url: z.string().url(),
  domain: z.enum(['general', 'cyber', 'trade', 'humanitarian', 'conflict']),
  reliability: z.enum(['high', 'medium', 'low']).default('medium'),
  tags: z.array(z.string()).default([]),
})

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const parsed = ToggleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const feed = await toggleFeed(parsed.data.key, parsed.data.enabled)
    return NextResponse.json(feed)
  } catch (err) {
    console.error('[sources] PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update feed' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = AddSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    // Generate a stable key from the name
    const key = `custom-${parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`

    const feed = await addCustomFeed({ key, ...parsed.data })
    return NextResponse.json(feed, { status: 201 })
  } catch (err) {
    console.error('[sources] POST error:', err)
    return NextResponse.json({ error: 'Failed to add feed' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const key = searchParams.get('key')
    if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })
    await deleteFeed(key)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[sources] DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete feed' }, { status: 500 })
  }
}
