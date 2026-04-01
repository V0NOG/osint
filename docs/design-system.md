# Design System Brief
## Project Name
Geopolitical OSINT Forecasting Platform

## 1. Design Intent
The product should feel like a premium intelligence and forecasting platform. It should combine:
- modern UI
- cinematic but restrained 3D visuals
- dense analytical interfaces
- smooth motion
- strong hierarchy
- trustworthy readability

This is not a gaming UI and not a neon cyberpunk gimmick. It should feel serious, elegant, sharp, and high-end.

## 2. Visual Tone
Target tone:
- strategic
- sophisticated
- atmospheric
- analytical
- modern
- calm under pressure

Avoid:
- cartoonish visuals
- excessive bright neon
- noisy gradients
- over-animated dashboards
- cluttered data walls
- military propaganda aesthetics

## 3. Primary UI Direction
The interface should use:
- dark-first theme
- glassy and layered panels where appropriate
- subtle blur and transparency
- clear card hierarchy
- sharp borders and controlled shadows
- restrained accent colors for risk and status
- spacious layouts with dense information zones

## 4. 3D Visual Direction
The app should include tasteful 3D elements:
- interactive globe
- atmospheric glow
- country highlighting
- arc lines between key geopolitical relationships or events
- animated risk pulses
- depth-aware background scenes
- gentle parallax on major screens

3D should enhance understanding, not distract.

## 5. Motion Design
Motion should feel:
- smooth
- premium
- controlled
- deliberate

Use motion for:
- transitions
- hover states
- focus states
- globe interactions
- panel reveal
- timeline updates
- data emphasis

Avoid:
- bounce-heavy interactions
- flashy arcade-like movement
- overly long transitions
- distracting constant animations

## 6. Layout Principles
- Strong page-level hierarchy
- Clear focal point on each screen
- Reusable panel system
- Wide dashboard layouts on desktop
- Responsive collapse on smaller screens
- Sticky context panels where useful
- Dense information without overcrowding

## 7. Suggested Color Strategy
### Base
- deep charcoal / near-black backgrounds
- dark slate surfaces
- muted steel tones
- soft glass overlays

### Accent
Use limited high-value accents such as:
- blue for information
- amber for caution
- red for high-risk / escalation
- green for positive / stabilizing movement
- violet or cyan sparingly for forecast/emphasis moments

Do not overuse accent colors.

## 8. Typography
Typography should feel modern and professional.

Recommended style:
- clean sans-serif for UI
- strong display font or weight for major headings
- readable body text
- compact table typography
- clear numeric display styling for probabilities and metrics

Hierarchy:
- large, bold page titles
- medium-weight section headers
- readable body text
- compact labels
- strong monospace or tabular numerals for data where needed

## 9. Component Strategy
The system should be built from:
- reusable layout primitives
- consistent panels/cards
- consistent button styles
- consistent filter controls
- consistent tab systems
- reusable timelines
- reusable evidence/source cards
- reusable chart wrappers
- reusable map/globe interaction panels

## 10. Approved UI Sourcing Strategy
Claude Code may:
- generate UI variations from approved UI generation workflows
- use open, production-friendly component patterns
- use staged/generated components before promotion into core UI
- adapt generated components into project design tokens

Claude Code must not:
- copy proprietary branded UIs directly
- scrape and replicate random sites blindly
- mix inconsistent visual systems
- introduce many unrelated UI styles

## 11. Screen-Level Design Notes
### 11.1 World Overview
- full-bleed or dominant globe area
- floating control panels
- top alerts panel
- active forecasts panel
- risk legend
- command/search bar
- strong sense of depth

### 11.2 Country Page
- large country hero summary
- risk summary strip
- timeline section
- evidence panel
- forecast cards
- related actors/events
- map context

### 11.3 Event Page
- concise event overview
- location and time context
- actor badges
- source stack
- related forecasts
- uncertainty and contradiction panel

### 11.4 Forecast Page
- large probability display
- confidence and evidence blocks
- history chart
- scenario notes
- resolution criteria
- update log

## 12. Interaction Notes
- rich hover states
- keyboard-friendly search
- context menus where appropriate
- smooth filter transitions
- inspectable evidence drawers
- map selection should feel crisp and immediate
- loading states should look premium, not generic

## 13. Accessibility Notes
- maintain readable contrast
- avoid tiny text
- do not encode meaning through color alone
- provide visible focus states
- preserve usability when motion is reduced
- ensure panels are legible over visual backgrounds

## 14. Performance Notes
- 3D effects should degrade gracefully
- expensive animations should be optional or optimized
- UI should remain responsive even with dense screens
- avoid unnecessary re-renders and heavy shader effects by default

## 15. Design Tokens Guidance
Claude Code should define reusable tokens for:
- background layers
- surface layers
- text hierarchy
- border styles
- shadows
- blur levels
- status colors
- spacing scale
- radii
- motion durations
- chart palette
- glow effects

## 16. Build Rule
When generating new UI:
1. create 2-3 strong variations for major screens or blocks
2. select the best direction
3. normalize into project tokens
4. move approved components into core UI
5. maintain consistency across all pages