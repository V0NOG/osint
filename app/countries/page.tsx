import { CountriesView } from '@/components/country/CountriesView'
import { getCountries } from '@/lib/db/countries'

export const metadata = {
  title: 'Countries',
}

export default async function CountriesPage() {
  const countries = await getCountries()
  return <CountriesView initialData={countries} />
}
