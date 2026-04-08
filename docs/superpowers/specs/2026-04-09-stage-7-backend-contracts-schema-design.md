# Stage 7: Backend Contracts & Schema — Design Spec
**Date:** 2026-04-09
**Phase:** 7 of 9 (CLAUDE.md build order)
**Status:** Approved

---

## Overview

Stage 7 moves the platform from mock data to a real PostgreSQL database. It adds:

1. **PostgreSQL in Docker** — local Postgres container via `docker-compose.yml`
2. **Prisma ORM** — schema-first, handles migrations and TypeScript type generation
3. **NextAuth.js v4** — credentials provider (email + password), JWT sessions, role-based access
4. **Seed scripts** — populate DB from existing mock data
5. **Data access layer** (`lib/db/`) — Prisma-backed functions replacing mock data imports in server components
6. **REST API routes** (`app/api/`) — typed Route Handlers for client-side mutations and external consumers
7. **Frontend wiring** — swap mock data imports for `lib/db/` calls in server component pages

---

## Architecture

Server components call Prisma directly via `lib/db/` (no HTTP round-trip). API routes handle client-side mutations from `'use client'` components and will serve as the external contract surface for Stage 8's ingestion pipeline. GET routes are public; mutation routes require a valid session.

```
Server Component → lib/db/ → Prisma → PostgreSQL
Client Component → app/api/ → lib/db/ → Prisma → PostgreSQL
External (Stage 8) → app/api/ → lib/db/ → Prisma → PostgreSQL
```

---

## 1. Infrastructure

### Docker Compose

`docker-compose.yml` at project root:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: osint
      POSTGRES_PASSWORD: osint
      POSTGRES_DB: osint_dev
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Environment Variables

`.env` (gitignored):
```
DATABASE_URL="postgresql://osint:osint@localhost:5432/osint_dev"
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

`.env.example` (committed):
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Packages

```bash
npm install prisma @prisma/client next-auth @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

---

## 2. Prisma Schema

File: `prisma/schema.prisma`

### Auth Tables (NextAuth Prisma Adapter)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String?
  role          UserRole  @default(viewer)
  createdAt     DateTime  @default(now())
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

enum UserRole {
  viewer
  analyst
  admin
}
```

### Domain Tables

```prisma
model Region {
  id                 String    @id
  slug               String    @unique
  name               String
  overallRiskScore   Int
  riskLevel          RiskLevel
  summary            String
  keyTensions        String[]
  lastUpdated        DateTime
  activeEventCount   Int       @default(0)
  activeForecastCount Int      @default(0)
  countries          Country[]
  forecasts          Forecast[]
}

model Country {
  id                  String    @id
  slug                String    @unique
  name                String
  iso2                String    @unique
  iso3                String    @unique
  regionId            String
  region              Region    @relation(fields: [regionId], references: [id])
  overallRiskScore    Int
  riskLevel           RiskLevel
  riskCategories      Json
  summary             String
  capital             String
  lastUpdated         DateTime
  alertCount          Int       @default(0)
  activeForecastCount Int       @default(0)
  population          BigInt?
  gdp                 BigInt?
  keyActors           Actor[]   @relation("CountryActors")
  forecasts           Forecast[] @relation("ForecastCountries")
  events              GeopoliticalEvent[] @relation("EventCountries")
}

model Actor {
  id               String           @id
  name             String
  type             ActorType
  role             String
  riskContribution RiskContribution
  description      String
  affiliations     String[]
  countries        Country[]        @relation("CountryActors")
  events           GeopoliticalEvent[] @relation("EventActors")
}

model GeopoliticalEvent {
  id                  String          @id
  title               String
  summary             String
  eventType           EventType
  severity            EventSeverity
  date                DateTime
  tags                String[]
  locationDescription String?
  impactAssessment    String?
  createdAt           DateTime        @default(now())
  sources             EventSource[]
  countries           Country[]       @relation("EventCountries")
  actors              Actor[]         @relation("EventActors")
  relatedForecasts    Forecast[]      @relation("ForecastEvents")
}

model EventSource {
  id          String              @id @default(cuid())
  title       String
  url         String
  reliability SourceReliability
  publishedAt DateTime?
  eventId     String
  event       GeopoliticalEvent   @relation(fields: [eventId], references: [id], onDelete: Cascade)
}

model Forecast {
  id                 String                @id
  title              String
  question           String
  status             ForecastStatus        @default(active)
  probability        Int
  confidenceLevel    ConfidenceLevel
  confidenceNotes    String
  rationale          String
  uncertaintyNotes   String
  timeHorizon        String
  targetDate         DateTime
  regionId           String
  region             Region                @relation(fields: [regionId], references: [id])
  resolutionCriteria String
  versionNumber      Int                   @default(1)
  tags               String[]
  createdAt          DateTime              @default(now())
  lastUpdated        DateTime              @updatedAt
  history            ForecastHistoryEntry[]
  evidence           ForecastEvidence[]
  countries          Country[]             @relation("ForecastCountries")
  relatedEvents      GeopoliticalEvent[]   @relation("ForecastEvents")
}

model ForecastHistoryEntry {
  id              String          @id @default(cuid())
  forecastId      String
  date            DateTime
  probability     Int
  confidenceLevel ConfidenceLevel
  changeReason    String
  analystNote     String?
  forecast        Forecast        @relation(fields: [forecastId], references: [id], onDelete: Cascade)
}

model ForecastEvidence {
  id          String            @id @default(cuid())
  forecastId  String
  title       String
  description String
  direction   EvidenceDirection
  weight      EvidenceWeight
  sourceUrl   String?
  addedAt     DateTime          @default(now())
  forecast    Forecast          @relation(fields: [forecastId], references: [id], onDelete: Cascade)
}
```

### Enums

```prisma
enum RiskLevel        { critical high elevated moderate low minimal }
enum ActorType        { state non_state international_org individual }
enum RiskContribution { high medium low }
enum EventType        { military diplomatic economic political humanitarian cyber }
enum EventSeverity    { critical high moderate low }
enum SourceReliability { high medium low }
enum ForecastStatus   { active resolved expired draft }
enum ConfidenceLevel  { low medium high }
enum EvidenceDirection { supporting opposing neutral }
enum EvidenceWeight   { strong moderate weak }
```

> **Note — enum naming:** Prisma enums cannot contain hyphens. `non_state` and `international_org` are the Prisma values; the existing TypeScript types use `'non-state'` and `'international-org'`. The `lib/db/` mapper functions translate between them. No changes needed to existing UI TypeScript types.

> **Note — Json fields:** `riskCategories` is stored as `Json`. The `lib/db/countries.ts` mapper casts it to `RiskCategories` on read.

---

## 3. Auth

**Package:** `next-auth` v4 with `@auth/prisma-adapter`

**Provider:** Credentials (email + bcrypt password hash)

**Session strategy:** JWT — role and user id included in the token, no database session lookup on every request.

**File:** `lib/auth.ts` — exports `authOptions` (NextAuth config) and `getServerSession` re-export for use in server components and API routes.

**Route:** `app/api/auth/[...nextauth]/route.ts` — thin wrapper around NextAuth handler.

**Middleware:** `middleware.ts` at project root — protects all `POST/PATCH/DELETE` to `/api/**`. Returns `401` JSON if no valid session. GET routes are unrestricted.

**Default seed user:**
- Email: `admin@osint.local`
- Password: `password`
- Role: `admin`

Session token payload:
```ts
interface SessionUser {
  id: string
  email: string
  name: string | null
  role: 'viewer' | 'analyst' | 'admin'
}
```

---

## 4. Seed Script

**File:** `prisma/seed.ts`

Iterates all mock data in order (regions → countries → actors → events → forecasts) and upserts each record. Relations are wired by id after all entities exist. Creates the default admin user if not present. Re-runnable safely.

**Config in `package.json`:**
```json
"prisma": {
  "seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts"
}
```

Run: `npx prisma db seed`

---

## 5. Data Access Layer

**Directory:** `lib/db/`

Each file exports async functions that call Prisma. Server components import these directly.

### `lib/db/forecasts.ts`

```ts
getForecasts(filters?: { status?: ForecastStatus; regionId?: string }): Promise<Forecast[]>
getForecastById(id: string): Promise<Forecast & { history, evidence, relatedEvents, countries } | null>
createForecast(draft: ForecastDraft): Promise<Forecast>
updateForecast(id: string, data: Partial<Forecast>): Promise<Forecast>
resolveForecast(id: string, outcome: ResolveOutcome): Promise<Forecast>
```

### `lib/db/events.ts`

```ts
getEvents(filters?: { severity?: EventSeverity; eventType?: EventType; countryId?: string }): Promise<GeopoliticalEvent[]>
getEventById(id: string): Promise<GeopoliticalEvent & { sources, countries, actors } | null>
createEvent(data: CreateEventInput): Promise<GeopoliticalEvent>
```

### `lib/db/countries.ts`

```ts
getCountries(): Promise<Country[]>
getCountryBySlug(slug: string): Promise<Country & { region, keyActors } | null>
```

### `lib/db/regions.ts`

```ts
getRegions(): Promise<Region[]>
getRegionBySlug(slug: string): Promise<Region & { countries } | null>
```

### Prisma client singleton

**File:** `lib/db/client.ts` — standard Next.js Prisma singleton pattern (prevents connection pool exhaustion in dev with hot reload).

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## 6. API Route Contracts

All responses: `{ data: T }` on success, `{ error: string }` on failure.

### Public GET routes

| Route | Handler | Response type |
|---|---|---|
| `GET /api/forecasts` | Returns all forecasts, supports `?status=&regionId=` | `{ data: Forecast[] }` |
| `GET /api/forecasts/[id]` | Single forecast + history + evidence + relatedEvents | `{ data: ForecastDetail }` |
| `GET /api/events` | All events, supports `?severity=&type=&countryId=` | `{ data: GeopoliticalEvent[] }` |
| `GET /api/events/[id]` | Single event + sources + countries + actors | `{ data: EventDetail }` |
| `GET /api/countries` | All countries | `{ data: Country[] }` |
| `GET /api/countries/[slug]` | Single country + region + keyActors | `{ data: CountryDetail }` |
| `GET /api/regions` | All regions | `{ data: Region[] }` |
| `GET /api/regions/[slug]` | Single region + countries | `{ data: RegionDetail }` |

### Auth-protected mutation routes

| Route | Body | Response |
|---|---|---|
| `POST /api/forecasts` | `ForecastDraft` from wizard | `{ data: Forecast }` |
| `PATCH /api/forecasts/[id]` | `Partial<Forecast>` | `{ data: Forecast }` |
| `POST /api/forecasts/[id]/resolve` | `ResolveOutcome` | `{ data: Forecast }` |
| `POST /api/events` | `CreateEventInput` | `{ data: GeopoliticalEvent }` |

All mutation routes validate the request body with **Zod** before calling `lib/db/`. Invalid bodies return `400 { error: string }`. Unauthenticated mutation requests return `401 { error: "Unauthorized" }`.

---

## 7. Frontend Wiring

Server component pages replace mock data imports with `lib/db/` calls. **Important pattern change:** `'use client'` view components (e.g. `ForecastsView`, `EventsView`) currently import mock data themselves. This must change — the parent server page fetches data and passes it as props. Each view component gains a typed props interface for the data it needs (e.g. `forecasts: Forecast[]`).

This affects:

| Page | Old import | New call |
|---|---|---|
| `app/forecasts/page.tsx` (via `ForecastsView`) | `mockForecasts` | `await getForecasts()` |
| `app/forecasts/[id]/page.tsx` | `mockForecasts`, `mockEvents`, `mockCountries` | `await getForecastById(id)` |
| `app/events/page.tsx` | `mockEvents` | `await getEvents()` |
| `app/events/[id]/page.tsx` | `mockEvents` | `await getEventById(id)` |
| `app/countries/page.tsx` | `mockCountries` | `await getCountries()` |
| `app/countries/[slug]/page.tsx` | `mockCountries`, `mockRegions` | `await getCountryBySlug(slug)` |
| `app/regions/page.tsx` | `mockRegions`, `mockCountries` | `await getRegions()` |
| `app/regions/[slug]/page.tsx` | `mockRegions`, `mockCountries`, `mockEvents`, `mockForecasts` | `await getRegionBySlug(slug)` |

`generateStaticParams` on each `[slug]/[id]` page is removed or changed to `export const dynamic = 'force-dynamic'` — static params are no longer appropriate once data comes from a live database.

The wizard's `POST /api/forecasts` call replaces the mock success state — the form submission now hits the API and gets a real forecast id back.

`ForecastDetailView`'s `handleResolve` now calls `POST /api/forecasts/[id]/resolve` instead of updating local state only.

---

## Out of Scope for Stage 7

- Role-based UI gating (showing/hiding buttons based on user role) — Stage 9
- Login/signup UI pages — Stage 9
- API pagination — Stage 8
- Rate limiting — Stage 9
- Event ingestion pipeline — Stage 8
- Email verification — Stage 9
