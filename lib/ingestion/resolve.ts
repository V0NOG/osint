import { prisma } from '@/lib/db/client'

interface CountryLookup {
  id: string
  iso2: string
}

let countryCache: CountryLookup[] | null = null

async function getCountryLookup(): Promise<CountryLookup[]> {
  if (countryCache) return countryCache
  countryCache = await prisma.country.findMany({ select: { id: true, iso2: true } })
  return countryCache
}

/**
 * Given a list of ISO2 codes extracted from article text, return the
 * corresponding DB country IDs that actually exist in the platform.
 */
export async function resolveCountryIds(iso2Hints: string[]): Promise<string[]> {
  if (iso2Hints.length === 0) return []

  const lookup = await getCountryLookup()
  const iso2Set = new Set(iso2Hints.map((c) => c.toUpperCase()))

  return lookup
    .filter((c) => iso2Set.has(c.iso2.toUpperCase()))
    .map((c) => c.id)
}

/** Clear cache between pipeline runs so new countries are picked up */
export function clearCountryCache(): void {
  countryCache = null
}
