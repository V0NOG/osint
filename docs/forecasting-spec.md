# Forecasting Specification
## Project Name
Geopolitical OSINT Forecasting Platform

## 1. Purpose
The forecasting system should allow users to create, inspect, update, and later resolve geopolitical forecasts in a structured and explainable way.

This system must avoid vague “AI confidence scores” without context. Each forecast must be tied to:
- a clear question
- a defined time horizon
- a probability estimate
- evidence
- rationale
- explicit uncertainty
- resolution criteria

## 2. Forecasting Principles
1. Forecast questions must be measurable.
2. Probabilities must be inspectable.
3. Confidence must be distinct from probability.
4. Evidence must be linked and reviewable.
5. Forecast history must be preserved.
6. Forecasts should support later evaluation.

## 3. Core Concepts
### 3.1 Forecast Question
A well-scoped question about a future geopolitical outcome.

Examples:
- Will Country X hold national elections by Date Y?
- Will direct military exchange occur between Actor A and Actor B within 30 days?
- Will sanctions be expanded by Bloc X against Country Y this quarter?
- Will a ceasefire in Region Z collapse within 14 days?

### 3.2 Forecast
A dated estimate answering a forecast question at a point in time.

### 3.3 Probability
The estimated likelihood that the forecast question resolves true within the defined horizon.

### 3.4 Confidence
How confident the system or analyst is in the estimate itself, based on evidence quality, source diversity, freshness, clarity, and uncertainty.

### 3.5 Evidence
The source-backed material supporting or challenging the forecast.

### 3.6 Resolution
The eventual determination of whether the forecast question resolved true, false, or unresolved.

## 4. Forecast Object
Each forecast should contain:
- id
- forecastQuestionId
- title
- question
- status
- probability
- confidenceLevel
- confidenceNotes
- rationale
- uncertaintyNotes
- evidenceSummary
- createdAt
- updatedAt
- createdBy
- timeHorizon
- targetDate
- region
- countries
- actors
- relatedEvents
- relatedSources
- resolutionCriteria
- resolutionStatus
- resolutionDate
- outcomeNotes
- versionNumber

## 5. Confidence Model
Confidence should not just be a raw number with no meaning.

The UI and data model should support at least:
- confidence level: low / medium / high
- evidence quality
- source diversity
- signal freshness
- model agreement or disagreement
- analyst override notes
- contradiction presence

Possible confidence dimensions:
- Evidence quality
- Data completeness
- Source reliability
- Source diversity
- Recency
- Internal consistency
- Analyst certainty

## 6. Forecast Question Rules
A forecast question should:
- be written clearly
- have a known subject
- have a measurable outcome
- have a time horizon
- avoid ambiguous wording
- avoid multiple outcomes in one question

Bad example:
- “Will the Middle East get worse soon?”

Good example:
- “Will a direct state-to-state military exchange between Country A and Country B occur before 2026-08-01?”

## 7. Forecast Lifecycle
### 7.1 Draft
Created but not yet finalized.

### 7.2 Active
The forecast is live and currently relevant.

### 7.3 Updated
The forecast has changed at least once and history is preserved.

### 7.4 Resolved
The forecast has been judged against resolution criteria.

### 7.5 Expired / Unresolved
The forecast horizon ended but resolution was unclear.

## 8. Versioning
Forecasts must preserve update history.

Each update should store:
- timestamp
- old probability
- new probability
- old confidence
- new confidence
- reason for change
- evidence delta
- analyst/system source of change

The UI should show a probability history graph and update log.

## 9. Resolution Criteria
Each forecast must include criteria for how it will be judged.

Resolution criteria should specify:
- what counts as true
- what counts as false
- what sources are acceptable for resolution
- what happens if evidence is incomplete
- what date or window closes the question

## 10. UI Requirements
### 10.1 Forecast Page
Must show:
- question
- current probability
- current confidence
- rationale
- evidence
- uncertainty notes
- history chart
- update log
- resolution criteria
- related countries/events

### 10.2 Forecast Cards
Should show:
- title
- short question
- probability
- confidence
- time horizon
- last updated
- mini trend

### 10.3 Forecast Update Flow
The user should be able to:
- change probability
- change confidence
- add rationale
- link evidence
- note what changed
- preserve previous versions

## 11. Forecast Templates for v1
v1 should support templates like:
- military escalation
- sanctions escalation
- election timing
- protest escalation
- leadership instability
- trade/shipping disruption
- ceasefire stability
- cyber escalation

## 12. Forecast Inputs
The system may later use:
- event changes
- indicator changes
- source corroboration
- contradiction detection
- historical analogs
- model-generated suggestions
- analyst input

But v1 should focus on structured UI and mock data first.

## 13. Scoring and Evaluation
The data model should allow future forecast evaluation.

Prepare for:
- outcome tracking
- resolution logging
- score calculation later
- calibration dashboards later

Do not overbuild the scoring engine in the first implementation, but keep the structure ready.

## 14. Design Notes
Forecasting screens should feel:
- premium
- serious
- legible
- evidence-driven
- visually clear

The probability display should feel important without becoming flashy.

## 15. Build Guidance
Claude Code should:
- create forecast objects with mock data first
- build reusable forecast UI components
- support version history from the beginning
- keep confidence separate from probability
- avoid vague prediction language