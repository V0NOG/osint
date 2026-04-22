import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getForecasts } from '@/lib/db/forecasts'
import { updateForecast } from '@/lib/db/forecasts'
import { getRecentEvents } from '@/lib/db/events'
import { getCountries } from '@/lib/db/countries'

/**
 * GET /api/cron/update-forecasts
 *
 * Uses Claude to re-evaluate each active forecast against the latest ingested events.
 * If the probability has shifted by more than 3 percentage points, it records a new
 * history entry so the chart and version trail stay current.
 *
 * Called by Vercel Cron or local dev cron. Protected by CRON_SECRET.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 503 })
  }

  // Load context
  const [activeForecastsRaw, recentEvents, countries] = await Promise.all([
    getForecasts({ status: 'active' }),
    getRecentEvents(60),
    getCountries(),
  ])

  const activeForecasts = activeForecastsRaw.slice(0, 15) // cap to avoid huge prompts
  if (activeForecasts.length === 0) {
    return NextResponse.json({ ok: true, message: 'No active forecasts to update', updated: 0 })
  }

  const countryById = Object.fromEntries(countries.map((c) => [c.id, c]))
  const today = new Date().toISOString().split('T')[0]

  // Build event digest
  const eventDigest = recentEvents.map((ev) => {
    const countryNames = ev.countries.map((id) => countryById[id]?.name).filter(Boolean).join(', ')
    return `[${ev.severity.toUpperCase()}] ${ev.title} (${ev.eventType}, ${ev.date}${countryNames ? `, ${countryNames}` : ''})`
  }).join('\n')

  // Build forecast list for the prompt
  const forecastList = activeForecasts.map((f, i) => {
    const countryNames = f.countries.map((id) => countryById[id]?.name).filter(Boolean).join(', ')
    return `${i + 1}. ID: ${f.id}
   Question: ${f.question}
   Current probability: ${Math.round(f.probability * 100)}%
   Confidence: ${f.confidenceLevel}
   Target date: ${f.targetDate}
   Countries: ${countryNames || 'N/A'}
   Rationale: ${f.rationale.slice(0, 200)}`
  }).join('\n\n')

  const prompt = `You are a geopolitical intelligence analyst. Today is ${today}.

Below are ${activeForecasts.length} active forecasts and the ${recentEvents.length} most recent events ingested into the system.

RECENT EVENTS:
${eventDigest}

ACTIVE FORECASTS:
${forecastList}

For each forecast, assess whether the recent events meaningfully change the probability.
Only flag a forecast for update if the evidence is clear and the shift is at least 3 percentage points.

Return a JSON array. For forecasts that should NOT be updated, set "update": false.
For those that should, set "update": true and provide new values.

[
  {
    "id": "fc-...",
    "update": false
  },
  {
    "id": "fc-...",
    "update": true,
    "newProbability": 0.72,
    "newConfidence": "medium",
    "changeReason": "One sentence explaining what new event shifted the probability and why"
  }
]

Return ONLY the JSON array. No markdown, no explanation.`

  let parsed: Array<{
    id: string
    update: boolean
    newProbability?: number
    newConfidence?: string
    changeReason?: string
  }>

  try {
    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')

    const json = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
    parsed = JSON.parse(json)
    if (!Array.isArray(parsed)) throw new Error('Expected JSON array')
  } catch (err) {
    console.error('[cron/update-forecasts] Claude error:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }

  // Apply updates
  const results: { id: string; updated: boolean; error?: string }[] = []

  for (const item of parsed) {
    if (!item.update) {
      results.push({ id: item.id, updated: false })
      continue
    }

    try {
      const prob = Math.max(0, Math.min(1, Number(item.newProbability ?? 0.5)))
      const conf = (['low', 'medium', 'high'] as const).find((c) => c === item.newConfidence) ?? 'medium'

      await updateForecast(item.id, {
        probability: prob,
        confidenceLevel: conf,
        changeReason: item.changeReason ?? 'Auto-updated based on recent events',
      })

      results.push({ id: item.id, updated: true })
    } catch (err) {
      results.push({ id: item.id, updated: false, error: String(err) })
    }
  }

  const updatedCount = results.filter((r) => r.updated).length
  console.log(`[cron/update-forecasts] Updated ${updatedCount}/${activeForecasts.length} forecasts`)

  return NextResponse.json({
    ok: true,
    evaluated: activeForecasts.length,
    updated: updatedCount,
    results,
    timestamp: new Date().toISOString(),
  })
}
