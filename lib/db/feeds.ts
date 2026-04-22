import { prisma } from './client'
import { ALL_RSS_FEEDS } from '@/lib/ingestion/adapters/sources'
import type { FeedDomain } from '@/lib/ingestion/adapters/sources'

export interface FeedRow {
  id: string
  key: string
  name: string
  url: string
  category: string
  domain: string
  reliability: string
  enabled: boolean
  custom: boolean
  tags: string[]
  bias: string | null
  createdAt: Date
  updatedAt: Date
}

/** Seed the IngestionFeed table from the static config if empty. */
export async function ensureFeedsSeed(): Promise<void> {
  const count = await prisma.ingestionFeed.count()
  if (count > 0) return

  const allFeeds = [
    ...ALL_RSS_FEEDS.map((f) => ({ key: f.key, name: f.name, url: f.url, category: 'rss', domain: f.domain ?? 'general', reliability: f.reliability, tags: f.tags })),
    { key: 'gdelt', name: 'GDELT', url: 'https://api.gdeltproject.org/api/v2/doc/doc', category: 'gdelt', domain: 'general', reliability: 'medium', tags: ['gdelt'] },
    { key: 'ucdp', name: 'UCDP Georeferenced Events', url: 'https://ucdpapi.pcr.uu.se/api/gedevents', category: 'ucdp', domain: 'conflict', reliability: 'high', tags: ['ucdp', 'conflict'] },
    { key: 'reliefweb', name: 'ReliefWeb (UN OCHA)', url: 'https://api.reliefweb.int/v1/reports', category: 'reliefweb', domain: 'humanitarian', reliability: 'high', tags: ['reliefweb', 'un', 'humanitarian'] },
  ]

  await prisma.ingestionFeed.createMany({
    data: allFeeds.map((f) => ({
      key: f.key,
      name: f.name,
      url: f.url,
      category: f.category,
      domain: (f as { domain?: string }).domain ?? 'general',
      reliability: f.reliability ?? 'medium',
      enabled: true,
      custom: false,
      tags: f.tags ?? [],
    })),
    skipDuplicates: true,
  })
}

export async function getFeeds(): Promise<FeedRow[]> {
  await ensureFeedsSeed()
  return prisma.ingestionFeed.findMany({ orderBy: [{ domain: 'asc' }, { name: 'asc' }] })
}

export async function toggleFeed(key: string, enabled: boolean): Promise<FeedRow> {
  return prisma.ingestionFeed.update({ where: { key }, data: { enabled } })
}

export async function addCustomFeed(data: {
  key: string
  name: string
  url: string
  domain: FeedDomain
  reliability: string
  tags: string[]
}): Promise<FeedRow> {
  return prisma.ingestionFeed.create({
    data: {
      key: data.key,
      name: data.name,
      url: data.url,
      category: 'rss',
      domain: data.domain,
      reliability: data.reliability,
      enabled: true,
      custom: true,
      tags: data.tags,
    },
  })
}

export async function deleteFeed(key: string): Promise<void> {
  await prisma.ingestionFeed.delete({ where: { key } })
}
