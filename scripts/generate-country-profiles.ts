#!/usr/bin/env tsx
/**
 * One-time generation script: uses Claude to populate riskCategories,
 * summaries, keyTensions, and key actors for every stub country.
 *
 * Resume-safe — saves progress after each batch.
 * Run:  npx tsx scripts/generate-country-profiles.ts
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })

// ── Types ─────────────────────────────────────────────────────────────────────

interface RiskCategories {
  political: number
  military: number
  economic: number
  social: number
  environmental: number
}

interface GeneratedProfile {
  iso2: string
  summary: string
  riskCategories: RiskCategories
  keyTensions: string[]
}

interface GeneratedActor {
  id: string
  name: string
  type: 'state' | 'non_state' | 'individual' | 'international_org'
  role: string
  riskContribution: 'high' | 'medium' | 'low'
  description: string
  affiliations: string[]
  countrySlug: string
}

interface Progress {
  profiles: GeneratedProfile[]
  actors: GeneratedActor[]
  doneProfileIso2: string[]
  doneActorSlugs: string[]
}

// ── Paths ─────────────────────────────────────────────────────────────────────

const ROOT = path.join(__dirname, '..')
const PROGRESS_FILE = path.join(__dirname, '.generate-progress.json')
const OUT_PROFILES = path.join(ROOT, 'lib', 'data', 'generated-profiles.ts')
const OUT_ACTORS = path.join(ROOT, 'lib', 'mock-data', 'generated-actors.ts')

// ── Load source data (relative imports — no @/ alias) ─────────────────────────

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { COUNTRIES_SEED } = require('../lib/data/world-countries') as {
  COUNTRIES_SEED: Array<{
    name: string; slug: string; iso2: string; iso3: string
    capital: string; region: string; riskLevel: string
    riskScore: number; description?: string
  }>
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { mockCountries } = require('../lib/mock-data/countries') as {
  mockCountries: Array<{ iso2: string; id: string }>
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { mockActors } = require('../lib/mock-data/actors') as {
  mockActors: Array<{ countries: string[] }>
}

// ── Derived sets ──────────────────────────────────────────────────────────────

const DETAILED_ISO2 = new Set(mockCountries.map((c) => c.iso2))
const ACTOR_SLUGS = new Set(mockActors.flatMap((a) => a.countries ?? []))
const HIGH_RISK_LEVELS = new Set(['critical', 'high', 'elevated'])

const stubCountries = COUNTRIES_SEED.filter((c) => !DETAILED_ISO2.has(c.iso2))
const actorTargets = stubCountries.filter(
  (c) => HIGH_RISK_LEVELS.has(c.riskLevel) && !ACTOR_SLUGS.has(c.slug),
)

// ── Progress helpers ──────────────────────────────────────────────────────────

function loadProgress(): Progress {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8')) as Progress
    }
  } catch {}
  return { profiles: [], actors: [], doneProfileIso2: [], doneActorSlugs: [] }
}

function saveProgress(p: Progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2))
}

// ── Anthropic client ─────────────────────────────────────────────────────────

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Tool schemas ──────────────────────────────────────────────────────────────

const PROFILE_TOOL: Anthropic.Tool = {
  name: 'save_profiles',
  description: 'Save geopolitical profiles for a batch of countries',
  input_schema: {
    type: 'object' as const,
    required: ['profiles'],
    properties: {
      profiles: {
        type: 'array',
        items: {
          type: 'object',
          required: ['iso2', 'summary', 'riskCategories', 'keyTensions'],
          properties: {
            iso2:    { type: 'string' },
            summary: { type: 'string', description: '2–3 paragraph analytical summary of geopolitical situation' },
            riskCategories: {
              type: 'object',
              required: ['political', 'military', 'economic', 'social', 'environmental'],
              properties: {
                political:    { type: 'integer', minimum: 0, maximum: 100 },
                military:     { type: 'integer', minimum: 0, maximum: 100 },
                economic:     { type: 'integer', minimum: 0, maximum: 100 },
                social:       { type: 'integer', minimum: 0, maximum: 100 },
                environmental:{ type: 'integer', minimum: 0, maximum: 100 },
              },
            },
            keyTensions: {
              type: 'array',
              minItems: 2,
              maxItems: 5,
              items: { type: 'string', description: 'One concise tension or risk driver sentence' },
            },
          },
        },
      },
    },
  },
}

const ACTOR_TOOL: Anthropic.Tool = {
  name: 'save_actors',
  description: 'Save key geopolitical actors for a batch of countries',
  input_schema: {
    type: 'object' as const,
    required: ['actors'],
    properties: {
      actors: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'name', 'type', 'role', 'riskContribution', 'description', 'affiliations', 'countrySlug'],
          properties: {
            id:              { type: 'string', description: 'Unique kebab-case identifier, e.g. bashar-al-assad' },
            name:            { type: 'string' },
            type:            { type: 'string', enum: ['state', 'non_state', 'individual', 'international_org'] },
            role:            { type: 'string', description: 'Short title / role description' },
            riskContribution:{ type: 'string', enum: ['high', 'medium', 'low'] },
            description:     { type: 'string', description: '2–4 sentence analytical description of geopolitical significance' },
            affiliations:    { type: 'array', items: { type: 'string' } },
            countrySlug:     { type: 'string', description: 'The country slug this actor belongs to' },
          },
        },
      },
    },
  },
}

// ── Batch generators ──────────────────────────────────────────────────────────

async function generateProfiles(
  batch: typeof stubCountries,
): Promise<GeneratedProfile[]> {
  const countryList = batch
    .map(
      (c) =>
        `- ${c.name} (${c.iso2}) | Region: ${c.region} | Capital: ${c.capital} | ` +
        `Overall risk: ${c.riskLevel} (score ${c.riskScore}/100)` +
        (c.description ? `\n  Context: ${c.description}` : ''),
    )
    .join('\n')

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    tools: [PROFILE_TOOL],
    tool_choice: { type: 'any' },
    system:
      'You are a senior geopolitical intelligence analyst generating structured risk profiles for an OSINT forecasting platform. ' +
      'Be precise, analytical, and consistent with each country\'s assigned overall risk level. ' +
      'Risk category scores should be internally consistent with the overall risk score. ' +
      'Summaries should be dense, analytical, and intelligence-grade — not encyclopedic.',
    messages: [
      {
        role: 'user',
        content:
          `Generate geopolitical risk profiles for these ${batch.length} countries. ` +
          `The riskCategories scores must be internally consistent with the given overall risk score and level. ` +
          `Summaries should be 2–3 paragraphs of intelligence-grade analysis.\n\n${countryList}`,
      },
    ],
  })

  const toolUse = response.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') throw new Error('No tool use in response')

  const input = toolUse.input as { profiles: GeneratedProfile[] }
  return input.profiles
}

async function generateActors(
  batch: typeof actorTargets,
): Promise<GeneratedActor[]> {
  const countryList = batch
    .map(
      (c) =>
        `- ${c.name} (slug: ${c.slug}) | Risk: ${c.riskLevel}` +
        (c.description ? ` | Context: ${c.description}` : ''),
    )
    .join('\n')

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    tools: [ACTOR_TOOL],
    tool_choice: { type: 'any' },
    system:
      'You are a senior geopolitical intelligence analyst. Generate key actors for an OSINT platform. ' +
      'For each country, identify 2–3 of the most geopolitically significant actors: ' +
      'key leaders, armed groups, or state forces that meaningfully drive that country\'s risk profile. ' +
      'Descriptions should be concise, analytical, and intelligence-grade.',
    messages: [
      {
        role: 'user',
        content:
          `Generate key geopolitical actors for these ${batch.length} countries. ` +
          `For each country provide 2–3 actors. Use unique kebab-case IDs.\n\n${countryList}`,
      },
    ],
  })

  const toolUse = response.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') throw new Error('No tool use in response')

  const input = toolUse.input as { actors: GeneratedActor[] }
  return input.actors
}

// ── Output writers ─────────────────────────────────────────────────────────────

function writeProfiles(profiles: GeneratedProfile[]) {
  const lines = [
    '// AUTO-GENERATED by scripts/generate-country-profiles.ts — do not edit manually',
    '',
    'export interface GeneratedProfile {',
    '  iso2: string',
    '  summary: string',
    '  riskCategories: {',
    '    political: number',
    '    military: number',
    '    economic: number',
    '    social: number',
    '    environmental: number',
    '  }',
    '  keyTensions: string[]',
    '}',
    '',
    `export const GENERATED_PROFILES: GeneratedProfile[] = ${JSON.stringify(profiles, null, 2)}`,
    '',
  ]
  fs.writeFileSync(OUT_PROFILES, lines.join('\n'))
  console.log(`  → Wrote ${profiles.length} profiles to lib/data/generated-profiles.ts`)
}

function writeActors(actors: GeneratedActor[]) {
  const lines = [
    '// AUTO-GENERATED by scripts/generate-country-profiles.ts — do not edit manually',
    '',
    'export const GENERATED_ACTORS = ',
    JSON.stringify(actors, null, 2),
    '',
  ]
  fs.writeFileSync(OUT_ACTORS, lines.join('\n'))
  console.log(`  → Wrote ${actors.length} actors to lib/mock-data/generated-actors.ts`)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🌍 Country profile generation`)
  console.log(`   Stub countries to profile: ${stubCountries.length}`)
  console.log(`   High-risk countries needing actors: ${actorTargets.length}\n`)

  const progress = loadProgress()
  const doneSet = new Set(progress.doneProfileIso2)
  const doneActorSet = new Set(progress.doneActorSlugs)

  // ── Phase 1: Country profiles ─────────────────────────────────────────────

  const remaining = stubCountries.filter((c) => !doneSet.has(c.iso2))
  console.log(`Phase 1 — Profiles (${progress.profiles.length} done, ${remaining.length} remaining)`)

  const profileBatches = chunk(remaining, 5)
  for (let i = 0; i < profileBatches.length; i++) {
    const batch = profileBatches[i]
    const names = batch.map((c) => c.name).join(', ')
    process.stdout.write(`  Batch ${i + 1}/${profileBatches.length}: ${names} ... `)

    try {
      const generated = await generateProfiles(batch)
      progress.profiles.push(...generated)
      progress.doneProfileIso2.push(...batch.map((c) => c.iso2))
      doneSet.add(...batch.map((c) => c.iso2) as [string])
      saveProgress(progress)
      console.log(`✓ (${generated.length} profiles)`)
    } catch (err) {
      console.log(`✗ Error: ${err instanceof Error ? err.message : String(err)}`)
      console.log('  Retrying after 5s...')
      await sleep(5000)
      i-- // retry
      continue
    }

    if (i < profileBatches.length - 1) await sleep(300)
  }

  // ── Phase 2: Actors ───────────────────────────────────────────────────────

  const remainingActors = actorTargets.filter((c) => !doneActorSet.has(c.slug))
  console.log(`\nPhase 2 — Actors (${progress.actors.length} done, ${remainingActors.length} countries remaining)`)

  const actorBatches = chunk(remainingActors, 3)
  for (let i = 0; i < actorBatches.length; i++) {
    const batch = actorBatches[i]
    const names = batch.map((c) => c.name).join(', ')
    process.stdout.write(`  Batch ${i + 1}/${actorBatches.length}: ${names} ... `)

    try {
      const generated = await generateActors(batch)
      progress.actors.push(...generated)
      progress.doneActorSlugs.push(...batch.map((c) => c.slug))
      saveProgress(progress)
      console.log(`✓ (${generated.length} actors)`)
    } catch (err) {
      console.log(`✗ Error: ${err instanceof Error ? err.message : String(err)}`)
      console.log('  Retrying after 5s...')
      await sleep(5000)
      i--
      continue
    }

    if (i < actorBatches.length - 1) await sleep(300)
  }

  // ── Write output files ────────────────────────────────────────────────────

  console.log('\nWriting output files...')
  writeProfiles(progress.profiles)
  writeActors(progress.actors)

  // Clean up progress file
  if (fs.existsSync(PROGRESS_FILE)) fs.unlinkSync(PROGRESS_FILE)

  console.log('\n✅ Done. Next step: npx prisma db seed\n')
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err)
  process.exit(1)
})
