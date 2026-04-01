import type { RiskLevel } from '../types'

export function getRiskColor(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    critical: 'var(--color-risk-critical)',
    high: 'var(--color-risk-high)',
    elevated: 'var(--color-risk-elevated)',
    moderate: 'var(--color-risk-moderate)',
    low: 'var(--color-risk-low)',
    minimal: 'var(--color-risk-minimal)',
  }
  return map[level]
}

export function getRiskTextClass(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    elevated: 'text-amber-400',
    moderate: 'text-yellow-400',
    low: 'text-green-400',
    minimal: 'text-gray-400',
  }
  return map[level]
}

export function getRiskBgClass(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    critical: 'bg-red-500/10 border-red-500/20',
    high: 'bg-orange-500/10 border-orange-500/20',
    elevated: 'bg-amber-500/10 border-amber-500/20',
    moderate: 'bg-yellow-500/10 border-yellow-500/20',
    low: 'bg-green-500/10 border-green-500/20',
    minimal: 'bg-gray-500/10 border-gray-500/20',
  }
  return map[level]
}

export function getRiskLabel(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    critical: 'Critical',
    high: 'High',
    elevated: 'Elevated',
    moderate: 'Moderate',
    low: 'Low',
    minimal: 'Minimal',
  }
  return map[level]
}

export function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 85) return 'critical'
  if (score >= 70) return 'high'
  if (score >= 55) return 'elevated'
  if (score >= 40) return 'moderate'
  if (score >= 20) return 'low'
  return 'minimal'
}

export function getProbabilityColor(probability: number): string {
  if (probability >= 70) return 'text-red-400'
  if (probability >= 50) return 'text-orange-400'
  if (probability >= 30) return 'text-amber-400'
  return 'text-green-400'
}
