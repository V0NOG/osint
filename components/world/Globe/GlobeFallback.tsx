import { Globe, Layers } from 'lucide-react'

/**
 * Static fallback rendered while the 3D canvas loads or when WebGL is unavailable.
 * Preserves the visual placeholder from Phase 1 without any browser-only APIs.
 */
export function GlobeFallback() {
  return (
    <div className="relative w-full h-full min-h-[480px] flex items-center justify-center overflow-hidden rounded-xl">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-[var(--color-bg-base)] to-[var(--color-bg-base)]" />

      {/* Grid lines overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-blue-600/5 blur-3xl" />
        <div className="absolute w-64 h-64 rounded-full bg-blue-500/8 blur-2xl" />
      </div>

      {/* Globe rings */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute w-[420px] h-[420px] rounded-full border border-blue-500/10"
          style={{ animation: 'spin 40s linear infinite' }}
        />
        <div
          className="absolute w-[320px] h-[320px] rounded-full border border-blue-400/8"
          style={{ animation: 'spin 25s linear infinite reverse' }}
        />
        <div
          className="absolute w-[220px] h-[220px] rounded-full border border-blue-300/6"
          style={{ animation: 'spin 15s linear infinite' }}
        />
        <div className="absolute w-[320px] h-[320px] rounded-full border-t border-b border-white/5" />

        {/* Core globe circle */}
        <div className="relative w-48 h-48 rounded-full border border-blue-500/20 bg-gradient-to-br from-blue-900/20 to-[var(--color-bg-base)] shadow-2xl flex items-center justify-center">
          <Globe className="w-20 h-20 text-blue-500/25" strokeWidth={0.75} />

          <div className="absolute top-8 left-12 w-2 h-2 rounded-full bg-red-500/70 shadow-[0_0_8px_rgba(239,68,68,0.8)]">
            <div className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" />
          </div>
          <div className="absolute bottom-12 right-10 w-1.5 h-1.5 rounded-full bg-orange-500/70 shadow-[0_0_6px_rgba(249,115,22,0.8)]">
            <div className="absolute inset-0 rounded-full bg-orange-500/40 animate-ping" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="absolute top-14 right-8 w-1.5 h-1.5 rounded-full bg-amber-500/70 shadow-[0_0_6px_rgba(245,158,11,0.8)]">
            <div className="absolute inset-0 rounded-full bg-amber-500/40 animate-ping" style={{ animationDelay: '1.2s' }} />
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/8 backdrop-blur-sm">
          <Layers className="w-3 h-3 text-blue-400" strokeWidth={1.75} />
          <span className="text-xs text-[var(--color-text-tertiary)] font-medium">
            Interactive Globe
          </span>
        </div>
        <p className="text-[11px] text-[var(--color-text-tertiary)] opacity-60">
          React Three Fiber · WebGL rendering · Real-time risk overlay
        </p>
      </div>
    </div>
  )
}
