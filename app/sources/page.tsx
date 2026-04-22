import { SourcesView } from '@/components/sources/SourcesView'
import { getFeeds } from '@/lib/db/feeds'

export const metadata = { title: 'Sources' }
export const dynamic = 'force-dynamic'

export default async function SourcesPage() {
  const feeds = await getFeeds()
  return <SourcesView initialFeeds={feeds} />
}
