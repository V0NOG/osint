import { prisma } from '@/lib/db/client'

/**
 * Given a list of source URLs, returns the subset that do NOT already
 * exist in the EventSource table. Used to skip already-ingested items.
 */
export async function filterNewUrls(urls: string[]): Promise<Set<string>> {
  if (urls.length === 0) return new Set(urls)

  const existing = await prisma.eventSource.findMany({
    where: { url: { in: urls } },
    select: { url: true },
  })

  const existingUrls = new Set(existing.map((e) => e.url))
  return new Set(urls.filter((u) => !existingUrls.has(u)))
}

/**
 * Given a list of generated event IDs, returns the subset that do NOT
 * already exist in the GeopoliticalEvent table.
 */
export async function filterNewEventIds(ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set()

  const existing = await prisma.geopoliticalEvent.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  })

  const existingIds = new Set(existing.map((e) => e.id))
  return new Set(ids.filter((id) => !existingIds.has(id)))
}
