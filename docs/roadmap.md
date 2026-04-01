# Roadmap
## Project Name
Geopolitical OSINT Forecasting Platform

## Roadmap Goal
Build the platform in structured milestones so Claude Code can work safely and iteratively, with visible progress at each stage.

---

## Phase 0 — Foundation Docs and Planning
### Goal
Create the project instructions, product scope, design direction, and task structure.

### Deliverables
- PRD
- design system brief
- forecasting spec
- Claude project instructions
- initial repo structure
- task list for milestone execution

### Exit Criteria
- documents exist
- scope is frozen enough to start coding
- Claude Code has clear instructions

---

## Phase 1 — Project Setup and App Shell
### Goal
Create the base application architecture and polished shell.

### Deliverables
- frontend app setup
- backend app setup
- shared package structure if needed
- theme tokens
- routing
- navigation
- top bar / side panels
- search/command palette shell
- placeholder pages
- seed/mock data structure

### Features
- polished landing shell
- dark theme
- responsive layout
- reusable panel/card system
- loading/skeleton states
- global state scaffolding

### Exit Criteria
- app runs locally
- app shell looks production-grade
- all main routes exist
- design system foundation is in place

---

## Phase 2 — 3D Visual Foundation
### Goal
Build the premium visual core of the product.

### Deliverables
- interactive 3D globe
- hover/select state for countries
- globe camera controls
- atmospheric visuals
- animated arcs or overlays
- risk heat layer support
- performance fallback mode

### Exit Criteria
- globe is visually impressive
- interactions feel smooth
- it integrates cleanly with app shell
- performance is acceptable on normal desktop hardware

---

## Phase 3 — Core Intelligence Pages
### Goal
Build real product screens with mock data.

### Deliverables
- world overview page
- country page
- region page
- event page
- watchlist page
- source evidence drawer
- “what changed” panel

### Features
- filterable world view
- country summary cards
- event timeline
- source cards
- risk panels
- related entity navigation

### Exit Criteria
- pages feel coherent and useful
- navigation between core entities works
- seeded data tells a believable story

---

## Phase 4 — Forecasting System
### Goal
Build structured forecasting workflows.

### Deliverables
- forecast question model
- forecast page
- create/update forecast UI
- rationale blocks
- evidence linking
- confidence decomposition
- resolution criteria UI
- forecast history visualization

### Exit Criteria
- forecasts are clear, versioned, and measurable
- users can inspect why a forecast exists
- the app supports serious analytical workflows

---

## Phase 5 — Search, Filters, and Workspace Refinement
### Goal
Make the platform efficient to use.

### Deliverables
- improved search
- entity filtering
- timeline filtering
- saved watchlists
- analyst workspace improvements
- keyboard shortcuts / command support

### Exit Criteria
- navigation feels fast
- analytical workflows feel practical
- power-user patterns begin to emerge

---

## Phase 6 — Backend Contracts and Data Architecture
### Goal
Move from UI-first mock workflows to stable backend foundations.

### Deliverables
- API contracts
- database schema
- core backend models
- seed scripts
- service layer
- auth scaffolding
- role model scaffolding

### Exit Criteria
- frontend can consume structured backend data
- domain objects are stable enough for further work
- mock data can be replaced safely

---

## Phase 7 — Source Ingestion Alpha
### Goal
Introduce a small curated set of public-source ingestion flows.

### Deliverables
- source adapter abstraction
- initial ingestion pipeline
- source normalization
- source provenance model
- event derivation scaffolding
- dedupe rules
- failure handling

### Exit Criteria
- a limited set of sources can be ingested reliably
- events and evidence can be attached to entities
- provenance is visible in the UI

---

## Phase 8 — Forecast Evaluation and Resolution
### Goal
Add scoring and long-term usefulness.

### Deliverables
- forecast resolution workflow
- scoring scaffolding
- history logs
- basic calibration-ready data model
- admin tools for marking outcomes

### Exit Criteria
- forecasts can be resolved later
- outcomes can be recorded
- the platform can improve over time

---

## Phase 9 — Production Readiness
### Goal
Make the product deployable and maintainable.

### Deliverables
- deployment configs
- environment variable handling
- test coverage on critical paths
- linting and formatting
- logging
- monitoring basics
- error boundaries and failure states
- documentation for running and deploying

### Exit Criteria
- app can be deployed cleanly
- core flows are stable
- failures are understandable
- repo is safe for continued agentic development

---

## Suggested Immediate Build Order
1. Phase 1
2. Phase 2
3. Phase 3
4. Phase 4
5. Phase 6
6. Phase 7
7. Phase 5
8. Phase 8
9. Phase 9

This order prioritizes:
- visible progress early
- strong UX before data complexity
- a motivating demo quickly
- solid forecasting workflows before broad ingestion

---

## Notes for Claude Code
- Complete one phase at a time
- Use mock data first unless explicitly told otherwise
- Do not begin broad source ingestion until core UX is polished
- Keep each phase commit-friendly and reviewable
- Prefer additive changes over risky rewrites