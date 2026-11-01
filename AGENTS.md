# AGENTS.md

- Calculator inputs pass through `validateGameInputs` (src/lib/audit.ts) before any allocation runs; invalid inputs suppress results rather than computing on garbage — the LP solvers return absurd values on negative costs.
- Stability checks (budget balance, x(S) ≤ c(S)) live in `auditAllocation`; UI audit and tests both use it so the "in the core" verdict has one definition.
- `src/lib/deployment-check.test.ts` and `src/components/CostCalculator.test.tsx` pin the default-scenario results; run them before publishing — they catch an outdated calculation engine.
- Every external research link must be verified against Crossref (title + journal) before it is added — earlier DOIs pointed at unrelated papers.
- AI explanations of audit failures run in the `explain-audit` edge function; it only receives already-computed figures and drops any explanation quoting a number not in its own failure, so AI text can never alter or invent results.
