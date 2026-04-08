import { notFound } from 'next/navigation'
import { mockForecasts } from '@/lib/mock-data/forecasts'
import { mockEvents } from '@/lib/mock-data/events'
import { mockCountries } from '@/lib/mock-data/countries'
import { ForecastDetailView } from '@/components/forecast/ForecastDetailView'
import type { Country, GeopoliticalEvent } from '@/lib/types'

interface PageProps {
  params: { id: string }
}

export async function generateStaticParams() {
  return mockForecasts.map((f) => ({ id: f.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const forecast = mockForecasts.find((f) => f.id === params.id)
  return { title: forecast?.title ?? 'Forecast' }
}

export default function ForecastDetailPage({ params }: PageProps) {
  const forecast = mockForecasts.find((f) => f.id === params.id)
  if (!forecast) notFound()

  const countries = forecast.countries
    .map((id) => mockCountries.find((c) => c.id === id))
    .filter((c): c is Country => c !== undefined)

  const relatedEvents = mockEvents
    .filter((e) => forecast.relatedEvents?.includes(e.id))
    .slice(0, 3) as GeopoliticalEvent[]

  return <ForecastDetailView forecast={forecast} countries={countries} relatedEvents={relatedEvents} />
}
