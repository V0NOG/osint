import { ForecastWizard } from '@/components/forecast/wizard/ForecastWizard'

export const metadata = {
  title: 'New Forecast',
}

export default function NewForecastPage() {
  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <ForecastWizard />
      </div>
    </div>
  )
}
