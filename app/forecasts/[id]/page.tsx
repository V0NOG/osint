import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getForecastById } from '@/lib/db/forecasts'
import { getCountriesByIds } from '@/lib/db/countries'
import { getEventById } from '@/lib/db/events'
import { ForecastDetailView } from '@/components/forecast/ForecastDetailView'

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const forecast = await getForecastById(params.id)
  return { title: forecast?.title ?? 'Forecast' }
}

export default async function ForecastDetailPage({ params }: PageProps) {
  const forecast = await getForecastById(params.id)
  if (!forecast) notFound()

  const [countries, relatedEvents] = await Promise.all([
    getCountriesByIds(forecast.countries),
    Promise.all(
      (forecast.relatedEvents ?? []).slice(0, 3).map((id) => getEventById(id))
    ).then((results) => results.filter((e) => e !== null)),
  ])

  return <ForecastDetailView forecast={forecast} countries={countries} relatedEvents={relatedEvents} />
}
