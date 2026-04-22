import { ActorsView } from '@/components/actor/ActorsView'
import { getActors } from '@/lib/db/actors'

export const metadata = {
  title: 'Actors',
}

export default async function ActorsPage() {
  const actors = await getActors()
  return <ActorsView initialData={actors} />
}
