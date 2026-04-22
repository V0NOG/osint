export type EventType = 'military' | 'diplomatic' | 'economic' | 'political' | 'humanitarian' | 'cyber'

export type EventSeverity = 'critical' | 'high' | 'moderate' | 'low'

export type SourceReliability = 'high' | 'medium' | 'low'

export interface EventSource {
  title: string
  url: string
  reliability: SourceReliability
  publishedAt?: string
}

export interface GeopoliticalEvent {
  id: string
  title: string
  summary: string
  eventType: EventType
  severity: EventSeverity
  countries: string[]
  actors: string[]
  date: string
  sources: EventSource[]
  tags: string[]
  relatedForecasts: string[]
  locationDescription?: string
  impactAssessment?: string
  createdAt?: string
}
