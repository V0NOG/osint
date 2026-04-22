import { EventsView } from '@/components/event/EventsView'
import { getEvents } from '@/lib/db/events'
import { getCountries } from '@/lib/db/countries'

export const metadata = {
  title: 'Events',
}

export default async function EventsPage() {
  const [events, countries] = await Promise.all([getEvents(), getCountries()])
  return <EventsView initialData={events} countries={countries} />
}
