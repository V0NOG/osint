# Stage 3: Polished Layouts and Navigation — Design Spec
**Date:** 2026-04-07
**Phase:** 3 of 9 (CLAUDE.md build order)
**Status:** Approved

---

## Overview

Stage 3 completes the navigation and layout layer of the platform. Stages 1 and 2 produced a working shell with all routes, design tokens, shared UI primitives, mock data, and a 3D globe. Stage 3 makes the app feel like a real product by wiring up the four major interactive systems that are currently placeholder or missing:

1. Command Palette (⌘K global search + navigation)
2. Filter controls on list pages
3. Alert Drawer (bell icon → right slide-in panel)
4. Sidebar collapse

---

## Architecture

All global UI state lives in `AppShell`. Three new React contexts are introduced:

| Context | Controls | Mounted in |
|---|---|---|
| `CommandPaletteContext` | open/close, query string | `AppShell` |
| `AlertDrawerContext` | open/close | `AppShell` |
| `SidebarContext` | collapsed/expanded, toggle | `AppShell` |

Each context exports a hook (`useCommandPalette`, `useAlertDrawer`, `useSidebar`). Components reach into these hooks rather than passing props.

`AppShell` sets `--sidebar-width` as a CSS variable on mount and on collapse toggle so the `main` content margin always tracks correctly without layout shift.

List pages (`/countries`, `/events`, `/forecasts`) become client components wrapping their filter state in local `useState`. No URL sync in this stage.

---

## 1. Command Palette

### Trigger
- `⌘K` / `Ctrl+K` from anywhere in the app
- Clicking the TopBar search bar

### Visual
- Centered modal, max-width 560px
- Full-screen backdrop: `bg-black/40 backdrop-blur-sm`
- `bg-[--color-bg-surface]` panel with `border border-[--color-border-strong]` and `shadow-2xl`
- Animates in with `slideIn` (already in globals.css)

### Behavior
- Input at top, results grouped below
- Groups: **Countries**, **Events**, **Forecasts**, **Pages**
- When input is empty: shows Pages group as quick-nav shortcuts only
- When input has text: filters all four groups client-side against mock data
- Search matches: country name, ISO2/ISO3 code; event title, tags; forecast title, question, tags; page labels
- Results capped at 5 per group
- Keyboard: `↑`/`↓` navigate across all results, `↵` navigate to result, `ESC` close

### Result row anatomy
- Left: small icon (entity type color)
- Center: entity name (bold) + optional subtitle (capital for countries, date for events)
- Right: contextual label — risk badge for countries, severity for events, probability% for forecasts, nothing for pages

### Empty state
- "No results for '{query}'" with a dim subtitle

### Implementation notes
- Single `CommandPalette` component rendered inside `AppShell`, always in the DOM, visibility toggled
- `useEffect` registers/unregisters the `keydown` listener
- Results computed with `useMemo` from query string against imported mock arrays

---

## 2. Filter Controls — List Pages

Same component pattern used across `/countries`, `/events`, `/forecasts`.

### Visual
- Chip bar rendered between page header and list content
- Bar: `bg-[--color-bg-surface] border border-[--color-border] rounded-lg px-4 py-2.5` horizontal flex
- Active chip: filled background (risk/type color at full opacity), white text
- Inactive chip: `bg-[--color-bg-elevated] border border-[--color-border]`, muted text
- Chips animate background on toggle with `transition-all duration-150`
- Result count: `"12 results"` in small muted text, right-aligned in the chip bar

### Countries page filters
- **Risk level chips** (OR logic): Critical · High · Elevated · Moderate · Low · Minimal — chip color matches risk color token
- **Region dropdown**: Eastern Europe · East Asia · Middle East · Sub-Saharan Africa · Latin America · Southeast Asia
- **Sort dropdown**: Risk Score (high→low) · Risk Score (low→high) · Name (A–Z) · Name (Z–A)
- Default: no filters active, sort by Risk Score descending

### Events page filters
- **Type chips** (OR logic): Military · Diplomatic · Economic · Political · Humanitarian · Cyber — each chip uses the existing `event-*` badge color
- **Severity chips** (OR logic): Critical · High · Moderate · Low
- **Sort dropdown**: Date (newest) · Date (oldest) · Severity
- Default: no filters, sort by date descending

### Forecasts page filters
- **Status chips** (OR logic): Active · Resolved · Expired · Draft
- **Confidence chips** (OR logic): High · Medium · Low
- **Sort dropdown**: Probability (high→low) · Probability (low→high) · Target Date · Last Updated
- Default: Active only, sort by probability descending

### Filter logic
- Within each chip group: OR (show if matches any selected chip in that group)
- Across groups: AND (must satisfy all active groups)
- If no chips in a group are active: that group is not applied (show all)
- The grouped section headers on each page (e.g. "Critical Risk" sections) collapse when filters are active — instead show a flat filtered list

---

## 3. Alert Drawer

### Trigger
- Clicking the bell icon in TopBar

### Visual
- Fixed right panel, full viewport height, width 320px
- Slides in: `translate-x-0` from `translate-x-full`, `transition: transform 250ms ease`
- Semi-transparent backdrop over content area: `bg-black/20` (not full-screen dim — drawer is non-blocking)
- `bg-[--color-bg-surface] border-l border-[--color-border-strong]`
- z-index above main content, below command palette

### Header
- "Alerts" title + red badge with count
- "Mark all read" text button (UI only, resets unread count to 0)
- Close button (X)

### Alert items
- Left border color = severity color token
- **Unread**: `bg-[--color-bg-elevated]`, bold title
- **Read**: `bg-transparent`, normal weight title
- Content: title (bold), summary snippet (2 lines max, truncated), timestamp (relative: "2m ago"), entity type badge
- Clicking an item: navigates to the relevant `/events/[id]` or `/forecasts/[id]` and closes the drawer

### Data source
- Top 8 mock events sorted by severity (critical first), used as alert feed
- Unread count initialized to 4 (matches existing red dot on bell)
- "Mark all read" sets unread count to 0 and clears the red dot

### Grouping
- Critical alerts first (red left border), then High (orange), then others (muted border)
- Section labels: "Critical" / "High" / "Other" shown as small uppercase labels

---

## 4. Sidebar Collapse

### Toggle
- Chevron button at the bottom of the sidebar, above the version footer
- Points left when expanded, right when collapsed
- `transition: transform 200ms ease` on the icon

### Width animation
- `transition: width 200ms ease` on the `<aside>` element
- Expanded: `240px` (existing `--sidebar-width`)
- Collapsed: `64px` (`--sidebar-collapsed-width`, already defined)
- `AppShell` updates the `--sidebar-width` CSS variable on toggle so `main` margin tracks in sync

### Collapsed visual
- Logo area: shield icon only (no wordmark)
- Status indicator: green dot only (no "Live monitoring" text)
- Section heading ("Intelligence"): hidden
- Nav items: icon only, no label, no chevron indicator
- Settings item: icon only
- Version footer: hidden

### Tooltips in collapsed state
- Each nav icon gets a `title` attribute with the route label
- Native browser tooltip is acceptable for Stage 3

### Persistence
- `localStorage` key: `geopol:sidebar-collapsed`
- Read on mount to avoid flash of wrong state
- Written on every toggle

---

## 5. TopBar Improvements

### Breadcrumbs on detail pages
- `TopBar` currently shows `"..."` for nested routes — replace with entity name resolution
- Pass entity name as optional prop or derive from a lightweight lookup against mock data using the URL segment
- Result: `Countries / Russia`, `Events / Kharkiv Offensive`, `Forecasts / NK Denuclearization`

### Bell wiring
- Bell `onClick` calls `useAlertDrawer().open()`

### Search bar wiring
- TopBar search bar `onClick` calls `useCommandPalette().open()`

### Clock
- Replace hardcoded `new Date('2026-04-01T09:42:00')` with `Date.now()` updating every 60 seconds via `useEffect` + `setInterval`

### Refresh button
- On click: adds `animate-spin` class to the icon for 600ms (CSS class toggle via `setTimeout`), cosmetic only

---

## Files Added

| Path | Purpose |
|---|---|
| `contexts/command-palette.tsx` | CommandPaletteContext + useCommandPalette hook |
| `contexts/alert-drawer.tsx` | AlertDrawerContext + useAlertDrawer hook |
| `contexts/sidebar.tsx` | SidebarContext + useSidebar hook |
| `components/layout/CommandPalette.tsx` | Command palette modal component |
| `components/layout/AlertDrawer.tsx` | Right slide-in alert panel |
| `components/ui/FilterChipBar.tsx` | Reusable chip bar + dropdown wrappers |

## Files Modified

| Path | Change |
|---|---|
| `components/layout/AppShell.tsx` | Mount contexts + AlertDrawer + CommandPalette |
| `components/layout/Sidebar.tsx` | Collapse toggle, icons-only collapsed state, useSidebar |
| `components/layout/TopBar.tsx` | Wire bell + search, fix breadcrumbs, live clock, refresh spin |
| `app/countries/page.tsx` | Add FilterChipBar, convert to client component |
| `app/events/page.tsx` | Add FilterChipBar, convert to client component |
| `app/forecasts/page.tsx` | Add FilterChipBar, convert to client component |

---

## Out of Scope for Stage 3

- URL-synced filter state (query params)
- Real alert ingestion or persistence
- Watchlist functionality
- Region detail pages
- Any backend work
