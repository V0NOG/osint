import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getRecentEvents } from '@/lib/db/events'
import { getRegions } from '@/lib/db/regions'
import { getCountries } from '@/lib/db/countries'
import { createForecast } from '@/lib/db/forecasts'

/**
 * POST /api/admin/generate-forecasts
 *
 * Uses Claude to analyse recent ingested events and auto-generate structured
 * forecasts for the most significant geopolitical developments.
 *
 * Query params:
 *   limit  — max events to analyse (default 40)
 *   count  — number of forecasts to generate (default 5)
 */
export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not set — add it to .env.local' },
      { status: 503 }
    )
  }

  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? 40), 100)
  const count = Math.min(Number(searchParams.get('count') ?? 5), 10)

  // Fetch context data
  const [events, regions, countries] = await Promise.all([
    getRecentEvents(limit),
    getRegions(),
    getCountries(),
  ])

  if (events.length === 0) {
    return NextResponse.json({ ok: false, error: 'No events in database to analyse' }, { status: 400 })
  }

  const countryById = Object.fromEntries(countries.map((c) => [c.id, c]))
  const regionById = Object.fromEntries(regions.map((r) => [r.id, r]))

  // Build a concise event digest for the prompt
  const eventDigest = events.slice(0, limit).map((ev) => {
    const countryNames = ev.countries.map((id) => countryById[id]?.name).filter(Boolean).join(', ')
    return `[${ev.severity.toUpperCase()}] ${ev.title} (${ev.eventType}, ${ev.date}${countryNames ? `, ${countryNames}` : ''})`
  }).join('\n')

  const regionList = regions.map((r) => `${r.id}: ${r.name}`).join(', ')
  const today = new Date().toISOString().split('T')[0]

  const systemPrompt = `You are a geopolitical intelligence analyst. Your job is to create structured probabilistic forecasts based on recent events. You must return valid JSON and nothing else.`

  const userPrompt = `Based on these ${events.length} recent geopolitical events, generate ${count} high-quality structured forecasts for the most significant ongoing developments.

RECENT EVENTS:
${eventDigest}

AVAILABLE REGIONS (use one of these IDs for "regionId"):
${regionList}

TODAY: ${today}

For each forecast return a JSON object with these exact fields:
{
  "title": "Short forecast title (max 100 chars)",
  "question": "A specific binary question that can be resolved yes or no",
  "targetDate": "YYYY-MM-DD — realistic resolution date (3–12 months from today)",
  "timeHorizon": "e.g. '3 months', '6 months', '1 year'",
  "regionId": "one of the region IDs listed above",
  "countryIds": ["array of country ISO2 codes involved — can be empty if region-wide"],
  "probability": 0.0 to 1.0 (your probability estimate that the question resolves YES),
  "confidenceLevel": "low" | "medium" | "high",
  "rationale": "2–4 sentences explaining why you assigned this probability",
  "confidenceNotes": "1–2 sentences on what factors drive uncertainty",
  "resolutionCriteria": "Concrete, observable criteria for YES resolution",
  "uncertaintyNotes": "Key unknowns or wildcards that could shift the outcome",
  "evidence": [
    {
      "title": "Short label for this piece of evidence",
      "description": "One sentence explaining what the evidence shows",
      "direction": "supporting" | "opposing" | "neutral",
      "weight": "strong" | "moderate" | "weak"
    }
  ],
  "tags": ["2–4 relevant tags like 'russia', 'military', 'nato'"]
}

Return a JSON array of ${count} forecast objects. No markdown, no explanation — pure JSON array.`

  let parsed: any[]
  try {
    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')

    // Strip any accidental markdown fences
    const json = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
    parsed = JSON.parse(json)
    if (!Array.isArray(parsed)) throw new Error('Expected JSON array')
  } catch (err) {
    console.error('[generate-forecasts] Claude error:', err)
    return NextResponse.json(
      { error: 'Failed to generate forecasts from Claude', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }

  // Validate and persist each forecast
  const results: { ok: boolean; id?: string; title?: string; error?: string }[] = []

  for (const raw of parsed) {
    try {
      // Resolve country IDs from ISO2 codes
      const countryIds = (raw.countryIds ?? [])
        .map((iso2: string) => countries.find((c) => c.iso2 === iso2)?.id)
        .filter(Boolean) as string[]

      // Validate regionId
      const regionId = regionById[raw.regionId] ? raw.regionId : regions[0]?.id
      if (!regionId) throw new Error('No valid region found')

      const forecast = await createForecast({
        title: String(raw.title ?? '').slice(0, 100),
        question: String(raw.question ?? ''),
        targetDate: raw.targetDate ?? new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
        timeHorizon: String(raw.timeHorizon ?? '6 months'),
        regionId,
        countryIds,
        probability: Math.max(0, Math.min(1, Number(raw.probability ?? 0.5))),
        confidenceLevel: (['low', 'medium', 'high'] as const).includes(raw.confidenceLevel)
          ? raw.confidenceLevel
          : 'medium',
        rationale: String(raw.rationale ?? ''),
        confidenceNotes: String(raw.confidenceNotes ?? ''),
        resolutionCriteria: String(raw.resolutionCriteria ?? ''),
        uncertaintyNotes: String(raw.uncertaintyNotes ?? ''),
        evidence: Array.isArray(raw.evidence) ? raw.evidence : [],
        tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
      })

      results.push({ ok: true, id: forecast.id, title: forecast.title })
    } catch (err) {
      results.push({ ok: false, title: raw.title, error: err instanceof Error ? err.message : String(err) })
    }
  }

  const saved = results.filter((r) => r.ok).length
  return NextResponse.json({
    ok: true,
    generated: parsed.length,
    saved,
    failed: results.filter((r) => !r.ok).length,
    results,
    eventsAnalysed: events.length,
    timestamp: new Date().toISOString(),
  })
}
