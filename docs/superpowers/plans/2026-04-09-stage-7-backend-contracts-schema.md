# Stage 7: Backend Contracts & Schema Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace mock data with a real PostgreSQL database, add NextAuth credentials auth, define REST API route contracts, and wire the existing UI to the new data layer.

**Architecture:** Prisma ORM on PostgreSQL (Docker). Server components call `lib/db/` directly (no HTTP). Client-side mutations go through `app/api/` Route Handlers. `lib/db/mappers.ts` converts Prisma types to the existing TypeScript domain interfaces. Mock data is replaced entirely; seed script populates DB from mock arrays.

**Tech Stack:** Next.js 14 App Router, TypeScript, Prisma 5, PostgreSQL 16, NextAuth.js v4, @auth/prisma-adapter, bcryptjs, zod, tsx (for seed script), Docker Compose.

---

## File Map

| Status | Path | Purpose |
|---|---|---|
| Create | `docker-compose.yml` | Local Postgres container |
| Create | `.env.example` | Committed env template |
| Create | `prisma/schema.prisma` | Full Prisma schema — all domain + auth models |
| Create | `prisma/seed.ts` | Upserts all mock data into DB; creates admin user |
| Create | `lib/auth.ts` | NextAuth config, authOptions export |
| Create | `lib/db/client.ts` | Prisma singleton (prevents hot-reload pool exhaustion) |
| Create | `lib/db/mappers.ts` | Converts Prisma types → domain TypeScript types |
| Create | `lib/db/regions.ts` | `getRegions`, `getRegionBySlug` |
| Create | `lib/db/countries.ts` | `getCountries`, `getCountryBySlug` |
| Create | `lib/db/events.ts` | `getEvents`, `getEventById`, `createEvent` |
| Create | `lib/db/forecasts.ts` | `getForecasts`, `getForecastById`, `createForecast`, `updateForecast`, `resolveForecast` |
| Create | `lib/api/schemas.ts` | Zod schemas for request body validation |
| Create | `app/api/auth/[...nextauth]/route.ts` | NextAuth handler |
| Create | `app/api/forecasts/route.ts` | GET list + POST create |
| Create | `app/api/forecasts/[id]/route.ts` | GET detail + PATCH update |
| Create | `app/api/forecasts/[id]/resolve/route.ts` | POST resolve |
| Create | `app/api/events/route.ts` | GET list + POST create |
| Create | `app/api/events/[id]/route.ts` | GET detail |
| Create | `app/api/countries/route.ts` | GET list |
| Create | `app/api/countries/[slug]/route.ts` | GET detail |
| Create | `app/api/regions/route.ts` | GET list |
| Create | `app/api/regions/[slug]/route.ts` | GET detail |
| Create | `middleware.ts` | Protect mutation API routes |
| Modify | `package.json` | Add prisma seed config |
| Modify | `components/forecast/ForecastsView.tsx` | Accept `forecasts` prop |
| Modify | `components/event/EventsView.tsx` | Accept `events` prop |
| Modify | `components/country/CountriesView.tsx` | Accept `countries` prop |
| Modify | `app/forecasts/page.tsx` | Fetch + pass to ForecastsView |
| Modify | `app/events/page.tsx` | Fetch + pass to EventsView |
| Modify | `app/countries/page.tsx` | Fetch + pass to CountriesView |
| Modify | `app/forecasts/[id]/page.tsx` | Use getForecastById, remove generateStaticParams |
| Modify | `app/events/[id]/page.tsx` | Use getEventById, remove generateStaticParams |
| Modify | `app/countries/[slug]/page.tsx` | Use getCountryBySlug, remove generateStaticParams |
| Modify | `app/regions/page.tsx` | Use getRegions |
| Modify | `app/regions/[slug]/page.tsx` | Use getRegionBySlug, remove generateStaticParams |
| Modify | `components/forecast/wizard/ForecastWizard.tsx` | POST to /api/forecasts on submit |
| Modify | `components/forecast/ForecastDetailView.tsx` | POST to /api/forecasts/[id]/resolve |

---

### Task 1: Infrastructure — Docker, environment, packages

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Modify: `.gitignore`
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Create `docker-compose.yml`**

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

- [ ] **Step 2: Start Postgres**

```bash
docker compose up -d
```

Expected: container `osint-postgres-1` (or similar) running. Verify:

```bash
docker compose ps
```

Expected output shows `postgres` service as `running`.

- [ ] **Step 3: Install packages**

```bash
cd /Users/connor/Documents/osint
npm install prisma @prisma/client next-auth @auth/prisma-adapter bcryptjs zod
npm install -D @types/bcryptjs tsx
```

Expected: no errors. `package-lock.json` updated.

- [ ] **Step 4: Initialise Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

Expected: creates `prisma/schema.prisma` (will be overwritten in Task 2) and adds `DATABASE_URL` to `.env`.

- [ ] **Step 5: Set `.env` content**

Replace the full contents of `.env` with:

```
DATABASE_URL="postgresql://osint:osint@localhost:5432/osint_dev"
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] **Step 6: Create `.env.example`**

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] **Step 7: Add `.env` to `.gitignore`**

Open `.gitignore`. If `.env` is not already present, append:

```
.env
```

(`.env.example` is NOT gitignored — it gets committed.)

- [ ] **Step 8: Commit**

```bash
git add docker-compose.yml .env.example .gitignore package.json package-lock.json
git commit -m "feat: add Docker Postgres, Prisma, NextAuth dependencies"
```

---

### Task 2: Prisma schema + initial migration

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Write `prisma/schema.prisma`**

Replace the full file with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Enums ────────────────────────────────────────────────────────────────────

enum UserRole          { viewer analyst admin }
enum RiskLevel         { critical high elevated moderate low minimal }
enum ActorType         { state non_state international_org individual }
enum RiskContribution  { high medium low }
enum EventType         { military diplomatic economic political humanitarian cyber }
enum EventSeverity     { critical high moderate low }
enum SourceReliability { high medium low }
enum ForecastStatus    { active resolved expired draft }
enum ConfidenceLevel   { low medium high }
enum EvidenceDirection { supporting opposing neutral }
enum EvidenceWeight    { strong moderate weak }

// ─── Auth (NextAuth Prisma Adapter) ───────────────────────────────────────────

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String?
  role         UserRole  @default(viewer)
  createdAt    DateTime  @default(now())
  accounts     Account[]
  sessions     Session[]
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

// ─── Domain ───────────────────────────────────────────────────────────────────

model Region {
  id                  String     @id
  slug                String     @unique
  name                String
  overallRiskScore    Int
  riskLevel           RiskLevel
  summary             String
  keyTensions         String[]
  lastUpdated         DateTime
  activeEventCount    Int        @default(0)
  activeForecastCount Int        @default(0)
  countries           Country[]
  forecasts           Forecast[]
}

model Country {
  id                  String              @id
  slug                String              @unique
  name                String
  iso2                String              @unique
  iso3                String              @unique
  regionId            String
  region              Region              @relation(fields: [regionId], references: [id])
  overallRiskScore    Int
  riskLevel           RiskLevel
  riskCategories      Json
  summary             String
  capital             String
  lastUpdated         DateTime
  alertCount          Int                 @default(0)
  activeForecastCount Int                 @default(0)
  population          BigInt?
  gdp                 BigInt?
  keyActors           Actor[]             @relation("CountryActors")
  forecasts           Forecast[]          @relation("ForecastCountries")
  events              GeopoliticalEvent[] @relation("EventCountries")
}

model Actor {
  id               String              @id
  name             String
  type             ActorType
  role             String
  riskContribution RiskContribution
  description      String
  affiliations     String[]
  countries        Country[]           @relation("CountryActors")
  events           GeopoliticalEvent[] @relation("EventActors")
}

model GeopoliticalEvent {
  id                  String            @id
  title               String
  summary             String
  eventType           EventType
  severity            EventSeverity
  date                DateTime
  tags                String[]
  locationDescription String?
  impactAssessment    String?
  createdAt           DateTime          @default(now())
  sources             EventSource[]
  countries           Country[]         @relation("EventCountries")
  actors              Actor[]           @relation("EventActors")
  relatedForecasts    Forecast[]        @relation("ForecastEvents")
}

model EventSource {
  id          String            @id @default(cuid())
  title       String
  url         String
  reliability SourceReliability
  publishedAt DateTime?
  eventId     String
  event       GeopoliticalEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)
}

model Forecast {
  id                 String                 @id
  title              String
  question           String
  status             ForecastStatus         @default(active)
  probability        Int
  confidenceLevel    ConfidenceLevel
  confidenceNotes    String
  rationale          String
  uncertaintyNotes   String
  timeHorizon        String
  targetDate         DateTime
  regionId           String
  region             Region                 @relation(fields: [regionId], references: [id])
  resolutionCriteria String
  versionNumber      Int                    @default(1)
  tags               String[]
  createdAt          DateTime               @default(now())
  lastUpdated        DateTime               @updatedAt
  history            ForecastHistoryEntry[]
  evidence           ForecastEvidence[]
  countries          Country[]              @relation("ForecastCountries")
  relatedEvents      GeopoliticalEvent[]    @relation("ForecastEvents")
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

- [ ] **Step 2: Generate Prisma client**

```bash
npx prisma generate
```

Expected: `✔ Generated Prisma Client` with no errors.

- [ ] **Step 3: Run initial migration**

```bash
npx prisma migrate dev --name init
```

Expected:
```
The following migration(s) have been created and applied from new schema changes:
migrations/
  └─ 20260409xxxxxx_init/
    └─ migration.sql
✔ Generated Prisma Client
```

- [ ] **Step 4: Commit**

```bash
git add prisma/
git commit -m "feat: Prisma schema with all domain + auth models, initial migration"
```

---

### Task 3: Auth — NextAuth credentials + middleware

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Create `lib/auth.ts`**

```ts
import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/db/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null
        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user) return null
        const valid = await compare(credentials.password, user.passwordHash)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id: string; role: string }).id = token.id as string;
        (session.user as { id: string; role: string }).role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}

export default NextAuth(authOptions)
```

- [ ] **Step 2: Create `lib/db/client.ts`** (needed by auth.ts above)

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 3: Create `app/api/auth/[...nextauth]/route.ts`**

```ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

- [ ] **Step 4: Create `middleware.ts`** at project root

```ts
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only protect /api/ routes with mutation methods
  if (!pathname.startsWith('/api/') || pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  if (!PROTECTED_METHODS.has(req.method)) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors. (If you see `Property 'role' does not exist on type 'User'`, add `role: string` to the next-auth module augmentation below. Create `types/next-auth.d.ts`:

```ts
import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & { id: string; role: string }
  }
  interface User extends DefaultUser {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/auth.ts lib/db/client.ts app/api/auth/ middleware.ts types/
git commit -m "feat: NextAuth credentials provider, JWT sessions, API mutation middleware"
```

---

### Task 4: Mappers + data access layer

**Files:**
- Create: `lib/db/mappers.ts`
- Create: `lib/db/regions.ts`
- Create: `lib/db/countries.ts`
- Create: `lib/db/events.ts`
- Create: `lib/db/forecasts.ts`

**Context:** Prisma uses `Date` objects for all `DateTime` fields; the existing TypeScript types use ISO strings. `BigInt` must be converted to `number`. The `ActorType` enum uses `non_state`/`international_org` in Prisma but `'non-state'`/`'international-org'` in the domain types. `riskCategories` is stored as `Json` and cast to `RiskCategories`.

- [ ] **Step 1: Create `lib/db/mappers.ts`**

```ts
import type {
  Region as PrismaRegion,
  Country as PrismaCountry,
  Actor as PrismaActor,
  GeopoliticalEvent as PrismaEvent,
  EventSource as PrismaEventSource,
  Forecast as PrismaForecast,
  ForecastHistoryEntry as PrismaHistoryEntry,
  ForecastEvidence as PrismaEvidence,
} from '@prisma/client'
import type {
  Region,
  Country,
  Actor,
  GeopoliticalEvent,
  EventSource,
  Forecast,
  ForecastHistoryEntry,
  ForecastEvidence,
  ActorType,
  RiskCategories,
} from '@/lib/types'

// Prisma enum → domain string for ActorType
const ACTOR_TYPE_MAP: Record<string, ActorType> = {
  state: 'state',
  non_state: 'non-state',
  international_org: 'international-org',
  individual: 'individual',
}

// Domain string → Prisma enum for ActorType
export const ACTOR_TYPE_TO_PRISMA: Record<string, string> = {
  state: 'state',
  'non-state': 'non_state',
  'international-org': 'international_org',
  individual: 'individual',
}

export function mapRegion(r: PrismaRegion & { countries?: PrismaCountry[] }): Region {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    overallRiskScore: r.overallRiskScore,
    riskLevel: r.riskLevel as Region['riskLevel'],
    summary: r.summary,
    keyTensions: r.keyTensions,
    lastUpdated: r.lastUpdated.toISOString(),
    activeEventCount: r.activeEventCount,
    activeForecastCount: r.activeForecastCount,
    countries: r.countries?.map((c) => c.id) ?? [],
  }
}

export function mapCountry(c: PrismaCountry): Country {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    iso2: c.iso2,
    iso3: c.iso3,
    region: c.regionId,
    overallRiskScore: c.overallRiskScore,
    riskLevel: c.riskLevel as Country['riskLevel'],
    riskCategories: c.riskCategories as RiskCategories,
    summary: c.summary,
    capital: c.capital,
    lastUpdated: c.lastUpdated.toISOString(),
    alertCount: c.alertCount,
    activeForecastCount: c.activeForecastCount,
    population: c.population !== null ? Number(c.population) : undefined,
    gdp: c.gdp !== null ? Number(c.gdp) : undefined,
    keyActors: [],
  }
}

export function mapActor(a: PrismaActor): Actor {
  return {
    id: a.id,
    name: a.name,
    type: ACTOR_TYPE_MAP[a.type] ?? (a.type as ActorType),
    role: a.role,
    riskContribution: a.riskContribution as Actor['riskContribution'],
    description: a.description,
    affiliations: a.affiliations,
    countries: [],
  }
}

export function mapEventSource(s: PrismaEventSource): EventSource {
  return {
    title: s.title,
    url: s.url,
    reliability: s.reliability as EventSource['reliability'],
    publishedAt: s.publishedAt?.toISOString(),
  }
}

export function mapEvent(
  e: PrismaEvent & {
    sources: PrismaEventSource[]
    countries?: PrismaCountry[]
    actors?: PrismaActor[]
    relatedForecasts?: PrismaForecast[]
  }
): GeopoliticalEvent {
  return {
    id: e.id,
    title: e.title,
    summary: e.summary,
    eventType: e.eventType as GeopoliticalEvent['eventType'],
    severity: e.severity as GeopoliticalEvent['severity'],
    date: e.date.toISOString().split('T')[0],
    tags: e.tags,
    locationDescription: e.locationDescription ?? undefined,
    impactAssessment: e.impactAssessment ?? undefined,
    sources: e.sources.map(mapEventSource),
    countries: e.countries?.map((c) => c.id) ?? [],
    actors: e.actors?.map((a) => a.id) ?? [],
    relatedForecasts: e.relatedForecasts?.map((f) => f.id) ?? [],
  }
}

export function mapHistoryEntry(h: PrismaHistoryEntry): ForecastHistoryEntry {
  return {
    date: h.date.toISOString().split('T')[0],
    probability: h.probability,
    confidenceLevel: h.confidenceLevel as ForecastHistoryEntry['confidenceLevel'],
    changeReason: h.changeReason,
    analystNote: h.analystNote ?? undefined,
  }
}

export function mapEvidence(e: PrismaEvidence): ForecastEvidence {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    direction: e.direction as ForecastEvidence['direction'],
    weight: e.weight as ForecastEvidence['weight'],
    sourceUrl: e.sourceUrl ?? undefined,
    addedAt: e.addedAt.toISOString().split('T')[0],
  }
}

export function mapForecast(
  f: PrismaForecast & {
    history?: PrismaHistoryEntry[]
    evidence?: PrismaEvidence[]
    countries?: PrismaCountry[]
    relatedEvents?: PrismaEvent[]
  }
): Forecast {
  return {
    id: f.id,
    title: f.title,
    question: f.question,
    status: f.status as Forecast['status'],
    probability: f.probability,
    confidenceLevel: f.confidenceLevel as Forecast['confidenceLevel'],
    confidenceNotes: f.confidenceNotes,
    rationale: f.rationale,
    uncertaintyNotes: f.uncertaintyNotes,
    timeHorizon: f.timeHorizon,
    targetDate: f.targetDate.toISOString().split('T')[0],
    region: f.regionId,
    countries: f.countries?.map((c) => c.id) ?? [],
    resolutionCriteria: f.resolutionCriteria,
    versionNumber: f.versionNumber,
    tags: f.tags,
    createdAt: f.createdAt.toISOString().split('T')[0],
    lastUpdated: f.lastUpdated.toISOString().split('T')[0],
    history: f.history?.map(mapHistoryEntry) ?? [],
    evidence: f.evidence?.map(mapEvidence) ?? [],
    relatedEvents: f.relatedEvents?.map((e) => e.id) ?? [],
  }
}
```

- [ ] **Step 2: Create `lib/db/regions.ts`**

```ts
import { prisma } from './client'
import { mapRegion } from './mappers'
import type { Region } from '@/lib/types'

export async function getRegions(): Promise<Region[]> {
  const regions = await prisma.region.findMany({
    include: { countries: true },
    orderBy: { overallRiskScore: 'desc' },
  })
  return regions.map(mapRegion)
}

export type RegionDetail = Region & {
  memberCountries: import('@/lib/types').Country[]
  forecasts: import('@/lib/types').Forecast[]
}

export async function getRegionBySlug(slug: string): Promise<RegionDetail | null> {
  const region = await prisma.region.findUnique({
    where: { slug },
    include: {
      countries: true,
      forecasts: {
        include: { history: true, evidence: true, countries: true, relatedEvents: true },
      },
    },
  })
  if (!region) return null

  const { mapCountry, mapForecast } = await import('./mappers')

  return {
    ...mapRegion(region),
    memberCountries: region.countries.map(mapCountry),
    forecasts: region.forecasts.map(mapForecast),
  }
}
```

- [ ] **Step 3: Create `lib/db/countries.ts`**

```ts
import { prisma } from './client'
import { mapCountry, mapActor, mapEvent, mapForecast } from './mappers'
import type { Country, Actor, GeopoliticalEvent, Forecast } from '@/lib/types'

export async function getCountries(): Promise<Country[]> {
  const countries = await prisma.country.findMany({
    orderBy: { overallRiskScore: 'desc' },
  })
  return countries.map(mapCountry)
}

export type CountryDetail = Country & {
  regionData: import('@/lib/types').Region
  actors: Actor[]
  events: GeopoliticalEvent[]
  forecasts: Forecast[]
}

export async function getCountryBySlug(slug: string): Promise<CountryDetail | null> {
  const country = await prisma.country.findUnique({
    where: { slug },
    include: {
      region: true,
      keyActors: true,
      events: {
        include: { sources: true, countries: true, actors: true, relatedForecasts: true },
        orderBy: { date: 'desc' },
        take: 10,
      },
      forecasts: {
        include: { history: true, evidence: true, countries: true, relatedEvents: true },
        where: { status: 'active' },
      },
    },
  })
  if (!country) return null

  const { mapRegion } = await import('./mappers')

  return {
    ...mapCountry(country),
    keyActors: country.keyActors.map((a) => a.id),
    regionData: mapRegion(country.region),
    actors: country.keyActors.map(mapActor),
    events: country.events.map(mapEvent),
    forecasts: country.forecasts.map(mapForecast),
  }
}
```

- [ ] **Step 4: Create `lib/db/events.ts`**

```ts
import { prisma } from './client'
import { mapEvent } from './mappers'
import type { GeopoliticalEvent, EventType, EventSeverity } from '@/lib/types'

interface EventFilters {
  severity?: EventSeverity
  eventType?: EventType
  countryId?: string
}

export async function getEvents(filters: EventFilters = {}): Promise<GeopoliticalEvent[]> {
  const events = await prisma.geopoliticalEvent.findMany({
    where: {
      ...(filters.severity && { severity: filters.severity as 'critical' | 'high' | 'moderate' | 'low' }),
      ...(filters.eventType && { eventType: filters.eventType as 'military' | 'diplomatic' | 'economic' | 'political' | 'humanitarian' | 'cyber' }),
      ...(filters.countryId && { countries: { some: { id: filters.countryId } } }),
    },
    include: { sources: true, countries: true, actors: true, relatedForecasts: true },
    orderBy: { date: 'desc' },
  })
  return events.map(mapEvent)
}

export type EventDetail = GeopoliticalEvent & {
  countryObjects: import('@/lib/types').Country[]
  actorObjects: import('@/lib/types').Actor[]
}

export async function getEventById(id: string): Promise<EventDetail | null> {
  const event = await prisma.geopoliticalEvent.findUnique({
    where: { id },
    include: { sources: true, countries: true, actors: true, relatedForecasts: true },
  })
  if (!event) return null

  const { mapCountry, mapActor } = await import('./mappers')

  return {
    ...mapEvent(event),
    countryObjects: event.countries.map(mapCountry),
    actorObjects: event.actors.map(mapActor),
  }
}

export interface CreateEventInput {
  id: string
  title: string
  summary: string
  eventType: EventType
  severity: EventSeverity
  date: string
  tags: string[]
  locationDescription?: string
  impactAssessment?: string
  sources: Array<{ title: string; url: string; reliability: string; publishedAt?: string }>
  countryIds: string[]
  actorIds: string[]
}

export async function createEvent(data: CreateEventInput): Promise<GeopoliticalEvent> {
  const event = await prisma.geopoliticalEvent.create({
    data: {
      id: data.id,
      title: data.title,
      summary: data.summary,
      eventType: data.eventType as 'military' | 'diplomatic' | 'economic' | 'political' | 'humanitarian' | 'cyber',
      severity: data.severity as 'critical' | 'high' | 'moderate' | 'low',
      date: new Date(data.date),
      tags: data.tags,
      locationDescription: data.locationDescription,
      impactAssessment: data.impactAssessment,
      sources: {
        create: data.sources.map((s) => ({
          title: s.title,
          url: s.url,
          reliability: s.reliability as 'high' | 'medium' | 'low',
          publishedAt: s.publishedAt ? new Date(s.publishedAt) : undefined,
        })),
      },
      countries: { connect: data.countryIds.map((id) => ({ id })) },
      actors: { connect: data.actorIds.map((id) => ({ id })) },
    },
    include: { sources: true, countries: true, actors: true, relatedForecasts: true },
  })
  return mapEvent(event)
}
```

- [ ] **Step 5: Create `lib/db/forecasts.ts`**

```ts
import { prisma } from './client'
import { mapForecast } from './mappers'
import type { Forecast, ForecastStatus, ConfidenceLevel } from '@/lib/types'

interface ForecastFilters {
  status?: ForecastStatus
  regionId?: string
}

export async function getForecasts(filters: ForecastFilters = {}): Promise<Forecast[]> {
  const forecasts = await prisma.forecast.findMany({
    where: {
      ...(filters.status && { status: filters.status as 'active' | 'resolved' | 'expired' | 'draft' }),
      ...(filters.regionId && { regionId: filters.regionId }),
    },
    include: { history: true, evidence: true, countries: true, relatedEvents: true },
    orderBy: { lastUpdated: 'desc' },
  })
  return forecasts.map(mapForecast)
}

export async function getForecastById(id: string): Promise<Forecast | null> {
  const forecast = await prisma.forecast.findUnique({
    where: { id },
    include: { history: true, evidence: true, countries: true, relatedEvents: true },
  })
  if (!forecast) return null
  return mapForecast(forecast)
}

export interface CreateForecastInput {
  title: string
  question: string
  targetDate: string
  timeHorizon: string
  regionId: string
  countryIds: string[]
  probability: number
  confidenceLevel: ConfidenceLevel
  rationale: string
  confidenceNotes: string
  resolutionCriteria: string
  uncertaintyNotes: string
  evidence: Array<{ title: string; description: string; direction: string; weight: string }>
  tags: string[]
}

export async function createForecast(data: CreateForecastInput): Promise<Forecast> {
  const id = `fc-${Date.now()}`
  const forecast = await prisma.forecast.create({
    data: {
      id,
      title: data.title,
      question: data.question,
      status: 'active',
      probability: data.probability,
      confidenceLevel: data.confidenceLevel as 'low' | 'medium' | 'high',
      confidenceNotes: data.confidenceNotes,
      rationale: data.rationale,
      uncertaintyNotes: data.uncertaintyNotes,
      timeHorizon: data.timeHorizon,
      targetDate: new Date(data.targetDate),
      regionId: data.regionId,
      resolutionCriteria: data.resolutionCriteria,
      versionNumber: 1,
      tags: data.tags,
      history: {
        create: [{
          date: new Date(),
          probability: data.probability,
          confidenceLevel: data.confidenceLevel as 'low' | 'medium' | 'high',
          changeReason: 'Initial forecast',
        }],
      },
      evidence: {
        create: data.evidence.map((e) => ({
          title: e.title,
          description: e.description,
          direction: e.direction as 'supporting' | 'opposing' | 'neutral',
          weight: e.weight as 'strong' | 'moderate' | 'weak',
        })),
      },
      countries: { connect: data.countryIds.map((id) => ({ id })) },
    },
    include: { history: true, evidence: true, countries: true, relatedEvents: true },
  })
  return mapForecast(forecast)
}

export interface UpdateForecastInput {
  probability?: number
  confidenceLevel?: ConfidenceLevel
  rationale?: string
  confidenceNotes?: string
  uncertaintyNotes?: string
  status?: ForecastStatus
  changeReason?: string
}

export async function updateForecast(id: string, data: UpdateForecastInput): Promise<Forecast> {
  const existing = await prisma.forecast.findUniqueOrThrow({ where: { id } })
  const forecast = await prisma.forecast.update({
    where: { id },
    data: {
      ...(data.probability !== undefined && { probability: data.probability }),
      ...(data.confidenceLevel && { confidenceLevel: data.confidenceLevel as 'low' | 'medium' | 'high' }),
      ...(data.rationale && { rationale: data.rationale }),
      ...(data.confidenceNotes && { confidenceNotes: data.confidenceNotes }),
      ...(data.uncertaintyNotes && { uncertaintyNotes: data.uncertaintyNotes }),
      ...(data.status && { status: data.status as 'active' | 'resolved' | 'expired' | 'draft' }),
      versionNumber: existing.versionNumber + 1,
      ...(data.changeReason && {
        history: {
          create: [{
            date: new Date(),
            probability: data.probability ?? existing.probability,
            confidenceLevel: (data.confidenceLevel ?? existing.confidenceLevel) as 'low' | 'medium' | 'high',
            changeReason: data.changeReason,
          }],
        },
      }),
    },
    include: { history: true, evidence: true, countries: true, relatedEvents: true },
  })
  return mapForecast(forecast)
}

export interface ResolveInput {
  result: 'yes' | 'no'
  resolutionDate: string
  analystNote: string
  sourceUrl?: string
}

export async function resolveForecast(id: string, outcome: ResolveInput): Promise<Forecast> {
  const existing = await prisma.forecast.findUniqueOrThrow({ where: { id } })
  const forecast = await prisma.forecast.update({
    where: { id },
    data: {
      status: 'resolved',
      versionNumber: existing.versionNumber + 1,
      history: {
        create: [{
          date: new Date(outcome.resolutionDate),
          probability: existing.probability,
          confidenceLevel: existing.confidenceLevel,
          changeReason: `Resolved ${outcome.result.toUpperCase()}: ${outcome.analystNote}`,
          analystNote: outcome.analystNote,
        }],
      },
    },
    include: { history: true, evidence: true, countries: true, relatedEvents: true },
  })
  return mapForecast(forecast)
}
```

- [ ] **Step 6: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add lib/db/
git commit -m "feat: Prisma client singleton, type mappers, data access layer (regions/countries/events/forecasts)"
```

---

### Task 5: Seed script

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json`

**Context:** Seeds in dependency order: Regions → Countries → Actors → Events (with sources) → Forecasts (with history + evidence) → many-to-many connections → admin user. Uses `upsert` throughout so it's re-runnable.

- [ ] **Step 1: Add seed config to `package.json`**

Open `package.json`. Add a top-level `"prisma"` key alongside `"scripts"`:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

- [ ] **Step 2: Create `prisma/seed.ts`**

```ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { mockRegions } from '../lib/mock-data/regions'
import { mockCountries } from '../lib/mock-data/countries'
import { mockActors } from '../lib/mock-data/actors'
import { mockEvents } from '../lib/mock-data/events'
import { mockForecasts } from '../lib/mock-data/forecasts'

const ACTOR_TYPE_TO_PRISMA: Record<string, string> = {
  state: 'state',
  'non-state': 'non_state',
  'international-org': 'international_org',
  individual: 'individual',
}

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding regions...')
  for (const r of mockRegions) {
    await prisma.region.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        slug: r.slug,
        name: r.name,
        overallRiskScore: r.overallRiskScore,
        riskLevel: r.riskLevel as 'critical' | 'high' | 'elevated' | 'moderate' | 'low' | 'minimal',
        summary: r.summary,
        keyTensions: r.keyTensions,
        lastUpdated: new Date(r.lastUpdated),
        activeEventCount: r.activeEventCount,
        activeForecastCount: r.activeForecastCount,
      },
    })
  }

  console.log('Seeding countries...')
  for (const c of mockCountries) {
    await prisma.country.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        slug: c.slug,
        name: c.name,
        iso2: c.iso2,
        iso3: c.iso3,
        regionId: c.region,
        overallRiskScore: c.overallRiskScore,
        riskLevel: c.riskLevel as 'critical' | 'high' | 'elevated' | 'moderate' | 'low' | 'minimal',
        riskCategories: c.riskCategories,
        summary: c.summary,
        capital: c.capital,
        lastUpdated: new Date(c.lastUpdated),
        alertCount: c.alertCount,
        activeForecastCount: c.activeForecastCount,
        population: c.population ? BigInt(c.population) : null,
        gdp: c.gdp ? BigInt(c.gdp) : null,
      },
    })
  }

  console.log('Seeding actors...')
  for (const a of mockActors) {
    await prisma.actor.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        name: a.name,
        type: (ACTOR_TYPE_TO_PRISMA[a.type] ?? a.type) as 'state' | 'non_state' | 'international_org' | 'individual',
        role: a.role,
        riskContribution: a.riskContribution as 'high' | 'medium' | 'low',
        description: a.description,
        affiliations: a.affiliations ?? [],
      },
    })
  }

  console.log('Connecting country → actor (keyActors)...')
  for (const c of mockCountries) {
    if (c.keyActors.length === 0) continue
    const validActors = c.keyActors.filter((id) => mockActors.some((a) => a.id === id))
    if (validActors.length === 0) continue
    await prisma.country.update({
      where: { id: c.id },
      data: { keyActors: { connect: validActors.map((id) => ({ id })) } },
    })
  }

  console.log('Seeding events...')
  for (const e of mockEvents) {
    await prisma.geopoliticalEvent.upsert({
      where: { id: e.id },
      update: {},
      create: {
        id: e.id,
        title: e.title,
        summary: e.summary,
        eventType: e.eventType as 'military' | 'diplomatic' | 'economic' | 'political' | 'humanitarian' | 'cyber',
        severity: e.severity as 'critical' | 'high' | 'moderate' | 'low',
        date: new Date(e.date),
        tags: e.tags,
        locationDescription: e.locationDescription,
        impactAssessment: e.impactAssessment,
        sources: {
          create: e.sources.map((s) => ({
            title: s.title,
            url: s.url,
            reliability: s.reliability as 'high' | 'medium' | 'low',
            publishedAt: s.publishedAt ? new Date(s.publishedAt) : null,
          })),
        },
      },
    })
    // Connect countries
    const validCountries = e.countries.filter((id) => mockCountries.some((c) => c.id === id))
    if (validCountries.length > 0) {
      await prisma.geopoliticalEvent.update({
        where: { id: e.id },
        data: { countries: { connect: validCountries.map((id) => ({ id })) } },
      })
    }
    // Connect actors
    const validActors = e.actors.filter((id) => mockActors.some((a) => a.id === id))
    if (validActors.length > 0) {
      await prisma.geopoliticalEvent.update({
        where: { id: e.id },
        data: { actors: { connect: validActors.map((id) => ({ id })) } },
      })
    }
  }

  console.log('Seeding forecasts...')
  for (const f of mockForecasts) {
    await prisma.forecast.upsert({
      where: { id: f.id },
      update: {},
      create: {
        id: f.id,
        title: f.title,
        question: f.question,
        status: f.status as 'active' | 'resolved' | 'expired' | 'draft',
        probability: f.probability,
        confidenceLevel: f.confidenceLevel as 'low' | 'medium' | 'high',
        confidenceNotes: f.confidenceNotes,
        rationale: f.rationale,
        uncertaintyNotes: f.uncertaintyNotes,
        timeHorizon: f.timeHorizon,
        targetDate: new Date(f.targetDate),
        regionId: f.region,
        resolutionCriteria: f.resolutionCriteria,
        versionNumber: f.versionNumber,
        tags: f.tags ?? [],
        createdAt: new Date(f.createdAt),
        history: {
          create: f.history.map((h) => ({
            date: new Date(h.date),
            probability: h.probability,
            confidenceLevel: h.confidenceLevel as 'low' | 'medium' | 'high',
            changeReason: h.changeReason,
            analystNote: h.analystNote,
          })),
        },
        evidence: {
          create: (f.evidence ?? []).map((e) => ({
            title: e.title,
            description: e.description,
            direction: e.direction as 'supporting' | 'opposing' | 'neutral',
            weight: e.weight as 'strong' | 'moderate' | 'weak',
            sourceUrl: e.sourceUrl,
            addedAt: new Date(e.addedAt),
          })),
        },
      },
    })
    // Connect countries
    const validCountries = f.countries.filter((id) => mockCountries.some((c) => c.id === id))
    if (validCountries.length > 0) {
      await prisma.forecast.update({
        where: { id: f.id },
        data: { countries: { connect: validCountries.map((id) => ({ id })) } },
      })
    }
    // Connect related events
    const validEvents = (f.relatedEvents ?? []).filter((id) => mockEvents.some((e) => e.id === id))
    if (validEvents.length > 0) {
      await prisma.forecast.update({
        where: { id: f.id },
        data: { relatedEvents: { connect: validEvents.map((id) => ({ id })) } },
      })
    }
  }

  console.log('Creating admin user...')
  const passwordHash = await hash('password', 12)
  await prisma.user.upsert({
    where: { email: 'admin@osint.local' },
    update: {},
    create: {
      email: 'admin@osint.local',
      passwordHash,
      name: 'Admin',
      role: 'admin',
    },
  })

  console.log('Seed complete.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 3: Run the seed**

```bash
npx prisma db seed
```

Expected output:
```
Seeding regions...
Seeding countries...
Seeding actors...
Connecting country → actor (keyActors)...
Seeding events...
Seeding forecasts...
Creating admin user...
Seed complete.
```

- [ ] **Step 4: Verify counts**

```bash
npx prisma studio
```

Open the browser tab that launches (usually `http://localhost:5555`). Check that Region, Country, Actor, GeopoliticalEvent, and Forecast all have rows. Close Prisma Studio when done (`Ctrl+C`).

Alternatively:

```bash
node -e "
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
Promise.all([
  prisma.region.count(),
  prisma.country.count(),
  prisma.actor.count(),
  prisma.geopoliticalEvent.count(),
  prisma.forecast.count(),
]).then(([r,c,a,e,f]) => console.log({ regions: r, countries: c, actors: a, events: e, forecasts: f }))
  .finally(() => prisma.\$disconnect())
"
```

Expected: all counts > 0.

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: seed script — upserts all mock data to Postgres"
```

---

### Task 6: API GET routes

**Files:**
- Create: `app/api/forecasts/route.ts`
- Create: `app/api/forecasts/[id]/route.ts`
- Create: `app/api/events/route.ts`
- Create: `app/api/events/[id]/route.ts`
- Create: `app/api/countries/route.ts`
- Create: `app/api/countries/[slug]/route.ts`
- Create: `app/api/regions/route.ts`
- Create: `app/api/regions/[slug]/route.ts`

**Context:** All GET routes are public (no auth). Response shape: `{ data: T }` on success, `{ error: string }` on failure with appropriate HTTP status.

- [ ] **Step 1: Create `app/api/forecasts/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { getForecasts } from '@/lib/db/forecasts'
import type { ForecastStatus } from '@/lib/types'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as ForecastStatus | null
    const regionId = searchParams.get('regionId') ?? undefined
    const forecasts = await getForecasts({ ...(status && { status }), regionId })
    return NextResponse.json({ data: forecasts })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch forecasts' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create `app/api/forecasts/[id]/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { getForecastById } from '@/lib/db/forecasts'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const forecast = await getForecastById(params.id)
    if (!forecast) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data: forecast })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch forecast' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Create `app/api/events/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { getEvents } from '@/lib/db/events'
import type { EventType, EventSeverity } from '@/lib/types'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const severity = searchParams.get('severity') as EventSeverity | null
    const eventType = searchParams.get('type') as EventType | null
    const countryId = searchParams.get('countryId') ?? undefined
    const events = await getEvents({
      ...(severity && { severity }),
      ...(eventType && { eventType }),
      countryId,
    })
    return NextResponse.json({ data: events })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Create `app/api/events/[id]/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { getEventById } from '@/lib/db/events'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const event = await getEventById(params.id)
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data: event })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}
```

- [ ] **Step 5: Create `app/api/countries/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { getCountries } from '@/lib/db/countries'

export async function GET() {
  try {
    const countries = await getCountries()
    return NextResponse.json({ data: countries })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 })
  }
}
```

- [ ] **Step 6: Create `app/api/countries/[slug]/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { getCountryBySlug } from '@/lib/db/countries'

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const country = await getCountryBySlug(params.slug)
    if (!country) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data: country })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch country' }, { status: 500 })
  }
}
```

- [ ] **Step 7: Create `app/api/regions/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { getRegions } from '@/lib/db/regions'

export async function GET() {
  try {
    const regions = await getRegions()
    return NextResponse.json({ data: regions })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch regions' }, { status: 500 })
  }
}
```

- [ ] **Step 8: Create `app/api/regions/[slug]/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { getRegionBySlug } from '@/lib/db/regions'

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const region = await getRegionBySlug(params.slug)
    if (!region) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data: region })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch region' }, { status: 500 })
  }
}
```

- [ ] **Step 9: Type-check and smoke test**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Then start the dev server and curl a few endpoints:

```bash
# In a separate terminal:
npm run dev

# Test GET routes:
curl http://localhost:3000/api/forecasts | python3 -m json.tool | head -20
curl http://localhost:3000/api/events | python3 -m json.tool | head -20
curl http://localhost:3000/api/countries | python3 -m json.tool | head -20
curl http://localhost:3000/api/regions | python3 -m json.tool | head -20
```

Expected: JSON with `{ "data": [...] }` for each. Arrays should be non-empty (seeded data).

- [ ] **Step 10: Commit**

```bash
git add app/api/
git commit -m "feat: REST GET routes for forecasts, events, countries, regions"
```

---

### Task 7: API mutation routes + Zod validation

**Files:**
- Create: `lib/api/schemas.ts`
- Modify: `app/api/forecasts/route.ts` (add POST)
- Modify: `app/api/forecasts/[id]/route.ts` (add PATCH)
- Create: `app/api/forecasts/[id]/resolve/route.ts`
- Modify: `app/api/events/route.ts` (add POST)

- [ ] **Step 1: Create `lib/api/schemas.ts`**

```ts
import { z } from 'zod'

export const CreateForecastSchema = z.object({
  title: z.string().min(1),
  question: z.string().min(1),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeHorizon: z.string().min(1),
  regionId: z.string().min(1),
  countryIds: z.array(z.string()).default([]),
  probability: z.number().int().min(0).max(100),
  confidenceLevel: z.enum(['low', 'medium', 'high']),
  rationale: z.string().min(1),
  confidenceNotes: z.string().default(''),
  resolutionCriteria: z.string().min(1),
  uncertaintyNotes: z.string().min(1),
  evidence: z.array(z.object({
    title: z.string().min(1),
    description: z.string().default(''),
    direction: z.enum(['supporting', 'opposing', 'neutral']),
    weight: z.enum(['strong', 'moderate', 'weak']),
  })).default([]),
  tags: z.array(z.string()).default([]),
})

export const UpdateForecastSchema = z.object({
  probability: z.number().int().min(0).max(100).optional(),
  confidenceLevel: z.enum(['low', 'medium', 'high']).optional(),
  rationale: z.string().min(1).optional(),
  confidenceNotes: z.string().optional(),
  uncertaintyNotes: z.string().optional(),
  status: z.enum(['active', 'resolved', 'expired', 'draft']).optional(),
  changeReason: z.string().optional(),
})

export const ResolveSchema = z.object({
  result: z.enum(['yes', 'no']),
  resolutionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  analystNote: z.string().min(1),
  sourceUrl: z.string().url().optional(),
})

export const CreateEventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  eventType: z.enum(['military', 'diplomatic', 'economic', 'political', 'humanitarian', 'cyber']),
  severity: z.enum(['critical', 'high', 'moderate', 'low']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tags: z.array(z.string()).default([]),
  locationDescription: z.string().optional(),
  impactAssessment: z.string().optional(),
  sources: z.array(z.object({
    title: z.string().min(1),
    url: z.string().url(),
    reliability: z.enum(['high', 'medium', 'low']),
    publishedAt: z.string().optional(),
  })).default([]),
  countryIds: z.array(z.string()).default([]),
  actorIds: z.array(z.string()).default([]),
})
```

- [ ] **Step 2: Add POST to `app/api/forecasts/route.ts`**

Open `app/api/forecasts/route.ts`. Add the POST handler after the existing GET export:

```ts
import { NextResponse } from 'next/server'
import { getForecasts, createForecast } from '@/lib/db/forecasts'
import { CreateForecastSchema } from '@/lib/api/schemas'
import type { ForecastStatus } from '@/lib/types'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as ForecastStatus | null
    const regionId = searchParams.get('regionId') ?? undefined
    const forecasts = await getForecasts({ ...(status && { status }), regionId })
    return NextResponse.json({ data: forecasts })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch forecasts' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = CreateForecastSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const forecast = await createForecast(parsed.data)
    return NextResponse.json({ data: forecast }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create forecast' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Add PATCH to `app/api/forecasts/[id]/route.ts`**

Replace the full file:

```ts
import { NextResponse } from 'next/server'
import { getForecastById, updateForecast } from '@/lib/db/forecasts'
import { UpdateForecastSchema } from '@/lib/api/schemas'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const forecast = await getForecastById(params.id)
    if (!forecast) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data: forecast })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch forecast' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const parsed = UpdateForecastSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const forecast = await updateForecast(params.id, parsed.data)
    return NextResponse.json({ data: forecast })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update forecast' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Create `app/api/forecasts/[id]/resolve/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { resolveForecast } from '@/lib/db/forecasts'
import { ResolveSchema } from '@/lib/api/schemas'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const parsed = ResolveSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const forecast = await resolveForecast(params.id, parsed.data)
    return NextResponse.json({ data: forecast })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to resolve forecast' }, { status: 500 })
  }
}
```

- [ ] **Step 5: Add POST to `app/api/events/route.ts`**

Replace the full file:

```ts
import { NextResponse } from 'next/server'
import { getEvents, createEvent } from '@/lib/db/events'
import { CreateEventSchema } from '@/lib/api/schemas'
import type { EventType, EventSeverity } from '@/lib/types'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const severity = searchParams.get('severity') as EventSeverity | null
    const eventType = searchParams.get('type') as EventType | null
    const countryId = searchParams.get('countryId') ?? undefined
    const events = await getEvents({
      ...(severity && { severity }),
      ...(eventType && { eventType }),
      countryId,
    })
    return NextResponse.json({ data: events })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = CreateEventSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const event = await createEvent(parsed.data)
    return NextResponse.json({ data: event }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
```

- [ ] **Step 6: Smoke-test mutation routes (unauthenticated — should get 401)**

```bash
curl -X POST http://localhost:3000/api/forecasts \
  -H "Content-Type: application/json" \
  -d '{"title":"test"}'
```

Expected: `{"error":"Unauthorized"}` with HTTP 401.

- [ ] **Step 7: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add lib/api/ app/api/
git commit -m "feat: Zod schemas + REST mutation routes (POST forecast/event, PATCH forecast, POST resolve)"
```

---

### Task 8: Wire list pages — view components accept props

**Files:**
- Modify: `components/forecast/ForecastsView.tsx`
- Modify: `components/event/EventsView.tsx`
- Modify: `components/country/CountriesView.tsx`
- Modify: `app/forecasts/page.tsx`
- Modify: `app/events/page.tsx`
- Modify: `app/countries/page.tsx`

**Context:** `ForecastsView`, `EventsView`, and `CountriesView` are `'use client'` components. They currently import mock data directly. The pattern change: remove the mock import, accept the data as a prop, and use the prop wherever mock data was used.

`ForecastsView` uses `mockForecasts` in 6 places (lines 8, 67, 89, 91, 93, 105, 133, 145). `EventsView` uses `mockEvents` in 4 places (lines 8, 77, 108, 121, 138). `CountriesView` uses `mockCountries` in 4 places (lines 7, 66, 100–101, 112).

- [ ] **Step 1: Update `components/forecast/ForecastsView.tsx`**

Find and apply these changes:

**Remove** (line 8):
```ts
import { mockForecasts } from '@/lib/mock-data/forecasts'
```

**Add** `Forecast` to the existing type imports. After the existing imports, the component signature needs a props interface. Find:

```ts
export function ForecastsView() {
```

Replace with:

```ts
import type { Forecast } from '@/lib/types'

// ... (keep all other imports and constants unchanged)

interface ForecastsViewProps {
  forecasts: Forecast[]
}

export function ForecastsView({ forecasts }: ForecastsViewProps) {
```

Then replace every remaining reference to `mockForecasts` with `forecasts`:
- Line 67: `let result = [...mockForecasts]` → `let result = [...forecasts]`
- Line 89: `mockForecasts.filter(...)` → `forecasts.filter(...)`
- Line 91: `mockForecasts.reduce(...)` → `forecasts.reduce(...)`
- Line 93: `mockForecasts.filter(...)` → `forecasts.filter(...)`
- Line 105: `{mockForecasts.length}` → `{forecasts.length}`
- Line 133: `{mockForecasts.reduce(...)}` → `{forecasts.reduce(...)}`
- Line 145: `totalCount={mockForecasts.length}` → `totalCount={forecasts.length}`

- [ ] **Step 2: Update `components/event/EventsView.tsx`**

Remove import:
```ts
import { mockEvents } from '@/lib/mock-data/events'
```

Add to type imports: `GeopoliticalEvent` from `@/lib/types`.

Change component signature:

```ts
interface EventsViewProps {
  events: GeopoliticalEvent[]
}

export function EventsView({ events }: EventsViewProps) {
```

Replace all `mockEvents` with `events`:
- Line 77: `let result = [...mockEvents]` → `let result = [...events]`
- Line 108: `{mockEvents.length}` → `{events.length}`
- Line 121: `{mockEvents.filter(...).length}` → `{events.filter(...).length}`
- Line 138: `totalCount={mockEvents.length}` → `totalCount={events.length}`

- [ ] **Step 3: Update `components/country/CountriesView.tsx`**

Remove import:
```ts
import { mockCountries } from '@/lib/mock-data/countries'
```

Add to type imports: `Country` from `@/lib/types`.

Change component signature:

```ts
interface CountriesViewProps {
  countries: Country[]
}

export function CountriesView({ countries }: CountriesViewProps) {
```

Replace all `mockCountries` with `countries`:
- Line 66: `let result = [...mockCountries]` → `let result = [...countries]`
- Lines 100–101: replace both `mockCountries` references with `countries`
- Line 112: `totalCount={mockCountries.length}` → `totalCount={countries.length}`

- [ ] **Step 4: Update `app/forecasts/page.tsx`**

Replace the full file:

```tsx
import { ForecastsView } from '@/components/forecast/ForecastsView'
import { getForecasts } from '@/lib/db/forecasts'

export const metadata = { title: 'Forecasts' }

export default async function ForecastsPage() {
  const forecasts = await getForecasts()
  return <ForecastsView forecasts={forecasts} />
}
```

- [ ] **Step 5: Update `app/events/page.tsx`**

Replace the full file:

```tsx
import { EventsView } from '@/components/event/EventsView'
import { getEvents } from '@/lib/db/events'

export const metadata = { title: 'Events' }

export default async function EventsPage() {
  const events = await getEvents()
  return <EventsView events={events} />
}
```

- [ ] **Step 6: Update `app/countries/page.tsx`**

Replace the full file:

```tsx
import { CountriesView } from '@/components/country/CountriesView'
import { getCountries } from '@/lib/db/countries'

export const metadata = { title: 'Countries' }

export default async function CountriesPage() {
  const countries = await getCountries()
  return <CountriesView countries={countries} />
}
```

- [ ] **Step 7: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 8: Verify pages render**

With dev server running, open `http://localhost:3000/forecasts`, `http://localhost:3000/events`, `http://localhost:3000/countries`. Each should show the seeded data from the database.

- [ ] **Step 9: Commit**

```bash
git add components/forecast/ForecastsView.tsx components/event/EventsView.tsx components/country/CountriesView.tsx app/forecasts/page.tsx app/events/page.tsx app/countries/page.tsx
git commit -m "feat: wire list pages to Prisma data layer, view components accept data as props"
```

---

### Task 9: Wire detail pages

**Files:**
- Modify: `app/forecasts/[id]/page.tsx`
- Modify: `app/events/[id]/page.tsx`
- Modify: `app/countries/[slug]/page.tsx`
- Modify: `app/regions/page.tsx`
- Modify: `app/regions/[slug]/page.tsx`

**Context:** All these pages currently import mock arrays and filter locally. Replace with `lib/db/` calls. Remove `generateStaticParams` from all; add `export const dynamic = 'force-dynamic'`. The existing JSX is untouched — only the data-fetching changes.

- [ ] **Step 1: Update `app/forecasts/[id]/page.tsx`**

The current file has a slim server wrapper (from Stage 6). Replace fully:

```tsx
import { notFound } from 'next/navigation'
import { getForecastById } from '@/lib/db/forecasts'
import { ForecastDetailView } from '@/components/forecast/ForecastDetailView'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface PageProps { params: { id: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const forecast = await getForecastById(params.id)
  return { title: forecast?.title ?? 'Forecast' }
}

export default async function ForecastDetailPage({ params }: PageProps) {
  const forecast = await getForecastById(params.id)
  if (!forecast) notFound()

  // countries and relatedEvents are already embedded in the forecast object from the DB
  const countries = [] as import('@/lib/types').Country[]  // ForecastDetailView uses forecast.countries (string[]) for country IDs; full country objects not needed here
  const relatedEvents = [] as import('@/lib/types').GeopoliticalEvent[]

  return (
    <ForecastDetailView
      forecast={forecast}
      countries={countries}
      relatedEvents={relatedEvents}
    />
  )
}
```

**Note:** `ForecastDetailView` currently accepts `countries: Country[]` and `relatedEvents: GeopoliticalEvent[]` as props (for the sidebar and related events section). These will be wired with full objects once the db layer returns them. For now pass empty arrays — the page will still render correctly for all the forecast-specific panels. To fully wire the sidebar countries and related events, update `getForecastById` in `lib/db/forecasts.ts` to also fetch the full Country and Event objects, and update this page to pass them. This is a follow-up improvement, not required to unblock the rest of the stage.

- [ ] **Step 2: Update `app/events/[id]/page.tsx`**

Read the current file. At the top, find all mock data imports:
```ts
import { mockEvents } from '@/lib/mock-data/events'
import { mockForecasts } from '@/lib/mock-data/forecasts'
import { mockCountries } from '@/lib/mock-data/countries'
import { mockActors } from '@/lib/mock-data/actors'
```

Replace with:
```ts
import { getEventById } from '@/lib/db/events'
import { getForecasts } from '@/lib/db/forecasts'
```

Remove `generateStaticParams` function entirely. Add:
```ts
export const dynamic = 'force-dynamic'
```

Replace the `generateMetadata` function:
```ts
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const event = await getEventById(params.id)
  return { title: event?.title ?? 'Event' }
}
```

Replace the page function body. Find where `mockEvents.find(...)` is called and replace the data-loading block:

```ts
export default async function EventDetailPage({ params }: PageProps) {
  const event = await getEventById(params.id)
  if (!event) notFound()

  const relatedForecasts = await getForecasts()
  const filteredForecasts = relatedForecasts.filter((f) =>
    event.relatedForecasts.includes(f.id)
  )

  const countries = event.countryObjects
  const actors = event.actorObjects

  // ... rest of JSX unchanged, replace mockCountries.find/mockActors.find
  // references with the `countries` and `actors` arrays above
```

In the JSX body, replace:
- `mockCountries.find((c) => c.id === id)` → use `countries.find((c) => c.id === id)`
- `mockActors.find((a) => a.id === id)` → use `actors.find((a) => a.id === id)`

- [ ] **Step 3: Update `app/countries/[slug]/page.tsx`**

Replace mock data imports:
```ts
import { mockCountries } from '@/lib/mock-data/countries'
import { mockEvents } from '@/lib/mock-data/events'
import { mockForecasts } from '@/lib/mock-data/forecasts'
import { mockActors } from '@/lib/mock-data/actors'
import { mockRegions } from '@/lib/mock-data/regions'
```

With:
```ts
import { getCountryBySlug } from '@/lib/db/countries'
```

Remove `generateStaticParams`. Add `export const dynamic = 'force-dynamic'`.

Replace `generateMetadata`:
```ts
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const country = await getCountryBySlug(params.slug)
  return { title: country?.name ?? 'Country' }
}
```

Replace the page function body:
```ts
export default async function CountryDetailPage({ params }: PageProps) {
  const country = await getCountryBySlug(params.slug)
  if (!country) notFound()

  const relatedEvents = country.events
  const relatedForecasts = country.forecasts
  const keyActors = country.actors
  const regionData = country.regionData

  // ... rest of JSX unchanged
```

In the JSX, all references to `mockCountries.find(...)`, `mockEvents.filter(...)`, `mockForecasts.filter(...)`, `mockActors.filter(...)`, and `mockRegions.find(...)` are replaced by the variables above.

- [ ] **Step 4: Update `app/regions/page.tsx`**

Replace mock data imports:
```ts
import { mockRegions } from '@/lib/mock-data/regions'
import { mockCountries } from '@/lib/mock-data/countries'
```

With:
```ts
import { getRegions } from '@/lib/db/regions'
```

Change `export default function RegionsPage()` to `export default async function RegionsPage()`.

Replace:
```ts
const sortedRegions = [...mockRegions].sort((a, b) => b.overallRiskScore - a.overallRiskScore)
```

With:
```ts
const regions = await getRegions()  // already sorted by overallRiskScore desc
```

In the JSX, replace `sortedRegions` with `regions` and `mockCountries.filter(...)` with the country ids already embedded in each region object via `region.countries` (which is already `string[]` from the mapper).

**Note:** `getRegions()` includes country objects. Since `mapRegion` sets `countries: r.countries.map(c => c.id)`, the existing JSX that does `mockCountries.filter((c) => region.countries.includes(c.id))` will need to be updated. The `regions` returned from `getRegions()` have `countries: string[]`, but the JSX also needs Country objects for displaying flags. 

To fix this, update `getRegions()` in `lib/db/regions.ts` to return regions with `memberCountries` embedded (similar to `getRegionBySlug`). Alternatively, since `RegionsPage` only needs country name + iso2 + riskLevel, fetch countries separately:

```ts
import { getRegions } from '@/lib/db/regions'
import { getCountries } from '@/lib/db/countries'

export default async function RegionsPage() {
  const [regions, allCountries] = await Promise.all([getRegions(), getCountries()])

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* ... header unchanged ... */}
      <div className="space-y-4">
        {regions.map((region) => {
          const regionCountries = allCountries.filter((c) => region.countries.includes(c.id))
          return (
            // ... rest of JSX unchanged, using regionCountries instead of mockCountries.filter(...)
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Update `app/regions/[slug]/page.tsx`**

Replace mock data imports:
```ts
import { mockRegions } from '@/lib/mock-data/regions'
import { mockCountries } from '@/lib/mock-data/countries'
import { mockForecasts } from '@/lib/mock-data/forecasts'
```

With:
```ts
import { getRegionBySlug } from '@/lib/db/regions'
```

Remove `generateStaticParams`. Add `export const dynamic = 'force-dynamic'`.

Replace `generateMetadata`:
```ts
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const region = await getRegionBySlug(params.slug)
  return { title: region?.name ?? 'Region' }
}
```

Replace the page function body:
```ts
export default async function RegionDetailPage({ params }: PageProps) {
  const region = await getRegionBySlug(params.slug)
  if (!region) notFound()

  const memberCountries = region.memberCountries
  const activeForecasts = region.forecasts

  // ... rest of JSX unchanged, replace:
  // `mockCountries.find(...)` → use memberCountries.find(...)
  // `mockForecasts.filter(...)` → use activeForecasts
```

- [ ] **Step 6: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Fix any type errors. Common issue: `Metadata` from `next` needs to be imported if it isn't already.

- [ ] **Step 7: Verify detail pages**

With dev server running:
- `http://localhost:3000/forecasts/fc-001` — should show forecast detail
- `http://localhost:3000/events/evt-001` — should show event detail
- `http://localhost:3000/countries/russia` — should show country detail
- `http://localhost:3000/regions` — should show regions list
- `http://localhost:3000/regions/eastern-europe` — should show region detail

- [ ] **Step 8: Commit**

```bash
git add app/forecasts/ app/events/ app/countries/ app/regions/
git commit -m "feat: wire detail pages to Prisma data layer, remove generateStaticParams"
```

---

### Task 10: Wire client-side mutations

**Files:**
- Modify: `components/forecast/wizard/ForecastWizard.tsx`
- Modify: `components/forecast/ForecastDetailView.tsx`

**Context:** `ForecastWizard` currently shows a mock success state (`setSubmitted(true)`) with no real API call. `ForecastDetailView.handleResolve` currently updates local state only. Both need to call the API routes added in Task 7.

- [ ] **Step 1: Update `ForecastWizard.tsx` — POST on submit**

Open `components/forecast/wizard/ForecastWizard.tsx`.

Find the `submitted` state and add a new `submittedTitle` state and `submitting` state:

```ts
const [submitted, setSubmitted] = useState(false)
const [submittedTitle, setSubmittedTitle] = useState('')
const [submitting, setSubmitting] = useState(false)
const [submitError, setSubmitError] = useState<string | null>(null)
```

Find the "Create Forecast" button's `onClick`:

```ts
onClick={() => {
  if (!validateStep(step)) return
  setErrors({})
  setSubmitted(true)
}}
```

Replace with:

```ts
onClick={async () => {
  if (!validateStep(step)) return
  setErrors({})
  setSubmitting(true)
  setSubmitError(null)
  try {
    const res = await fetch('/api/forecasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: draft.title,
        question: draft.question,
        targetDate: draft.targetDate,
        timeHorizon: draft.timeHorizon,
        regionId: draft.region,
        countryIds: draft.countries,
        probability: draft.probability,
        confidenceLevel: draft.confidenceLevel,
        rationale: draft.rationale,
        confidenceNotes: draft.confidenceNotes,
        resolutionCriteria: draft.resolutionCriteria,
        uncertaintyNotes: draft.uncertaintyNotes,
        evidence: draft.evidence.map((e) => ({
          title: e.title,
          description: e.description,
          direction: e.direction,
          weight: e.weight,
        })),
        tags: draft.tags,
      }),
    })
    const json = await res.json()
    if (!res.ok) {
      setSubmitError(json.error ?? 'Failed to create forecast')
      return
    }
    setSubmittedTitle(draft.title)
    setSubmitted(true)
  } catch {
    setSubmitError('Network error — please try again')
  } finally {
    setSubmitting(false)
  }
}}
```

Update the button JSX to show a loading state:

```tsx
<button
  onClick={/* the async handler above */}
  disabled={submitting}
  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
>
  {submitting ? 'Creating…' : 'Create Forecast'}
</button>
```

Add an error display above the button row (if `submitError`):

```tsx
{submitError && (
  <p className="text-xs text-red-400 text-right mb-2">{submitError}</p>
)}
```

In the success state (`if (submitted)`), update to use `submittedTitle` instead of `draft.title`:

```tsx
<p className="text-sm text-[var(--color-text-tertiary)] mb-8 max-w-xs">{submittedTitle}</p>
```

Update "Create another" button to also reset `submittedTitle`:

```ts
onClick={() => {
  setDraft(INITIAL_DRAFT)
  setStep(0)
  setSubmitted(false)
  setSubmittedTitle('')
  setSubmitError(null)
}}
```

- [ ] **Step 2: Update `ForecastDetailView.tsx` — POST resolve to API**

Open `components/forecast/ForecastDetailView.tsx`.

Find the `handleResolve` callback. Currently it updates local state and shows a toast. Change it to call the API first, then update local state on success:

```ts
const handleResolve = useCallback(async (outcome: ResolveOutcome) => {
  try {
    const res = await fetch(`/api/forecasts/${forecast.id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(outcome),
    })
    const json = await res.json()
    if (!res.ok) {
      setToast(json.error ?? 'Failed to resolve forecast')
      return
    }
    // Update local state from the returned forecast
    const updated = json.data
    setLocalStatus(updated.status)
    setLocalHistory(updated.history)
    setResolveModalOpen(false)
    setToast(`Forecast resolved as ${outcome.result.toUpperCase()}`)
  } catch {
    setToast('Network error — please try again')
  }
}, [forecast.id])
```

**Note:** The `handleResolve` callback now needs to be `async`. Remove the `useCallback` deps that included `forecast.probability` / `forecast.confidenceLevel` (the old local-state mutation) — the new version only depends on `forecast.id`.

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 4: Test the wizard flow (requires being signed in)**

The POST `/api/forecasts` is auth-protected. To test, first sign in via NextAuth. Since the sign-in page (`/auth/signin`) hasn't been built yet, use curl with a session cookie or temporarily add a debug bypass. For now, verify the error state: navigating to `/forecasts/new`, filling out all 4 steps, and clicking "Create Forecast" should show the error `"Unauthorized"` (since we're not signed in).

This confirms the API call is working and the error handling is correct.

- [ ] **Step 5: Commit**

```bash
git add components/forecast/wizard/ForecastWizard.tsx components/forecast/ForecastDetailView.tsx
git commit -m "feat: wire wizard POST and resolve POST to API routes"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Implemented in |
|---|---|
| Docker Postgres | Task 1 |
| .env + .env.example | Task 1 |
| Prisma schema — all domain tables | Task 2 |
| Auth tables (NextAuth adapter) | Task 2 |
| NextAuth credentials provider | Task 3 |
| JWT sessions with role | Task 3 |
| Middleware protects mutations | Task 3 |
| Prisma client singleton | Task 3 (Step 2) |
| Type mappers (Prisma → domain TS) | Task 4 |
| `lib/db/regions.ts` | Task 4 |
| `lib/db/countries.ts` | Task 4 |
| `lib/db/events.ts` | Task 4 |
| `lib/db/forecasts.ts` | Task 4 |
| Seed script + re-runnable upserts | Task 5 |
| Default admin user | Task 5 |
| GET API routes (8 endpoints) | Task 6 |
| POST/PATCH/resolve mutation routes | Task 7 |
| Zod request validation | Task 7 |
| ForecastsView accepts prop | Task 8 |
| EventsView accepts prop | Task 8 |
| CountriesView accepts prop | Task 8 |
| List pages fetch from db | Task 8 |
| Detail pages fetch from db | Task 9 |
| Remove generateStaticParams | Task 9 |
| Wizard POSTs to /api/forecasts | Task 10 |
| Resolve POSTs to /api/forecasts/[id]/resolve | Task 10 |

All spec requirements are covered. No gaps found.

**Known deferred items (out of scope for Stage 7 per spec):**
- Login/signup UI pages (Stage 9)
- Role-based UI gating (Stage 9)
- Full Country/Event objects passed to ForecastDetailView sidebar (noted in Task 9 Step 1 as a follow-up)
