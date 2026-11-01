import type { Participant, CoalitionCost } from "./calculations";
import { getCoalitionCost } from "./steps-helpers";

const EPS = 1e-6;

export interface InputIssue {
  /** Human label of the offending field, e.g. "c(123)" or "Riverside cost" */
  field: string;
  message: string;
}

/**
 * Validate calculator inputs before any allocation is computed.
 * Costs must be finite, non-negative numbers and the grand coalition must exist.
 */
export function validateGameInputs(
  participants: Participant[],
  coalitions: CoalitionCost[]
): InputIssue[] {
  const issues: InputIssue[] = [];
  const check = (field: string, value: number) => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      issues.push({ field, message: `${field} must be a number.` });
    } else if (value < 0) {
      issues.push({ field, message: `${field} is ${value}; costs cannot be negative.` });
    }
  };

  participants.forEach(p => check(`c(${p.id}) for ${p.name || `participant ${p.id}`}`, p.independentCost));
  coalitions.forEach(c => check(`c(${c.participants.join("")})`, c.cost));

  const n = participants.length;
  if (!coalitions.some(c => c.participants.length === n)) {
    issues.push({ field: "c(N)", message: "The grand-coalition cost is missing." });
  }
  return issues;
}

export interface CoalitionCheck {
  ids: number[];
  /** Story-mode key used by the core diagram, e.g. "x23" */
  key: string;
  label: string;
  cost: number;
  paid: number;
  /** paid − cost; positive means the coalition is overcharged */
  overcharge: number;
}

export interface AllocationAudit {
  total: number;
  /** total − c(N); non-zero means the budget does not balance */
  budgetGap: number;
  individualViolations: CoalitionCheck[];
  coalitionViolations: CoalitionCheck[];
  /** Every proper coalition (singletons included), in participant order */
  checks: CoalitionCheck[];
  /** Largest overcharge over all proper coalitions, or null when none */
  worst: CoalitionCheck | null;
  inCore: boolean;
}

/** Audit one allocation against budget balance and every coalition constraint x(S) ≤ c(S). */
export function auditAllocation(
  participants: Participant[],
  coalitions: CoalitionCost[],
  allocation: number[]
): AllocationAudit {
  const n = participants.length;
  const grand = coalitions.find(c => c.participants.length === n)?.cost ?? 0;
  const total = allocation.reduce((a, b) => a + (b ?? 0), 0);
  const checks: CoalitionCheck[] = [];

  for (let mask = 1; mask < (1 << n) - 1; mask++) {
    const idx: number[] = [];
    for (let i = 0; i < n; i++) if (mask & (1 << i)) idx.push(i);
    const ids = idx.map(i => participants[i].id);
    const cost = getCoalitionCost(ids, participants, coalitions);
    const paid = idx.reduce((s, i) => s + (allocation[i] ?? 0), 0);
    checks.push({
      ids,
      key: `x${ids.join("")}`,
      label: idx.map(i => participants[i].name || `P${participants[i].id}`).join(" + "),
      cost,
      paid,
      overcharge: paid - cost,
    });
  }
  checks.sort((a, b) => a.ids.length - b.ids.length);

  const violating = checks.filter(c => c.overcharge > EPS);
  const worst = violating.reduce<CoalitionCheck | null>(
    (w, c) => (!w || c.overcharge > w.overcharge ? c : w),
    null
  );
  const budgetGap = total - grand;

  return {
    total,
    budgetGap,
    individualViolations: violating.filter(c => c.ids.length === 1),
    coalitionViolations: violating.filter(c => c.ids.length > 1),
    checks,
    worst,
    inCore: violating.length === 0 && Math.abs(budgetGap) <= EPS,
  };
}
