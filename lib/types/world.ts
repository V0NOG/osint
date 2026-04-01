export type RiskLevel = 'critical' | 'high' | 'elevated' | 'moderate' | 'low' | 'minimal'

export type ActorType = 'state' | 'non-state' | 'international-org' | 'individual'

export type RiskContribution = 'high' | 'medium' | 'low'

export interface RiskCategories {
  political: number
  military: number
  economic: number
  social: number
  environmental: number
}

export interface Country {
  id: string
  slug: string
  name: string
  iso2: string
  iso3: string
  region: string
  overallRiskScore: number
  riskLevel: RiskLevel
  riskCategories: RiskCategories
  summary: string
  keyActors: string[]
  capital: string
  lastUpdated: string
  alertCount: number
  activeForecastCount: number
  population?: number
  gdp?: number
}

export interface Region {
  id: string
  name: string
  slug: string
  countries: string[]
  overallRiskScore: number
  riskLevel: RiskLevel
  summary: string
  keyTensions: string[]
  lastUpdated: string
  activeEventCount: number
  activeForecastCount: number
}

export interface Actor {
  id: string
  name: string
  type: ActorType
  countries: string[]
  role: string
  riskContribution: RiskContribution
  description: string
  affiliations?: string[]
}
