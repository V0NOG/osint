import Parser from 'rss-parser'
import type { RawItem } from '../types'
import type { FeedConfig } from './sources'
import { extractCountryHints, slugify } from '../utils'

const parser = new Parser({
  timeout: 10_000,
  headers: { 'User-Agent': 'OSINT-Forecasting-Platform/1.0' },
})

export async function fetchRssFeed(feed: FeedConfig): Promise<RawItem[]> {
  const result = await parser.parseURL(feed.url)
  const items: RawItem[] = []

  for (const item of result.items) {
    const url = item.link ?? item.guid
    if (!url) continue

    const title = item.title?.trim() ?? ''
    const description = stripHtml(item.contentSnippet ?? item.content ?? item.summary ?? '')
    const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date()

    items.push({
      externalId: `${feed.key}::${slugify(url)}`,
      title,
      description,
      url,
      publishedAt,
      sourceName: feed.name,
      sourceKey: feed.key,
      tags: [...feed.tags],
      countryHints: extractCountryHints(`${title} ${description}`),
    })
  }

  return items
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
