---
name: Cost Allocation Game Theory Explorer
file: rain-canvas-studio
version: 1.0.1
date: 2026-11-14
commit: 9a5efc0f4be3fde2f1d25becb311e141263d7a61
author: Robert Dickinson
licence: MIT License
links: {site: https://heaneywrr1982.lovable.app, summary: /cost-allocation-explorer.md, paper: /documents/game-theory-paper.pdf, artifact: cost-allocation-explorer-v1.0.1.md, repo: none}
engines:
  - {name: in-app LP solver by vertex enumeration, source: src/lib/lp.ts, licence: MIT License}
  - {name: allocation methods, source: src/lib/calculations.ts, licence: MIT License}
units: US customary first; monetary values are million US dollars ($M); no physical units are used
ai_use: Lovable (Lovable), November 2026; Lovable AI Gateway for optional audit explanations; see AI use
---

# Cost Allocation Game Theory Explorer: cooperative cost sharing for a joint water project

## In one sentence.

This app compares 5 allocation methods for 3 or 4 partners, and the 2026-11-14 build passed 101 tests in 11 test files.

## In one paragraph.

The default Three Towns game has stand-alone costs of $2M, $4M and $6M, a joint cost of $7M, and therefore a measured saving of $5M, or 41.66666666667% of the $12M separate total (`src/lib/calculations.test.ts:35-49`). Against the published Three Towns, Table 1, two-person and empty-core references, 47 numeric comparisons found a largest absolute difference of 0.00421052631579 $M, caused by comparison with the paper's rounded empty-core allocation rather than its exact fractional values. The fresh Vitest run passed 101 of 101 tests.

## What it does

Students, engineers and planners enter stand-alone and coalition costs for 3 or 4 partners. The app returns SCRB, MCRS, Shapley value, Nucleolus and Equal Split allocations, a core plot, step-by-step calculations and a coalition stability audit. Scenario JSON can be exported and imported. Optional AI text explains failed audit constraints without recalculating an allocation.

## How it computes

Notation: N is the set of partners, c(S) is the cost of coalition S, x(i) is partner i's allocated cost, and x(S) = sum of x(i) over i in S. All monetary equations use $M.

1. Input validation and missing costs.
   - Every entered cost must be finite and at least 0, and a grand-coalition cost must exist (`src/lib/audit.ts:20-35`). Invalid inputs suppress results.
   - A missing non-singleton coalition defaults to c(S) = sum of its members' stand-alone costs (`src/lib/steps-helpers.ts:44-50`). An unknown singleton returns 0 (`src/lib/steps-helpers.ts:41-43`).
   - Subadditivity is checked as c(S union T) <= c(S) + c(T) for every disjoint pair S and T with known costs (`src/lib/validation.ts:46-70`). Excess = c(S union T) - c(S) - c(T). There is no numerical tolerance in this check (`src/lib/validation.ts:62`).

2. SCRB, Separable Costs, Remaining Benefits.
   - SC(i) = c(N) - c(N without i).
   - NSC = c(N) - sum of SC(i).
   - RB(i) = max(0, c(i) - SC(i)).
   - x(i) = SC(i) + [RB(i) / sum of RB(j)] * NSC.
   - If the sum of RB is 0, each partner receives NSC / n instead (`src/lib/calculations.ts:346-366`).

3. MCRS, Minimum Costs, Remaining Savings.
   - Core constraints: x(S) <= c(S) for every proper non-empty S, x(i) >= 0, and sum of x(i) = c(N) (`src/lib/calculations.ts:84-103`).
   - x_min(i) = minimum x(i) over the core. x_max(i) = maximum x(i) over the core (`src/lib/calculations.ts:191-213`).
   - MCRS_NSC = c(N) - sum of x_min(i).
   - beta(i) = [x_max(i) - x_min(i)] / sum of [x_max(j) - x_min(j)].
   - x(i) = x_min(i) + beta(i) * MCRS_NSC (`src/lib/calculations.ts:215-224`).
   - If the core is empty, intermediate coalition costs become (1 + theta) * c(S), for |S| >= 2, and the LP minimizes theta. Singleton costs are not relaxed (`src/lib/calculations.ts:76-80,154-188`).
   - If the total core-bound range is <= 1e-9, the lower-bound point is returned (`src/lib/calculations.ts:216-221`). If n < 2 or c(N) <= 0, MCRS returns Equal Split and theta = 0 (`src/lib/calculations.ts:126-137`). An infeasible bound LP also falls back to Equal Split (`src/lib/calculations.ts:198-210`).

4. Shapley value.
   - For each ordering R, let P(i,R) be the partners before i.
   - marginal(i,R) = c(P(i,R) union {i}) - c(P(i,R)).
   - x(i) = [sum of marginal(i,R) over all n! orderings] / n! (`src/lib/steps-helpers.ts:53-80`).
   - The implementation enumerates every ordering; it uses no sampling or approximation threshold (`src/lib/steps-helpers.ts:4-15,70-80`).

5. Nucleolus.
   - Excess e(S) = c(S) - x(S).
   - Each sequential LP maximizes epsilon subject to e(S) >= epsilon for every unfixed proper coalition, the grand-coalition budget equation, and previously fixed excess equations (`src/lib/calculations.ts:251-280`).
   - A coalition is fixed when its maximum possible excess is <= epsilon* + 1e-6 (`src/lib/calculations.ts:282-306`). If none is fixed numerically, the coalition with the smallest current excess is fixed (`src/lib/calculations.ts:308-321`).
   - The final pinned linear system resolves x; any negative final component is clamped to 0 (`src/lib/calculations.ts:328-336`). If n < 2 or c(N) <= 0, or no feasible LP point is found, the fallback is Equal Split (`src/lib/calculations.ts:240-243,324-326`).

6. Equal Split and savings.
   - x(i) = c(N) / n (`src/lib/calculations.ts:378`).
   - Savings = sum of c(i) - c(N). Savings percent = 100 * savings / sum of c(i), or 0 when the stand-alone total is 0 (`src/lib/calculations.ts:381-383`).

7. Core geometry and audit.
   - For 3 partners, x3 = c(N) - x1 - x2. The simplex is clipped by the 6 proper-coalition half-planes (`src/lib/core-geometry.ts:59-68,88-102`).
   - Geometry EPS = 1e-9. A core is degenerate when it has fewer than 3 cleaned vertices or area < EPS * c(N)^2 (`src/lib/core-geometry.ts:21,109-126`). Non-3-partner input or c(N) <= 0 returns an empty polygon (`src/lib/core-geometry.ts:73-77`).
   - Audit budget gap = sum of x(i) - c(N). Coalition overcharge = x(S) - c(S) (`src/lib/audit.ts:63-86,105`).
   - Audit EPS = 1e-6. A violation requires overcharge > EPS. In-core requires no violations and absolute budget gap <= EPS (`src/lib/audit.ts:4,99-113`).

8. LP solver thresholds.
   - Pivot tolerance = 1e-9 and feasibility tolerance = 1e-6 (`src/lib/lp.ts:21-22`). Objective improvement must exceed the same feasibility tolerance (`src/lib/lp.ts:96-105`).
   - The solver enumerates systems of active constraints. Its documented design size is at most 5 variables and about 31 constraints, not a hard runtime limit (`src/lib/lp.ts:1-5,108-117`).

9. Optional AI audit explanation.
   - Client figures are rounded to 2 decimals with round(100 * value) / 100 (`src/lib/explain-audit.ts:16`). Failures with overcharge <= 1e-6 are omitted (`src/lib/explain-audit.ts:24-27`).
   - The function accepts 1 through 40 failures, uses model identifier openai/gpt-6-astra, makes 0 retries, and requests low reasoning effort (`supabase/functions/explain-audit/index.ts:9-11,82-89,120-135`).
   - Every decimal quoted by the AI must match one of that failure's supplied figures at 2 decimals; otherwise the explanation is dropped (`supabase/functions/explain-audit/index.ts:48-54,139-145`).

10. Climate uplift factors.
   - Not present: 0 climate uplift factors and 0 rainfall-depth equations exist in this cost-allocation code. The only climate mention is educational prose about climate agreements (`src/components/GameTheoryBackground.tsx:299`). A rainfall uplift multiplier is not applicable.

## Inputs and outputs

- Read: typed participant and coalition costs in $M; scenario JSON with format cost-allocation-scenario and version 1 (`src/lib/scenario-io.ts:3-13`). Only playerMode 3 or 4 is accepted (`src/lib/scenario-io.ts:24-31`).
- Written: scenario JSON including savedAt, participants and coalitions (`src/lib/scenario-io.ts:12-13`). The technical summary is available as Markdown and embedded as script#app-md (`vite.config.ts:7-15`).
- AI request: already-computed participant, coalition and failure figures only (`src/lib/explain-audit.ts:42-68`). AI output is explanatory text keyed by failure id, not an allocation (`src/lib/explain-audit.ts:80-83`).
- Rainfall, flow, depth and climate files read: none. Rainfall, flow, depth and climate files written: none.

## Checks

Fresh command: `npx vitest run --reporter=verbose`, started 2026-11-14 20:51:25 UTC. Result: 11 files passed, 101 tests passed, 0 failed, duration 18.14 seconds.

Reference abbreviation: H&D means James P. Heaney and Robert E. Dickinson, Methods for Apportioning the Cost of a Water Resource Project, Water Resources Research 18(3), 476-482, 1982, bundled at `public/documents/game-theory-paper.pdf`.

Tolerance notation: a closeness precision p means an allowed absolute difference of 0.5 * 10^-p. Largest difference is the largest absolute equality-style numeric difference measured after the test run by calling the current functions against the test expectations. Boolean, text, ordering and inequality-only checks have no scalar difference and are marked not applicable.

| Test file | Count | Published reference | Tolerance in the assertions | Largest difference found |
|---|---:|---|---|---:|
| `src/lib/paper-examples.test.ts` | 18 | H&D pp. 478-481, Table 1 and worked examples | 0.005 to 0.000005; core inequalities allow 1e-6 | 0.00421052631579 $M |
| `src/lib/calculations.test.ts` | 20 | H&D p. 479 for Three Towns; other properties are project-defined | Exact, 0.05 to 0.000005; inequality allowances 0.01 and 0.1 | 0.00333333333333 percentage points |
| `src/lib/steps-helpers.test.ts` | 20 | H&D p. 479 for Three Towns Shapley; other properties are project-defined | Exact, 0.005 to 0.000000000005; inequality allowance 0.001 | 0 $M |
| `src/lib/mcrs.test.ts` | 7 | H&D p. 479 supplies Three Towns costs; other properties are project-defined | Exact and 0.000005; inequality allowance 0.01 | 0 $M |
| `src/lib/deployment-check.test.ts` | 12 | H&D p. 479; old-MCRS and malformed-input regressions are project-defined | Exact 2-decimal display, 0.0000005 to 0.0000000005; inequality allowance 1e-9 | 0.00428571428571 $M against 2-decimal displays |
| `src/lib/core-geometry.test.ts` | 6 | H&D p. 479 Fig. 2 and p. 480 empty-core game | Vertices rounded to 0.001; closeness 0.05 to 0.0000005; inequalities allow 1e-9 | 0.00000000000000044408920985 $M |
| `src/lib/validation.test.ts` | 6 | No published numeric reference; project-defined subadditivity cases | Exact numeric excess and exact counts | 0 $M |
| `src/lib/explain-audit.test.ts` | 3 | H&D p. 481 Table 1 input; expected failures are project-defined | Exact arrays and ordering | 0 $M |
| `src/components/CostCalculator.test.tsx` | 2 | H&D p. 479 default MCRS display; validation behavior is project-defined | Exact rendered text | Not applicable |
| `src/components/CoreVisualization.test.tsx` | 6 | No published numerical reference; UI crash and mode-switch regressions | Finite SVG coordinates and exact UI state | Not applicable |
| `src/test/example.test.ts` | 1 | None; placeholder boolean test | Exact boolean | Not applicable |
| **Total** | **101** | Counts sum to the fresh Vitest total | See rows | See rows |

## AI review

These are historical review records, not new grades for this build. The project does not record enough provenance to relabel either review as human or AI.

| Tool | Date | Grade | Project record |
|---|---|---|---|
| Not checked | Review date not checked; roadmap dated 2026-11-01 | 76/100, C | `roadmap.md:1-13` |
| Not checked | Not checked | A-/A, approximately 90/100 | `handover.md:707-724` |

## Human review

Robert Dickinson directed the work, supplied UX and code-review findings, and is recorded in the project summary as having reviewed UX and mathematics. A person independently recalculating this build's 47 paper-reference comparisons: not checked. A person manually rerunning this build's 101 tests: not checked. A person reviewing every AI explanation produced per request: not checked.

## What this does not show

1. Games with more than 4 partners are unsupported. Tests covering 5 or more partners: 0.
2. The LP solver is intended for small problems, not general LP workloads. General-solver benchmark tests: 0.
3. Screen-reader audits by a person: 0.
4. Human visual checks of the Cheat Sheet and onboarding tour in dark mode for this build: 0.
5. Live AI explanation requests executed in this fresh test run: 0. Human reviews of AI wording per request: 0.
6. External research links newly checked against Crossref for this build: 0.
7. Climate uplift factors: 0, because there is no climate model. Rainfall-depth totals: 0, because there is no rainfall model.

## How to reproduce

Source location: the project root contains `src`, `public`, `supabase/functions`, `package.json` and `vitest.config.ts`. The earlier source snapshot is `cost-allocation-explorer-source_v2.zip`; this summary is `cost-allocation-explorer-v1.0.1.md`.

```bash
npm install
npx vitest run --reporter=verbose
npm run dev
npm run build
```

Open the Solutions calculator. Its default is Three Towns. The published fixtures and expected values are in `src/lib/paper-examples.test.ts:10-69,73-230`. The Markdown source is `public/cost-allocation-explorer.md`; running the app or building it embeds that file as `script#app-md` through `vite.config.ts:7-15,25`.

One real application API request, using the client already configured in `src/integrations/supabase/client.ts`:

```ts
const { data, error } = await supabase.functions.invoke("explain-audit", {
  body: {
    grandCoalitionCost: 12,
    participants: [
      { name: "Purpose 1", standaloneCost: 2 },
      { name: "Purpose 2", standaloneCost: 4 },
      { name: "Purpose 3", standaloneCost: 6 },
      { name: "Purpose 4", standaloneCost: 8 }
    ],
    coalitionCosts: [],
    failures: [{
      id: "equal:x123",
      method: "Equal Split",
      coalition: "Purpose 1 + Purpose 2 + Purpose 3",
      members: [
        { name: "Purpose 1", pays: 3, standaloneCost: 2 },
        { name: "Purpose 2", pays: 3, standaloneCost: 4 },
        { name: "Purpose 3", pays: 3, standaloneCost: 6 }
      ],
      coalitionCost: 7,
      paid: 9,
      overcharge: 2
    }]
  }
});
```

This is the request shape used at `src/lib/explain-audit.ts:60-68`, with the Table 1 failure pinned at `src/lib/explain-audit.test.ts:25-40`. Expected success: HTTP 200 and one explanation with id `equal:x123`. Expected cost total: paid = 9.00 $M, coalition cost = 7.00 $M, overcharge = 2.00 $M. Expected rainfall-depth total: not applicable, because neither the request nor response contains depth. Live API response for this build: not checked. Exact AI wording is not deterministic.

## Credits and licenses

| Method or work | Author or originating body | Year | Source |
|---|---|---:|---|
| SCRB | Federal Inter-Agency River Basin Committee | 1950 | H&D p. 477, equations 3-7 |
| MCRS | James P. Heaney and Robert E. Dickinson | 1982 | H&D pp. 479-481, equations 19-23 |
| Shapley value | Lloyd S. Shapley | 1953 | H&D p. 478 and bibliography; `src/components/GameTheoryBackground.tsx:116` |
| Nucleolus | David Schmeidler | 1969 | H&D p. 478 and bibliography; `src/components/GameTheoryBackground.tsx:118` |
| Sequential-LP implementation approach | Michael Maschler, Bezalel Peleg and Lloyd S. Shapley | Year not checked | `src/lib/calculations.ts:227-234` |
| Equal proration option | Federal Inter-Agency River Basin Committee; no individual inventor claimed | 1950 | H&D p. 477, minimum-charge option list |

App code: MIT License, copyright 2026 Robert Dickinson (`LICENSE:1-5`). Libraries used include React, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Recharts, Three.js and React Three Fiber (`package.json:15-60`). The paper is credited to James P. Heaney and Robert E. Dickinson; no new license for the paper is claimed.

## AI use

Tool and maker: Lovable, by Lovable, November 2026. Optional explanations use Lovable AI Gateway with model identifier `openai/gpt-6-astra` (`supabase/functions/explain-audit/index.ts:9-11`).

Robert Dickinson's work:

- Co-authored the 1982 source paper with James P. Heaney.
- Directed the app work and supplied UX, code and grading review findings.
- Reviewed UX and mathematics as recorded in the project summary. Independent human recalculation of all 47 reference comparisons in this build: not checked.

Lovable's work, task by task:

- Built the React learning interface, onboarding, quizzes, core plots and method comparisons.
- Implemented SCRB, MCRS, full-permutation Shapley, sequential-LP Nucleolus and Equal Split.
- Added input and subadditivity validation, coalition auditing, scenario JSON export/import and regression tests.
- Added the optional grounded audit-explanation request and server-side number filter.
- Added dark mode and the embedded/downloadable technical summary.

How results were checked: the fresh run passed 101 automated tests in 11 files. Current functions were also called against 47 published numeric references; the largest difference was 0.00421052631579 $M. UI crash and mode-switch behavior has 8 automated component tests across 2 files. Live AI output and human-only checks remain listed under What this does not show.

## Changes

- 1.0.1 (2026-11-14): rewrote the technical summary from current source and a fresh 101-test run; added per-file tolerances and measured differences, explicit API provenance, review provenance and task-level AI disclosure.
- 1.0.0 (2026-11-14): added the technical summary, dark mode, AI audit explanations, scenario export/import, exact MCRS and Nucleolus, and 101 tests.
