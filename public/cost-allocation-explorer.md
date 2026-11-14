---
name: Cost Allocation Game Theory Explorer
file: index.html (React + Vite single-page app)
version: 1.0.0
date: 2026-11-14
author: Robert Dickinson
links: {site: https://heaneywrr1982.lovable.app, artifact: cost-allocation-explorer-source_v2.zip, repo: none}
engines:
  - {name: in-app LP solver (vertex enumeration), source: src/lib/lp.ts, license: MIT}
  - {name: allocation methods, source: src/lib/calculations.ts, license: MIT}
reference: Heaney, J.P. and Dickinson, R.E. (1982). Methods for Apportioning the Cost of a Water Resource Project. Water Resources Research 18(3), 476-482.
units: US dollars, millions ($M)
ai_use: built with Lovable (AI agent); plain-language audit explanations use Lovable AI Gateway; see AI use
---

# Cost Allocation Game Theory Explorer: compare cooperative cost-sharing methods for a joint water project

## What it does
Answers: how should partners split the cost of a shared water project so no group would rather go it alone?
For students, engineers and planners. The user enters stand-alone and coalition costs for 3 or 4 partners.
Out come allocations by SCRB, MCRS, Shapley value, Nucleolus and Equal Split, a core plot (triangle for 3, tetrahedron for 4) and a coalition audit.

## How it computes
- Inputs pass `validateGameInputs` (src/lib/audit.ts); invalid inputs suppress all results.
- Subadditivity check: c(S u T) <= c(S) + c(T) for disjoint S, T (src/lib/validation.ts).
- SCRB: separable cost SC_i = c(N) - c(N \ i); remaining nonseparable cost split in proportion to c(i) - SC_i.
- MCRS (paper eqs. 19-23): core lower/upper bounds per partner by LP, then nonseparable cost prorated by beta between bounds. Empty core: relax by theta until feasible.
- Shapley: average marginal cost over all n! orderings (exact).
- Nucleolus: exact sequential LP, maximizing the minimum excess level by level (src/lib/lp.ts).
- Equal Split: c(N)/n.
- Audit (`auditAllocation`): budget balance sum x_i = c(N) and x(S) <= c(S) for every coalition S.
- Missing coalition costs default to the sum of the members' stand-alone costs.

## Inputs and outputs
- Read: typed costs; scenario JSON via Import (src/lib/scenario-io.ts).
- Written: scenario JSON via Export. Nothing is stored on a server except AI explanation requests.
- AI explanations (edge function `explain-audit`) receive only computed figures; any reply quoting a number not in its failure is dropped.

## Checks
Mechanical, `npx vitest run` on this build: 11 files, 101 tests, 101 passed.
Three Towns (c1=2, c2=4, c3=6, c(N)=7, $M), paper pp. 478-481 (src/lib/paper-examples.test.ts):
| Method | Town 1 | Town 2 | Town 3 |
|---|---|---|---|
| SCRB | 1.375 | 2.125 | 3.500 |
| Shapley | 7/6 | 13/6 | 11/3 |
| MCRS | 10/7 | 16/7 | 23/7 |
| Nucleolus | 1.50 | 2.25 | 3.25 |
- MCRS core bounds: Town 1 [1, 2], Town 2 [1, 4], Town 3 [2, 5].
- Table 1 four-partner MCRS: (19, 24, 30, 83)/13.
- p.480 empty-core example: theta = 1/19, point near (3.68, 1.58, 4.74).
- Default scenario pinned (src/lib/deployment-check.test.ts, 12 tests).
- Core plot regressions, 3 to 4 partner switching (CoreVisualization.test.tsx, 6 tests).
Human review: Robert Dickinson reviewed UX and math (reviews dated 2026-10-22 and later).

## What this does not show
1. Games with more than 4 partners are not supported.
2. The LP solver enumerates vertices; fine for n <= 4, not a general solver.
3. AI explanation wording is not checked by a person per request.
4. Dark mode pop-ups (Cheat Sheet, tour) not visually checked by anyone.
5. No accessibility audit with a screen reader has been done.

## How to reproduce
1. `npm install`
2. `npx vitest run` (expect 101 passed)
3. `npm run dev`, open the Solutions calculator; the default is Three Towns.

## Credits and licenses
- James P. Heaney and Robert E. Dickinson, the 1982 paper and its examples.
- Lloyd Shapley (Shapley value, 1953); David Schmeidler (nucleolus, 1969).
- Libraries: React, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Recharts, Three.js / React Three Fiber.
- App code: MIT License, Robert Dickinson.

## AI use
Built with Lovable, an AI coding agent, directed and reviewed by Robert Dickinson. The optional "Explain failures" text in the Coalition Audit is AI-generated from already-computed numbers and never changes results.

## Changes
- 1.0.0 (2026-11-14): technical summary added; dark mode; AI audit explanations; scenario export/import; exact MCRS and Nucleolus; 101 tests.
