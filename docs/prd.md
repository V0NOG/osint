# Product Requirements Document
## Project Name
Geopolitical OSINT Forecasting Platform

## 1. Product Vision
Build a modern web application that gives users a live, structured view of the global geopolitical environment using public information. The platform should help users monitor countries, regions, events, and strategic trends, then produce explainable forecasts with probabilities, confidence levels, and supporting evidence.

The product must feel premium, modern, and intelligence-focused. It should combine a strong visual experience with serious analytical workflows.

## 2. Core Problem
Public geopolitical information is fragmented across news, official statements, datasets, think tank reports, and social platforms. Most tools either:
- show raw feeds with little structure
- produce shallow dashboards without context
- provide predictions without explainability
- lack good UX for investigating world events at scale

This platform should solve that by turning public signals into:
- structured world state views
- country and region intelligence pages
- event timelines
- evidence-backed forecasting workflows
- tracked prediction history and performance

## 3. Product Goal
Create a deployable v1 application that:
- visualizes world geopolitical risk on a 3D globe and modern dashboard
- lets users inspect countries, regions, events, and actors
- supports forecast questions with probabilities and confidence
- explains why forecasts and risk levels changed
- tracks forecast history and future resolution

## 4. Target Users
### 4.1 Viewer
A user who wants to explore geopolitical situations visually and understand what is happening.

### 4.2 Analyst
A user who wants to inspect evidence, compare sources, create or update forecasts, and track scenario changes.

### 4.3 Admin
A user who manages data pipelines, source connectors, users, settings, and forecast resolution rules.

## 5. v1 Scope
### 5.1 Core Pages
- Landing / app shell
- World overview
- Country detail page
- Region detail page
- Event detail page
- Forecast page
- Watchlist page
- Analyst workspace
- Settings / admin shell

### 5.2 Core Features
- Interactive 3D globe
- Global risk overview
- Country risk summaries
- Region summaries
- Event feed and timelines
- Source evidence drawer
- Search and filtering
- Watchlists
- Forecast question objects
- Probability + confidence + rationale display
- Forecast history
- Mock data support for first build
- Clean architecture for later real ingestion

### 5.3 Forecasting Features in v1
- Predefined forecast question templates
- Create a forecast
- Update a forecast
- Show probability history over time
- Show supporting evidence
- Show uncertainty notes
- Show confidence decomposition
- Show resolution criteria
- Mark a forecast as resolved later

### 5.4 Intelligence Features in v1
- Country profiles
- Risk categories by country
- Event timeline
- Source cards with provenance
- “What changed” panel
- Related events and related forecasts

## 6. Non-Goals for v1
Do not build these in the initial version:
- full autonomous ingestion from every source on earth
- fully automatic geopolitical prediction engine without human review
- high-frequency real-time streaming everywhere
- advanced collaboration workflows
- large-scale social scraping
- highly detailed simulation engines
- native mobile apps
- public user-generated content systems

## 7. UX Goals
The application should feel:
- premium
- modern
- intelligence-focused
- serious, not playful
- visually impressive but still readable
- information-dense without feeling cluttered
- smooth and responsive
- suitable for long analytical sessions

## 8. Core Product Principles
1. Every important score must be explainable.
2. Every forecast must be tied to a clear question and time horizon.
3. Evidence and provenance should always be inspectable.
4. The UI should be beautiful but must not hide uncertainty.
5. The architecture must support agentic coding and modular development.
6. Start with strong mock data and UX before broad live ingestion.

## 9. Functional Requirements
### 9.1 World Overview
- Show a 3D globe or world visualization
- Display country-level geopolitical risk layers
- Allow hover and selection
- Allow filtering by risk category
- Show top alerts and notable changes
- Show active forecasts

### 9.2 Country Page
- Show country summary
- Show risk categories
- Show event timeline
- Show key actors
- Show related forecasts
- Show indicators and recent changes
- Show evidence panel

### 9.3 Region Page
- Show regional summary
- Show involved countries
- Show shared risks
- Show regional event clustering
- Show major scenario branches

### 9.4 Event Page
- Show event summary
- Show actors involved
- Show source list
- Show timeline context
- Show related countries and forecasts
- Show contradictions or uncertainty notes if present

### 9.5 Forecast Page
- Show forecast question
- Show time horizon
- Show current probability
- Show confidence level
- Show rationale
- Show supporting evidence
- Show forecast history chart
- Show resolution rules

### 9.6 Search
- Search countries, regions, actors, and events
- Fast results
- Keyboard-friendly command/search palette

### 9.7 Watchlists
- Save countries
- Save events
- Save forecast questions
- Show recent changes for watched items

## 10. Data Model Summary
The system should support at least these concepts:
- Country
- Region
- Actor
- Source
- Claim
- Event
- Indicator
- ForecastQuestion
- Forecast
- ForecastEvidence
- Scenario
- Alert
- Watchlist
- User
- AnalystNote

## 11. Technical Product Requirements
- Modular frontend and backend
- Strong TypeScript support on frontend
- Reusable UI components
- Support for mock data and real data
- Clean API contracts
- Ability to swap in real data sources later
- Ability to add agent workflows later
- Performance-conscious 3D rendering
- Accessible UI basics
- Clean dark theme first

## 12. Success Criteria for v1
v1 is successful when:
- the app is deployable
- the UI looks production-grade
- the 3D world overview works well
- country and event pages are usable
- forecast workflows work end-to-end
- risk changes are explainable
- the codebase is clean enough for Claude Code to keep extending safely

## 13. Definition of Done for v1
A finished v1 includes:
- polished app shell
- working 3D globe
- modern navigation and layouts
- world overview page
- country page
- event page
- forecast page
- seeded mock intelligence data
- working search
- working watchlists UI
- forecast creation and update flow
- rationale/evidence display
- local run instructions
- deploy instructions