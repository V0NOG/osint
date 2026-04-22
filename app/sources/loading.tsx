export default function SourcesLoading() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <div className="h-5 w-32 bg-white/5 rounded animate-pulse mb-2" />
        <div className="h-3 w-64 bg-white/5 rounded animate-pulse" />
      </div>
      <div className="grid gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
