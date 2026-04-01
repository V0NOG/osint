# Claude Project Instructions
## Project
Geopolitical OSINT Forecasting Platform

## Mission
You are building a premium web application for geopolitical intelligence visualization and structured forecasting. The platform should help users explore the global geopolitical environment, inspect countries, regions, events, and evidence, and create explainable forecasts with probabilities, confidence, rationale, and history.

The product must feel modern, high-end, analytical, and visually strong.

---

## 1. General Working Rules
- Work in phases.
- Prefer additive changes over risky rewrites.
- Do not destroy working code unless necessary.
- Keep architecture modular and readable.
- Use production-quality code patterns.
- Keep components reusable.
- Keep styling consistent through tokens and shared primitives.
- Use mock data first unless explicitly told to wire real ingestion.
- Finish one meaningful milestone at a time.

## 2. Product Priorities
Highest priorities:
1. premium UI/UX
2. excellent world overview and 3D visual experience
3. strong country/event/forecast pages
4. explainable forecasting workflows
5. clean architecture for future ingestion and agent workflows

Do not prioritize broad source ingestion early.

## 3. Build Order
Follow this order unless explicitly instructed otherwise:
1. app shell and project setup
2. design tokens and shared UI primitives
3. polished layouts and navigation
4. 3D globe / world overview
5. country, region, and event pages
6. forecasting workflows
7. backend contracts and schema
8. ingestion scaffolding
9. production hardening

## 4. Tech Direction
Preferred stack:
- Next.js
- TypeScript
- Tailwind CSS
- reusable UI component system
- React Three Fiber for 3D
- chart library for timelines and forecast history
- modular backend and shared schema patterns

If the existing repo differs slightly, stay consistent with what is already chosen unless change is clearly beneficial.

## 5. Design Direction
The product should look:
- premium
- dark-first
- modern
- analytical
- cinematic but restrained
- serious, not playful
- dense but readable

Include:
- layered panels
- subtle glass / blur where appropriate
- strong information hierarchy
- smooth transitions
- elegant hover states
- beautiful loading states
- high-quality globe visuals
- tasteful motion

Avoid:
- gimmicky cyberpunk visuals
- excessive neon
- chaotic animation
- inconsistent component styles
- low-value decorative clutter

## 6. 3D and Visual Rules
Use 3D to enhance comprehension, not distract from it.

Desired 3D features:
- interactive globe
- atmospheric glow
- country highlighting
- animated arcs or paths
- subtle risk pulses
- strong depth layering
- performance-aware rendering

Always provide graceful fallback behavior for lower-performance environments.

## 7. UI Generation Rules
You may use approved UI inspiration and generation workflows, but do not directly clone proprietary branded interfaces.

When generating major UI blocks:
- create 2 to 3 strong variations if useful
- choose the best direction
- normalize into project design tokens
- keep all final components visually consistent

If using generated UI patterns:
- stage them first
- clean them up
- unify naming and styling
- integrate them into the shared design system

## 8. Forecasting Rules
Every forecast must include:
- a clear question
- a measurable outcome
- a time horizon
- a probability
- a confidence level
- rationale
- uncertainty notes
- evidence
- resolution criteria
- history/version support

Do not collapse confidence and probability into the same field.

Do not use vague prediction objects.

## 9. Code Quality Rules
Before considering a task complete:
- ensure the code is clean and readable
- remove obvious dead code
- use strong naming
- keep components small enough to maintain
- avoid unnecessary duplication
- keep files organized logically
- run linting if configured
- run type checks if configured
- fix obvious errors introduced during work

## 10. Architecture Rules
Organize the codebase so future agentic coding is easy.

Prefer structure like:
- app routes/pages
- features by domain
- shared UI
- shared utilities
- shared schema/types
- mock data and seed data
- backend services
- forecast-related modules
- world/entity/event modules

## 11. Data Strategy
Early stages should use believable seeded mock data for:
- countries
- regions
- actors
- events
- alerts
- forecast questions
- forecasts
- indicators
- source evidence

Only move into real ingestion once the UI and data model are stable.

## 12. UX Rules
The app should feel usable from the earliest milestone.

Prioritize:
- intuitive navigation
- excellent visual hierarchy
- clear empty states
- elegant skeleton/loading states
- keyboard-friendly search
- inspectable evidence panels
- smooth page transitions
- readable dense information layouts

## 13. Delivery Rules
For each milestone:
- explain what was changed
- keep the changes scoped
- note any tradeoffs
- note what remains next
- avoid making unrelated large changes

## 14. Immediate Task
Start with Phase 1 only.

Phase 1 goals:
- create the application shell
- establish design tokens
- create shared layout primitives
- set up navigation
- create placeholder routes/pages
- create seeded mock data scaffolding
- create a polished dark theme
- create a premium-feeling foundation for later 3D and forecasting work

Do not implement broad live source ingestion yet.

## 15. Definition of Good Output
Good output is:
- polished
- coherent
- modular
- visually strong
- easy to extend
- aligned to the documents in /docs

When unsure, prefer clarity, elegance, and maintainability.