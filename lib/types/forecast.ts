export type ForecastStatus = 'active' | 'resolved' | 'expired' | 'draft'

export type ConfidenceLevel = 'low' | 'medium' | 'high'

export interface ForecastHistoryEntry {
  date: string
  probability: number
  confidenceLevel: ConfidenceLevel
  changeReason: string
  analystNote?: string
}

export interface ForecastEvidence {
  id: string
  title: string
  description: string
  direction: 'supporting' | 'opposing' | 'neutral'
  weight: 'strong' | 'moderate' | 'weak'
  sourceUrl?: string
  addedAt: string
}

export interface Forecast {
  id: string
  title: string
  question: string
  status: ForecastStatus
  probability: number
  confidenceLevel: ConfidenceLevel
  confidenceNotes: string
  rationale: string
  uncertaintyNotes: string
  timeHorizon: string
  targetDate: string
  region: string
  countries: string[]
  resolutionCriteria: string
  versionNumber: number
  history: ForecastHistoryEntry[]
  evidence?: ForecastEvidence[]
  relatedEvents?: string[]
  tags?: string[]
  createdAt: string
  lastUpdated: string
}
