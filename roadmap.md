# Roadmap — Code Review Fixes (2026-10-22)

## Critical (math correctness) — DONE, 77 tests pass, paper's printed numbers pinned
- [x] 1.1 MCRS rewrite per paper eqs. 19–23 (core bounds via LP, β-proration, θ-relaxation) — `src/lib/lp.ts`
- [x] 1.2 Exact nucleolus (sequential LP) — engine done; UI badges/duplicate still to remove
- [x] 1.3 Exact core polygon via half-plane clipping — `src/lib/core-geometry.ts`
- [x] 1.4 Id-agnostic coalition lookups
- [x] 1.5 Missing coalition cost → no-cooperation fallback

## High (broken features) — DONE
- [x] 2.1 Tetrahedron rendered for 4-player mode; MCRS dot added; colours matched
- [x] 2.2 drei `<Text>` → `<Html>` labels (no runtime font fetch)
- [x] 2.3 Google Fonts @import moved to line 1 of index.css
- [x] 2.4 Reset respects current playerMode; scenario select sets mode
- [x] 2.5 Scroll-spy uses page order
- [x] 2.6 MCRS in Compare mode selects
- [x] 2.7 Compare tie key: 'tie' not 'equal'
- [x] 2.8 Story-mode highlight: exact id-aware match

## Medium (content) — DONE
- [x] CoreStoryMode: SCRB claim corrected (MCRS + nucleolus are the in-core methods)
- [x] ShowStepsPanel: real MCRS steps from engine bounds (eqs. 20–23, θ note when core empty)
- [x] CheatSheet: MCRS card + comparison row
- [x] Compare: "Total Variance" → "Total Abs. Difference"
- [x] index.html: real title/meta/OG
- [x] Slider ceiling follows data (1.5× max cost, min 20)
- [x] savingsPercent divide-by-zero guard (in calculations.ts)
- [x] ExampleBank: paper's Table 1 game (now 4-player default) + p.480 empty-core game

## Low (hygiene) — DONE
- [x] ESLint: tailwind.config.ts import; textarea.tsx type alias
- [x] CoreVisualization: vertices as module constants
- [x] TetrahedronWireframe: memoised THREE.Line objects
- [x] Dead ParallelCoordinatesChart import removed
- [x] Tests: paper-examples.test.ts, core-geometry.test.ts, corrected expectations

## Verification — DONE
- [x] Extracted exact example numbers from bundled paper PDF (p.478–481)
- [x] 78 tests pass; build clean
- [x] Memory updated: nucleolus/MCRS now exact

## Deferred (review §6 recommendations, not requested fixes)
- Dark mode toggle, touch drag, mobile SVG viewBox, shareable URLs, live quiz
