import { ForecastsView } from '@/components/forecast/ForecastsView'
import { getForecasts } from '@/lib/db/forecasts'

export const metadata = {
  title: 'Forecasts',
}

export default async function ForecastsPage() {
  const forecasts = await getForecasts()
  return <ForecastsView initialData={forecasts} />
}
