# Roadmap — Code Review Fixes (2026-10-22)

## Critical (math correctness) — DONE, 77 tests pass, paper's printed numbers pinned
- [x] 1.1 MCRS rewrite per paper eqs. 19–23 (core bounds via LP, β-proration, θ-relaxation) — `src/lib/lp.ts`
- [x] 1.2 Exact nucleolus (sequential LP) — engine done; UI badges/duplicate still to remove
- [x] 1.3 Exact core polygon via half-plane clipping — `src/lib/core-geometry.ts`
- [x] 1.4 Id-agnostic coalition lookups
- [x] 1.5 Missing coalition cost → no-cooperation fallback

## High (broken features)
- [ ] 2.1 Render TetrahedronVisualization for 4-player mode (currently never used); add MCRS dot; fix colours
- [ ] 2.2 Replace drei `<Text>` with `<Html>` labels (no runtime font fetch)
- [ ] 2.3 Move Google Fonts @import to line 1 of index.css
- [ ] 2.4 Reset button respects current playerMode; scenario select sets mode
- [ ] 2.5 Scroll-spy: pick section with largest offsetTop ≤ scrollY
- [ ] 2.6 Add MCRS to Compare mode selects
- [ ] 2.7 Compare tie key: 'tie' not 'equal'
- [ ] 2.8 Story-mode highlight: exact set comparison, id-aware

## Medium (content)
- [ ] CoreStoryMode: correct "SCRB always in core" claim → MCRS + nucleolus
- [ ] ShowStepsPanel: real MCRS steps (eqs. 20–23, θ when core empty)
- [ ] CheatSheet: add MCRS card + row
- [ ] Compare: relabel "Total Variance" → sum of absolute differences
- [ ] index.html: real title/meta/OG
- [ ] Slider ceiling follows data (Airport c(3)=45)
- [ ] savingsPercent divide-by-zero guard
- [ ] ExampleBank: add paper's Table 1 four-person game (4-player default) + p.480 empty-core game

## Low (hygiene)
- [ ] ESLint: require() in tailwind.config.ts; empty interface in ui/textarea.tsx
- [ ] CoreVisualization: vertices as module constants
- [ ] TetrahedronWireframe: memoise THREE.Line objects
- [ ] Remove dead ParallelCoordinatesChart import
- [ ] Tests: paper-examples.test.ts (pin printed answers), core-geometry.test.ts, fix weak expectations

## Verification
- [ ] Extract exact example numbers from bundled paper PDF (p.479, p.480, Table 1)
- [ ] All tests pass; build clean
- [ ] Update memory: nucleolus is now exact (remove "Approximate badge" rule)
