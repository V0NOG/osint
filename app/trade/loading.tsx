export default function TradeLoading() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="h-6 w-48 rounded bg-[var(--color-bg-surface)] animate-pulse mb-2" />
      <div className="h-4 w-96 rounded bg-[var(--color-bg-surface)] animate-pulse mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-[var(--color-bg-surface)] animate-pulse" />
        ))}
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-[var(--color-bg-surface)] animate-pulse" />
        ))}
      </div>
    </div>
  )
}
