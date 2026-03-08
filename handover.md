# Handover Document — Cost Allocation Game Theory Explorer

> **Last updated:** March 2026  
> **Stack:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion + Recharts + React Three Fiber  
> **Live URL:** https://heaneywrr1982.lovable.app  
> **Repository root:** Single-page application, no backend required

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & File Structure](#2-architecture--file-structure)
3. [Design System](#3-design-system)
4. [Page Layout & Navigation](#4-page-layout--navigation)
5. [Onboarding & Pedagogical Flow](#5-onboarding--pedagogical-flow)
6. [Core Components — Detailed Breakdown](#6-core-components--detailed-breakdown)
7. [Calculation Engine](#7-calculation-engine)
8. [Visualization System](#8-visualization-system)
9. [Quiz & Active Learning System](#9-quiz--active-learning-system)
10. [State Management](#10-state-management)
11. [localStorage Keys](#11-localstorage-keys)
12. [Dependencies & Their Roles](#12-dependencies--their-roles)
13. [Known Patterns & Conventions](#13-known-patterns--conventions)
14. [Potential Future Improvements](#14-potential-future-improvements)

---

## 1. Project Overview

This is an **interactive educational tool** that teaches cooperative game theory through the lens of cost allocation for shared infrastructure projects. It is based on the 1982 paper:

> **"Methods for Apportioning the Cost of a Water Resource Project"**  
> James P. Heaney & Robert E. Dickinson  
> *Water Resources Research, Vol. 18, No. 3, pp. 476–482, June 1982*

The app allows users to:
- Learn game theory concepts through a narrative "Three Towns, One Reservoir" scenario
- Interactively calculate cost allocations using four methods (SCRB, Shapley, Nucleolus, Equal Split)
- Visualize "the Core" on a triangular barycentric coordinate plot with draggable allocation points
- Step through algorithm calculations transparently
- Test their understanding via integrated quizzes
- View the original research paper as an embedded PDF
- Print a cheat sheet summarizing all methods

**There is no backend.** The app is entirely client-side. All state is ephemeral (React state) except for onboarding flags stored in `localStorage`.

---

## 2. Architecture & File Structure

```
src/
├── App.tsx                          # Root: providers, router
├── main.tsx                         # Vite entry point
├── index.css                        # Design system tokens, animations, print styles
├── pages/
│   ├── Index.tsx                    # Main page — assembles all sections
│   └── NotFound.tsx                 # 404 page
├── components/
│   ├── Navigation.tsx               # Fixed top nav with scroll-aware styling
│   ├── HeroSection.tsx              # Hero banner with feature cards
│   ├── ExecutiveSummary.tsx          # "Key Takeaway" callout
│   ├── GameTheoryBackground.tsx     # Theory section: concepts, timeline, FAQ, "Why It Matters"
│   ├── CostCalculator.tsx           # ★ MAIN COMPONENT — calculator + all sub-features
│   ├── CoreVisualization.tsx         # Triangular Core plot (SVG, ~1200 lines)
│   ├── CoreStoryMode.tsx            # Guided walkthrough of Core constraints
│   ├── ShowStepsPanel.tsx           # Step-by-step algorithm breakdowns
│   ├── CompareChart.tsx             # Side-by-side method comparison chart
│   ├── ParallelCoordinatesChart.tsx # Parallel coordinates visualization
│   ├── TetrahedronVisualization.tsx  # 3D tetrahedron for 4-player games (Three.js)
│   ├── ExampleBank.tsx              # Pre-built scenario library
│   ├── ActiveLearningChallenges.tsx # Multi-choice quiz challenges
│   ├── ContextualQuizPrompt.tsx     # Inline contextual quiz (appears after Core viz)
│   ├── FirstTimeExperience.tsx      # Full-screen onboarding overlay (5 steps)
│   ├── OnboardingTour.tsx           # Dialog-based calculator tour (multi-step)
│   ├── CheatSheet.tsx               # Printable summary of all 4 methods
│   ├── Glossary.tsx                 # Searchable glossary + GlossaryTermLink hover cards
│   ├── PaperDetails.tsx             # Research paper summary, citations, formulas
│   ├── DocumentViewer.tsx           # Embedded PDF viewer + download
│   ├── Footer.tsx                   # Footer with references + "Restart Tutorial" button
│   ├── NavLink.tsx                  # (Legacy/unused navigation link component)
│   └── ui/                          # shadcn/ui primitives (accordion, button, card, etc.)
├── hooks/
│   ├── use-mobile.tsx               # Responsive breakpoint hook
│   └── use-toast.ts                 # Toast notification hook
├── lib/
│   ├── utils.ts                     # cn() utility for Tailwind class merging
│   ├── calculations.ts              # Extracted pure calculation functions (SCRB, Shapley, Nucleolus)
│   └── calculations.test.ts         # 20 unit tests for calculation engine
└── test/
    ├── setup.ts                     # Vitest setup
    └── example.test.ts              # Example test
```

### Key Architectural Decisions

- **Single-page scroll app**: All sections render on one page (`Index.tsx`). Navigation scrolls to section refs.
- **No routing beyond `/`**: React Router is set up but only `/` and a catch-all `*` (404) route exist.
- **CostCalculator is the hub**: At ~1050 lines, it orchestrates inputs, calculations, and renders sub-components for visualization, steps, comparisons, Core plot, and learning challenges.
- **No global state management**: All state lives in component-level `useState`. Props are passed down.

---

## 3. Design System

### Color Tokens (HSL, defined in `index.css`)

| Token | Light Mode | Purpose |
|-------|-----------|---------|
| `--primary` | `222 60% 28%` | Deep scholarly blue — headings, nav, primary actions |
| `--interactive` | `186 55% 42%` | Teal — interactive elements, Shapley color |
| `--accent` | `38 92% 50%` | Golden — accent highlights, Nucleolus color |
| `--background` | `220 25% 97%` | Off-white page background |
| `--foreground` | `222 47% 11%` | Near-black text |
| `--muted` | `220 15% 91%` | Muted backgrounds |
| `--muted-foreground` | `215 16% 47%` | Secondary text |
| `--destructive` | `0 72% 51%` | Error/danger red |

Dark mode tokens are also defined but not actively toggled in the UI.

### Typography

| Role | Font | Source |
|------|------|--------|
| Headings (`.font-serif`) | Crimson Pro | Google Fonts |
| Body (`.font-sans`) | Inter | Google Fonts |
| Code/formulas (`.font-mono`) | JetBrains Mono | Google Fonts |

### Custom CSS Classes

| Class | Purpose |
|-------|---------|
| `.gradient-hero` | Hero section background gradient |
| `.gradient-text` | Text with gradient fill |
| `.card-elevated` | Card with gradient background + elevated shadow |
| `.mathematical-border` | Pseudo-element gradient border effect |
| `.animate-float` | Gentle floating animation |
| `.animate-pulse-soft` | Subtle opacity pulse |

### Custom Tailwind Extensions

- `interactive` color (with `DEFAULT` and `foreground` variants) added to `tailwind.config.ts`
- Custom `--shadow-soft`, `--shadow-elevated`, `--shadow-glow` CSS variables
- Custom `--gradient-academic`, `--gradient-hero`, `--gradient-warm`, `--gradient-card` gradient variables

---

## 4. Page Layout & Navigation

### `Index.tsx` — Section Order

```
1. Navigation (fixed top)
2. HeroSection (hero banner)
3. ExecutiveSummary (key takeaway callout)
4. GameTheoryBackground (theory, timeline, FAQ, glossary) — ref: "theory"
5. CostCalculator (interactive tool) — ref: "calculator"
6. PaperDetails (research summary, citations) — ref: "paper"
7. DocumentViewer (embedded PDF) — ref: "document"
8. Footer
```

### Navigation Behavior

- **Scroll-aware**: Background transitions from transparent (over hero) to blurred white when scrolled past 50px.
- **Active tab tracking**: `useEffect` with scroll listener detects which section is in view and highlights the corresponding nav item.
- **Smooth scroll**: Clicking a nav item scrolls to the section ref with an 80px offset.
- **Mobile**: Hamburger menu with `AnimatePresence` slide-down panel.

### Nav Items

| ID | Label | Subtitle | Icon |
|----|-------|----------|------|
| `theory` | The Problem | Learn | Lightbulb |
| `calculator` | Solutions | Calculator | Calculator |
| `paper` | Research | Paper | BookOpen |
| `document` | Explore | Document | FileText |

---

## 5. Onboarding & Pedagogical Flow

The app uses a **"soft-gate" progressive disclosure** approach:

### Layer 1: FirstTimeExperience (Full-screen overlay)

**File:** `FirstTimeExperience.tsx` (~437 lines)  
**Trigger:** Automatically shown on first visit (checks `localStorage` key `hasSeenFirstTimeExperience`)  
**Can be skipped:** Yes (sets localStorage and dismisses)

**5 Steps:**
1. **"The Problem"** — Why fair cost sharing matters
2. **"Three Towns, One Reservoir"** — Introduces Riverside ($2M), Hilltop ($4M), Lakeview ($6M)
3. **"The Power of Cooperation"** — Shows coalition savings (together = $7M vs $12M separate)
4. **"The Fairness Challenge"** — Poses the question: how to split $7M fairly?
5. **"You're Ready!"** — Transitions to the calculator

### Layer 2: OnboardingTour (Dialog-based walkthrough)

**File:** `OnboardingTour.tsx` (~618 lines)  
**Trigger:** "Take a Tour" button in the calculator toolbar  
**localStorage key:** `hasSeenCostCalculatorTour`

Features an **interactive constraint-clicking demo** where users click lines on a mini Core diagram to learn about individual rationality, coalition constraints, and the Core region. Includes animated cursor hints and step-by-step explanations.

### Layer 3: CoreStoryMode (Inline guided walkthrough)

**File:** `CoreStoryMode.tsx` (~425 lines)  
**Trigger:** "Story Mode" button on the CoreVisualization component  
**No localStorage persistence** — can be replayed anytime

Walks through Core constraints step-by-step, highlighting relevant constraint lines on the main Core plot. Includes **integrated quiz checkpoints** at key steps (individual rationality, coalition rationality, the Core concept, solutions).

### Layer 4: ContextualQuizPrompt (Inline quiz)

**File:** `ContextualQuizPrompt.tsx` (~216 lines)  
**Trigger:** Appears after dismissing the Core overlay (if not previously seen)  
**localStorage key:** `hasSeenCoreQuiz`

Single contextual question about whether the Shapley Value can fall outside the Core.

### Restart Tutorial

**Location:** Footer  
**Behavior:** Clears `hasSeenFirstTimeExperience`, `hasSeenOnboardingTour`, `hasSeenCoreQuiz` from localStorage, scrolls to top, and reloads the page after 300ms.

---

## 6. Core Components — Detailed Breakdown

### CostCalculator.tsx (~1050 lines) — The Central Hub

This is the largest and most important component. It manages:

#### Data Model

```typescript
interface Participant {
  id: number;        // 1-indexed
  name: string;      // e.g., "Riverside"
  independentCost: number;  // Standalone cost c({i})
}

interface CoalitionCost {
  participants: number[];  // Array of participant IDs
  cost: number;           // Coalition cost c(S)
}
```

#### Default State (Three Towns Scenario)

| Participant | Independent Cost |
|-------------|-----------------|
| Riverside | 2 |
| Hilltop | 4 |
| Lakeview | 6 |

| Coalition | Cost |
|-----------|------|
| {1,2} | 5 |
| {1,3} | 6 |
| {2,3} | 6 |
| {1,2,3} | 7 |

#### Player Mode Toggle

Supports **3-player** and **4-player** modes. Switching resets to default scenarios for each mode.

#### Input Panel

- Editable participant names and individual costs
- Slider + number input for each cost (range 0–20, step 0.5)
- Coalition cost inputs in a 2-column grid
- Reset button returns to Three Towns defaults

#### Results Panel

- **Savings Summary**: Shows total savings and percentage reduction
- **Comparison Table**: Side-by-side table with SCRB (blue), Shapley (teal), Nucleolus (gold), Equal Split (gray) allocations
- **Method Descriptions**: Color-coded explainers for each method

#### Toolbar Features

| Button | Action |
|--------|--------|
| 3 Players / 4 Players | Toggle player mode |
| Take a Tour | Opens OnboardingTour dialog |
| Example Scenarios | Toggles ExampleBank panel |
| Cheat Sheet | Opens printable CheatSheet dialog |

#### Child Components Rendered

1. `FirstTimeExperience` — Conditional overlay
2. `OnboardingTour` — Dialog
3. `ExampleBank` — Collapsible scenario panel
4. `ShowStepsPanel` — Algorithm step-by-step breakdowns
5. Chart section (Grouped/Stacked/Pie/Radar/Compare modes)
6. `CoreVisualization` — Triangular Core plot
7. `ActiveLearningChallenges` — Quiz section (3-player mode only)

---

### CoreVisualization.tsx (~1200 lines) — The Core Plot

The most complex visualization component. Renders a **triangular (barycentric) coordinate plot** showing the feasible region ("the Core") for 3-player cooperative games.

#### Key Features

- **Constraint lines**: Individual rationality lines (x₁ ≤ c₁, x₂ ≤ c₂, x₃ ≤ c₃) and coalition rationality lines (x₁+x₂ ≤ c₁₂, etc.)
- **Core region**: Shaded polygon where all constraints are satisfied
- **Allocation points**: SCRB (blue), Shapley (teal), Nucleolus (gold) plotted on the triangle
- **Draggable points**: Users can drag allocation points; points turn **red** when outside the Core, **green** when inside
- **Clickable constraints**: Clicking a constraint line shows an explanation panel
- **Toggleable layers**: Show/hide individual constraint lines, solution points, centroid
- **Core Story Mode**: Guided narrative walkthrough (see CoreStoryMode)
- **Contextual Quiz**: Appears after initial overlay dismissal

#### Coordinate System

Uses **barycentric coordinates** mapped to SVG. The triangle vertices represent allocations where one player pays the entire grand coalition cost:
- Top vertex: Player 1 pays everything
- Bottom-left: Player 2 pays everything
- Bottom-right: Player 3 pays everything

The `toBarycentric(x1, x2, x3)` function converts allocation vectors to (x, y) SVG coordinates.

---

### ShowStepsPanel.tsx (~335 lines) — Algorithm Transparency

Expandable panel showing step-by-step calculations for each method.

#### SCRB Steps
1. Calculate separable costs: SC_i = c(N) - c(N\{i})
2. Calculate remaining benefits: RB_i = max(0, c({i}) - SC_i)
3. Calculate non-separable cost: NSC = c(N) - ΣSC_i
4. Final allocation: x_i = SC_i + (RB_i/ΣRB) × NSC

#### Shapley Steps
1. Generate all n! permutations
2. For each permutation, calculate each player's marginal contribution
3. Average marginal contributions across all permutations
4. Displays full permutation table (6 rows for 3 players)

#### Nucleolus Steps
Describes the iterative refinement approach used.

Uses `Collapsible` from shadcn/ui with animated open/close.

---

### ExampleBank.tsx (~237 lines) — Scenario Library

Pre-built scenarios users can load:

**3-Player Scenarios:**
| Scenario | Difficulty | Description |
|----------|-----------|-------------|
| 3-Town Reservoir | Beginner | Classic paper example |
| Airport Runway | Intermediate | Asymmetric cost requirements |
| Empty Core Game | Advanced | Game where Core is empty |

**4-Player Scenarios:**
| Scenario | Difficulty | Description |
|----------|-----------|-------------|
| Multi-Factory | Intermediate | Factory pollution cleanup |
| Regional Infrastructure | Advanced | Complex 4-player infrastructure |

Each scenario provides complete `participants` and `coalitions` data. Selecting one replaces the calculator's current inputs.

---

### TetrahedronVisualization.tsx (~349 lines) — 3D 4-Player Core

Uses **React Three Fiber** and **@react-three/drei** to render a 3D tetrahedron for 4-player games. Allocation points are plotted in 4D barycentric coordinates mapped to 3D Cartesian space. Features orbit controls for rotation/zoom.

Only rendered in 4-player mode (when a 4-player scenario is active, though it's imported but its rendering trigger is within the chart area logic).

---

### CheatSheet.tsx (~258 lines) — Printable Summary

A dialog containing a formatted summary of all four methods:
- Formula and component definitions
- "When to use" guidelines
- Pros and cons
- Comparison table (Core stability, uniqueness, complexity, practical use)
- Key term definitions
- Decision flowchart guidance

**Print functionality**: Calls `window.print()`. Print-specific CSS in `index.css` handles A4 page setup, hiding overlays, and ensuring readable output.

---

### Glossary.tsx (~576 lines) — Searchable Glossary

Two main exports:

1. **`Glossary` component**: Full searchable glossary with tabs for "Terms" and "Quiz Yourself"
   - ~15 defined terms with definitions, formulas, examples, and related terms
   - Search/filter functionality
   - Self-test quiz mode with randomized questions

2. **`GlossaryTermLink` component**: Inline hover card that shows a term's definition on hover. Used throughout the app to make technical terms interactive:
   ```tsx
   <GlossaryTermLink term="Shapley Value">the Shapley value</GlossaryTermLink>
   ```
   Renders a dotted-underline span with a `HoverCard` showing the full definition.

---

### CompareChart.tsx (~361 lines) — Method Comparison

Side-by-side bar chart comparing any two selected methods. Users pick methods via `Select` dropdowns. Shows:
- Grouped bar chart (Recharts)
- Difference indicators (arrows showing which method charges more per participant)
- Summary statistics

---

### ParallelCoordinatesChart.tsx (~219 lines)

Custom SVG parallel coordinates chart. Each vertical axis represents a participant; lines connect their allocation values across methods. Color-coded by method.

---

## 7. Calculation Engine

All calculations are in a single `useMemo` block inside `CostCalculator.tsx` (lines 152–302). The engine is **purely functional** — no side effects, no mutations.

### Input

- `participants`: Array of `{id, name, independentCost}`
- `coalitions`: Array of `{participants: number[], cost: number}`

### SCRB (Separable Costs, Remaining Benefits)

```
1. grandCoalitionCost = c(N)  (coalition with all players)
2. separableCosts[i] = c(N) - c(N\{i})
3. totalSeparable = Σ separableCosts
4. nonseparableCost = c(N) - totalSeparable
5. remainingBenefits[i] = max(0, c({i}) - separableCosts[i])
6. totalRemainingBenefits = Σ remainingBenefits
7. scrbAllocations[i] = separableCosts[i] + (remainingBenefits[i] / totalRemainingBenefits) × nonseparableCost
```

If `totalRemainingBenefits = 0`, non-separable cost is split equally.

### Shapley Value

Simplified calculation (not using full permutation formula):
```
For each player p:
  c1 = p.independentCost  (marginal contribution when first)
  c2avg = average of (c({p,other}) - c({other})) for all 2-player coalitions containing p
  c3 = c(N) - c(N\{p})  (marginal contribution when last)
  shapleyValue = (c1 + c2avg + c3) / 3
```

This is a simplified 3-player approximation. For 4 players, it uses the same averaging approach over 2-player coalitions.

### Nucleolus

Iterative refinement algorithm (100 iterations, step size 0.01):
1. Start with equal split: x₁ = x₂ = x₃ = c(N)/3
2. Calculate excesses for all constraints (6 total: 3 individual, 3 coalition)
3. Find minimum excess (most binding constraint)
4. Adjust allocations to equalize tight constraints
5. Re-normalize to maintain efficiency (Σxᵢ = c(N))
6. Clamp to non-negative values

**Note**: This is an approximate iterative method, not the exact LP-based nucleolus. For the Three Towns example it produces reasonable results.

### Equal Split

```
equalSplit[i] = c(N) / n
```

### Output Object

```typescript
{
  separableCosts: number[],
  nonseparableCost: number,
  scrbAllocations: number[],
  shapleyValues: number[],
  nucleolusValues: number[],
  equalSplit: number[],
  grandCoalitionCost: number,
  totalIndependentCost: number,
  savings: number,          // totalIndependent - grandCoalition
  savingsPercent: number,   // (savings / totalIndependent) × 100
}
```

---

## 8. Visualization System

### Chart Modes (CostCalculator)

Five chart modes, toggled via buttons:

| Mode | Library | Description |
|------|---------|-------------|
| Grouped | Recharts `BarChart` | Side-by-side bars per participant, grouped by method |
| Stacked | Recharts `BarChart` | Stacked bars per method, segments by participant |
| Pie | Recharts `PieChart` | 2×2 grid of donut charts, one per method |
| Radar | Recharts `RadarChart` | One radar per participant showing all 4 methods |
| Compare | Custom `CompareChart` | Two-method comparison with difference arrows |

### Core Visualization (SVG)

The triangular Core plot is a custom SVG implementation (~1200 lines). Key rendering steps:

1. **Triangle**: Equilateral triangle with labeled vertices
2. **Constraint lines**: Linear constraints clipped to triangle bounds
3. **Core polygon**: Intersection of all constraint half-planes (computed via polygon clipping)
4. **Solution points**: Colored circles at computed allocation positions
5. **Draggable interaction**: Mouse/touch drag on points, with real-time stability feedback
6. **Overlay panel**: Initial "What am I looking at?" explainer with dismiss

### Color Coding Convention

| Method | Color Token | Visual |
|--------|------------|--------|
| SCRB | `--primary` (deep blue) | Blue dot/bar |
| Shapley | `--interactive` (teal) | Teal dot/bar |
| Nucleolus | `--accent` (golden) | Gold dot/bar |
| Equal Split | `--muted-foreground` | Gray dot/bar |

This color coding is consistent across all charts, tables, and the Core plot.

---

## 9. Quiz & Active Learning System

### Quiz Architecture

The app has **four layers** of quiz/assessment:

#### 1. CoreStoryMode Quizzes (Inline)
- Embedded at specific story steps
- Questions about individual rationality, coalition rationality, Core concept, solutions
- Feedback with explanations appears inline

#### 2. ContextualQuizPrompt (Prompted)
- Single question triggered after Core overlay dismissal
- Context-specific questions for: `core`, `shapley`, `scrb`, `nucleolus`
- Features: hint system, radio button options, correct/incorrect feedback with explanation

#### 3. ActiveLearningChallenges (Dedicated Section)
- Multiple-choice challenges with difficulty levels (easy/medium/hard)
- Questions use **live calculator data** (e.g., "which method charges Player 1 the most?")
- Progress tracking within session
- Hint system

#### 4. Glossary Quiz Mode
- Self-test on glossary terms
- Randomized questions from the glossary database
- Tests definition recall

---

## 10. State Management

### React State (CostCalculator — the main state owner)

| State | Type | Purpose |
|-------|------|---------|
| `playerMode` | `3 \| 4` | Current player count |
| `participants` | `Participant[]` | Player names and standalone costs |
| `coalitions` | `CoalitionCost[]` | Coalition costs |
| `chartMode` | `string` | Active chart visualization |
| `compareMethod1/2` | `MethodType` | Selected methods for Compare view |
| `showTour` | `boolean` | OnboardingTour dialog visibility |
| `showExamples` | `boolean` | ExampleBank panel visibility |
| `showFirstTime` | `boolean` | FirstTimeExperience overlay visibility |

### Derived State (useMemo)

The `calculations` object is derived from `participants` and `coalitions` via `useMemo`. It contains all allocation results and is passed as props to child components.

### Data Flow

```
CostCalculator (state owner)
├── calculations (useMemo) ← participants, coalitions
├── → ShowStepsPanel (participants, coalitions, calculations)
├── → CoreVisualization (participants, coalitions, scrbAllocations, shapleyValues, grandCoalitionCost)
│   ├── → CoreStoryMode (participants, coalitions, grandCoalitionCost, highlight callbacks)
│   └── → ContextualQuizPrompt (context, callbacks)
├── → CompareChart (participants, all allocations, compare method selectors)
├── → ActiveLearningChallenges (allocations, participant names, grandCoalitionCost)
├── → ExampleBank (onSelectScenario callback, playerMode)
├── → FirstTimeExperience (onComplete, onSkip)
├── → OnboardingTour (open, onOpenChange, onComplete)
└── → CheatSheet (self-contained)
```

---

## 11. localStorage Keys

| Key | Set By | Purpose | Cleared By |
|-----|--------|---------|------------|
| `hasSeenFirstTimeExperience` | `CostCalculator` | Prevents FirstTimeExperience from showing again | Footer "Restart Tutorial" |
| `hasSeenCostCalculatorTour` | `CostCalculator` | Tracks OnboardingTour completion | Footer "Restart Tutorial" |
| `hasSeenCoreQuiz` | `CoreVisualization` | Prevents ContextualQuizPrompt from re-showing | Footer "Restart Tutorial" |

**No other persistence exists.** All calculator inputs, results, and quiz progress are ephemeral.

---

## 12. Dependencies & Their Roles

### Core Framework
| Package | Version | Role |
|---------|---------|------|
| `react` | ^18.3.1 | UI framework |
| `react-dom` | ^18.3.1 | DOM rendering |
| `react-router-dom` | ^6.30.1 | Client-side routing (minimal usage) |
| `@tanstack/react-query` | ^5.83.0 | Query client (set up but not actively used for data fetching) |

### UI Components
| Package | Role |
|---------|------|
| `@radix-ui/*` (17 packages) | Headless UI primitives powering shadcn/ui components |
| `class-variance-authority` | Component variant management (cva) |
| `clsx` + `tailwind-merge` | Conditional class merging (cn utility) |
| `cmdk` | Command menu component (available but not actively used) |
| `vaul` | Drawer component |
| `sonner` | Toast notifications |
| `lucide-react` | Icon library (~60+ icons used throughout) |
| `input-otp` | OTP input component (available but unused) |

### Visualization
| Package | Role |
|---------|------|
| `recharts` | Bar, Pie, Radar charts in CostCalculator |
| `three` + `@react-three/fiber` + `@react-three/drei` | 3D tetrahedron visualization for 4-player mode |

### Animation
| Package | Role |
|---------|------|
| `framer-motion` | Page transitions, element animations, AnimatePresence for mount/unmount |
| `tailwindcss-animate` | CSS-based animations via Tailwind classes |

### Styling
| Package | Role |
|---------|------|
| `tailwindcss` (via Vite) | Utility-first CSS |
| `postcss` | CSS processing |

### Forms & Validation
| Package | Role |
|---------|------|
| `react-hook-form` + `@hookform/resolvers` + `zod` | Form handling (available but not actively used) |
| `react-day-picker` + `date-fns` | Date picker (available but unused) |

### Other
| Package | Role |
|---------|------|
| `next-themes` | Theme provider (available but dark mode toggle not exposed) |
| `react-resizable-panels` | Resizable panel layout (available but unused) |
| `embla-carousel-react` | Carousel component (available but unused) |

---

## 13. Known Patterns & Conventions

### Component Structure
- Components use **functional components with hooks**
- No class components anywhere
- Motion wrappers from Framer Motion are used extensively for enter animations (`initial`, `whileInView`, `viewport: { once: true }`)

### Styling Conventions
- **Always use semantic tokens** — never raw colors in components
- Design token colors: `text-primary`, `bg-interactive/10`, `text-accent`, `text-muted-foreground`
- Card styling: `card-elevated` class for elevated cards with gradient backgrounds
- Badge-like section headers: `inline-flex items-center gap-2 px-4 py-2 rounded-full bg-{color}/10 text-{color} text-sm font-medium`

### Animation Pattern
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6, delay: 0.X }}
>
```

### Glossary Integration
Technical terms throughout the app are wrapped in `<GlossaryTermLink>` for hover definitions:
```tsx
<GlossaryTermLink term="Shapley Value">the Shapley value</GlossaryTermLink>
```

### Print Styles
`@media print` rules in `index.css` handle the CheatSheet print output — hiding overlays, forcing A4 layout, overriding colors to black/white with select gray backgrounds.

---

## 14. Potential Future Improvements

1. **Export Results**: Download calculator results as CSV/JSON
2. **True Nucleolus**: Replace iterative approximation with LP-based exact nucleolus
3. **MCRS Method**: Implement the paper's proposed MCRS method (currently only SCRB is implemented from the paper's methods)
4. **Dark Mode Toggle**: Tokens are defined but no UI toggle exists
5. **Shareable URLs**: Encode calculator state in URL params for sharing scenarios
6. **More Player Support**: Extend beyond 4 players (would require generalized permutation handling)
7. **Accessibility Audit**: Ensure full keyboard navigation and screen reader support for SVG visualizations
8. **Performance**: The Core visualization re-renders on every input change; consider debouncing for slider interactions
9. **Testing**: Only an example test exists; unit tests for calculation engine would be valuable
10. **Mobile Optimization**: Core plot SVG interactions (dragging) may be challenging on small screens

---

## Summary

This is a **self-contained, client-side educational SPA** with no backend dependencies. The critical path is:

```
Index.tsx → CostCalculator.tsx → calculations (useMemo) → [ShowStepsPanel, CoreVisualization, Charts, Challenges]
```

The app's pedagogical value comes from its **layered disclosure** (FirstTimeExperience → OnboardingTour → CoreStoryMode → Quizzes) and **transparent calculations** (ShowStepsPanel). All game theory algorithms are implemented inline in `CostCalculator.tsx` lines 152–302.
