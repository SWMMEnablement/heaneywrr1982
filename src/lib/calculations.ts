import { calculateShapleyViaPermutations, getCoalitionCost } from "./steps-helpers";
import { solveLP, type LPConstraint } from "./lp";

export interface Participant {
  id: number;
  name: string;
  independentCost: number;
}

export interface CoalitionCost {
  participants: number[];
  cost: number;
}

export interface CalculationResult {
  separableCosts: number[];
  nonseparableCost: number;
  scrbAllocations: number[];
  mcrsAllocations: number[];
  /** MCRS core bounds x(i)min / x(i)max (paper eqs. 19–20) */
  mcrsLowerBounds: number[];
  mcrsUpperBounds: number[];
  mcrsNonseparableCost: number;
  /** True when the game has no core; MCRS then uses the θ-relaxed core (LP 19) */
  coreEmpty: boolean;
  /** Smallest θ opening a core (0 when the core exists) */
  coreRelaxationTheta: number;
  shapleyValues: number[];
  nucleolusValues: number[];
  equalSplit: number[];
  grandCoalitionCost: number;
  totalIndependentCost: number;
  savings: number;
  savingsPercent: number;
}

/** All non-empty proper subsets of participant ids, as id arrays. */
function properSubsets(ids: number[]): number[][] {
  const subsets: number[][] = [];
  const full = (1 << ids.length) - 1;
  for (let mask = 1; mask < full; mask++) {
    const subset: number[] = [];
    for (let i = 0; i < ids.length; i++) {
      if (mask & (1 << i)) subset.push(ids[i]);
    }
    subsets.push(subset);
  }
  return subsets;
}

/** Sum of x over the given participant indices (0-based positions). */
function sumCoeffs(indices: number[], numVars: number): number[] {
  const coeffs = new Array(numVars).fill(0);
  for (const i of indices) coeffs[i] = 1;
  return coeffs;
}

interface CoreLPData {
  /** Index (0-based) of each participant id */
  indexOf: Map<number, number>;
  subsets: number[][];
  /** Subset as 0-based position indices, parallel to `subsets` */
  subsetIndices: number[][];
  costs: number[];
}

function buildCoreData(
  participants: Participant[],
  coalitions: CoalitionCost[],
  relaxationTheta: number
): CoreLPData {
  const ids = participants.map(p => p.id);
  const indexOf = new Map(ids.map((id, i) => [id, i] as const));
  const subsets = properSubsets(ids);
  const subsetIndices = subsets.map(s => s.map(id => indexOf.get(id)!));
  const costs = subsets.map(s => {
    const base = getCoalitionCost(s, participants, coalitions);
    // LP 19 relaxes only intermediate coalitions (|S| ≥ 2); singletons stay at c(i).
    return s.length >= 2 && relaxationTheta > 0 ? (1 + relaxationTheta) * base : base;
  });
  return { indexOf, subsets, subsetIndices, costs };
}

/** Core constraints (paper eq. 20): x(S) ≤ c(S) ∀ S ⊂ N, x(i) ≥ 0, Σx = c(N). */
function coreConstraints(
  data: CoreLPData,
  n: number,
  grandCost: number
): { inequalities: LPConstraint[]; equalities: LPConstraint[] } {
  const inequalities: LPConstraint[] = data.subsetIndices.map((idx, k) => ({
    coeffs: sumCoeffs(idx, n),
    rhs: data.costs[k],
  }));
  for (let i = 0; i < n; i++) {
    const coeffs = new Array(n).fill(0);
    coeffs[i] = -1;
    inequalities.push({ coeffs, rhs: 0 }); // x(i) ≥ 0
  }
  const equalities: LPConstraint[] = [
    { coeffs: new Array(n).fill(1), rhs: grandCost },
  ];
  return { inequalities, equalities };
}

/**
 * MCRS (Minimum Costs, Remaining Savings) — Heaney & Dickinson (1982), eqs. 19–23.
 *
 * Step 1: x(i)min and x(i)max are the min/max of x(i) over the core (LP 20).
 *         If the core is empty, intermediate coalition costs are relaxed to
 *         (1+θ)c(S) by the smallest θ that opens a core (LP 19).
 * Step 2: nsc = c(N) − Σ x(i)min;  β(i) = [x(i)max − x(i)min] / Σ[...]  (eqs. 21–22)
 * Step 3: x(i) = x(i)min + β(i)·nsc  (eq. 23)
 */
function calculateMCRS(
  participants: Participant[],
  coalitions: CoalitionCost[],
  grandCoalitionCost: number
): {
  allocations: number[];
  lowerBounds: number[];
  upperBounds: number[];
  nonseparableCost: number;
  coreEmpty: boolean;
  theta: number;
} {
  const n = participants.length;
  const equal = new Array(n).fill(grandCoalitionCost / n);
  if (n < 2 || grandCoalitionCost <= 0) {
    return {
      allocations: equal,
      lowerBounds: [...equal],
      upperBounds: [...equal],
      nonseparableCost: 0,
      coreEmpty: false,
      theta: 0,
    };
  }

  // Does a core exist?
  const baseData = buildCoreData(participants, coalitions, 0);
  const baseConstraints = coreConstraints(baseData, n, grandCoalitionCost);
  const feasibility = solveLP(
    n,
    new Array(n).fill(0),
    "min",
    baseConstraints.inequalities,
    baseConstraints.equalities
  );

  let theta = 0;
  let data = baseData;
  const coreEmpty = !feasibility.feasible;

  if (coreEmpty) {
    // LP 19: min θ s.t. x(S) − θ·c(S) ≤ c(S) for intermediate S, x(i) ≤ c(i),
    // x ≥ 0, θ ≥ 0, Σx = c(N). Variables: [x1..xn, θ].
    const numVars = n + 1;
    const inequalities: LPConstraint[] = [];
    baseData.subsetIndices.forEach((idx, k) => {
      const coeffs = new Array(numVars).fill(0);
      for (const i of idx) coeffs[i] = 1;
      if (baseData.subsets[k].length >= 2) {
        coeffs[n] = -baseData.costs[k]; // −θ·c(S)
      }
      inequalities.push({ coeffs, rhs: baseData.costs[k] });
    });
    for (let i = 0; i < n; i++) {
      const coeffs = new Array(numVars).fill(0);
      coeffs[i] = -1;
      inequalities.push({ coeffs, rhs: 0 });
    }
    const thetaNonNeg = new Array(numVars).fill(0);
    thetaNonNeg[n] = -1;
    inequalities.push({ coeffs: thetaNonNeg, rhs: 0 });
    const grandEq = new Array(numVars).fill(0);
    for (let i = 0; i < n; i++) grandEq[i] = 1;

    const relaxed = solveLP(
      numVars,
      [...new Array(n).fill(0), 1],
      "min",
      inequalities,
      [{ coeffs: grandEq, rhs: grandCoalitionCost }]
    );
    if (relaxed.feasible) {
      theta = Math.max(0, relaxed.point[n]);
      data = buildCoreData(participants, coalitions, theta);
    }
  }

  // LP 20: min/max x(i) over the (possibly relaxed) core.
  const constraints = coreConstraints(data, n, grandCoalitionCost);
  const lowerBounds: number[] = [];
  const upperBounds: number[] = [];
  for (let i = 0; i < n; i++) {
    const objective = new Array(n).fill(0);
    objective[i] = 1;
    const minRes = solveLP(n, objective, "min", constraints.inequalities, constraints.equalities);
    const maxRes = solveLP(n, objective, "max", constraints.inequalities, constraints.equalities);
    if (!minRes.feasible || !maxRes.feasible) {
      // Numerical fallback: equal split
      return {
        allocations: equal,
        lowerBounds: [...equal],
        upperBounds: [...equal],
        nonseparableCost: 0,
        coreEmpty,
        theta,
      };
    }
    lowerBounds.push(minRes.value);
    upperBounds.push(maxRes.value);
  }

  const nonseparableCost = grandCoalitionCost - lowerBounds.reduce((a, b) => a + b, 0);
  const ranges = participants.map((_, i) => Math.max(0, upperBounds[i] - lowerBounds[i]));
  const totalRange = ranges.reduce((a, b) => a + b, 0);

  const allocations = participants.map((_, i) => {
    if (totalRange <= 1e-9) return lowerBounds[i]; // point core
    return lowerBounds[i] + (ranges[i] / totalRange) * nonseparableCost;
  });

  return { allocations, lowerBounds, upperBounds, nonseparableCost, coreEmpty, theta };
}

/**
 * Exact nucleolus via the sequential-LP method (Maschler–Peleg–Shapley).
 *
 * Repeatedly maximize the minimum coalition excess e(S) = c(S) − x(S);
 * coalitions whose excess cannot rise above the current optimum are fixed,
 * and the process repeats on the remaining coalitions. Works for any n the
 * LP helper handles; when the core is empty it returns the least-core point.
 */
function calculateNucleolus(
  participants: Participant[],
  coalitions: CoalitionCost[],
  grandCoalitionCost: number
): number[] {
  const n = participants.length;
  if (n < 2 || grandCoalitionCost <= 0) {
    return new Array(n).fill(grandCoalitionCost / Math.max(1, n));
  }

  const ids = participants.map(p => p.id);
  const indexOf = new Map(ids.map((id, i) => [id, i] as const));
  const subsets = properSubsets(ids);
  const subsetIndices = subsets.map(s => s.map(id => indexOf.get(id)!));
  const costs = subsets.map(s => getCoalitionCost(s, participants, coalitions));

  const numVars = n + 1; // [x1..xn, ε]
  const grandEq: LPConstraint = {
    coeffs: [...new Array(n).fill(1), 0],
    rhs: grandCoalitionCost,
  };
  const objective = [...new Array(n).fill(0), 1]; // maximize ε

  const fixedExcess = new Map<number, number>(); // subset index → fixed excess value
  let lastPoint: number[] | null = null;

  for (let iter = 0; iter < subsets.length; iter++) {
    const unfixed = subsets.map((_, k) => k).filter(k => !fixedExcess.has(k));
    if (unfixed.length === 0) break;

    const equalities: LPConstraint[] = [grandEq];
    for (const [k, val] of fixedExcess) {
      equalities.push({
        coeffs: [...sumCoeffs(subsetIndices[k], n), 0],
        rhs: costs[k] - val,
      });
    }
    const inequalities: LPConstraint[] = unfixed.map(k => ({
      // x(S) + ε ≤ c(S)   ⇔   e(S) ≥ ε
      coeffs: [...sumCoeffs(subsetIndices[k], n), 1],
      rhs: costs[k],
    }));

    const res = solveLP(numVars, objective, "max", inequalities, equalities);
    if (!res.feasible) break;
    lastPoint = res.point;
    const epsilonStar = res.point[n];

    // Fix every coalition whose excess cannot rise above ε*.
    let fixedAny = false;
    for (const k of unfixed) {
      // max e(S_k) s.t. all other unfixed excesses stay ≥ ε*
      const capIneq: LPConstraint[] = unfixed
        .filter(t => t !== k)
        .map(t => ({
          coeffs: [...sumCoeffs(subsetIndices[t], n), 0],
          rhs: costs[t] - epsilonStar,
        }));
      const capObj = [...sumCoeffs(subsetIndices[k], n), 0].map(v => -v); // min x(S_k)
      const capRes = solveLP(numVars, capObj, "min", capIneq, equalities);
      const maxExcess = capRes.feasible ? costs[k] - capRes.value : epsilonStar;
      if (maxExcess <= epsilonStar + 1e-6) {
        fixedExcess.set(k, epsilonStar);
        fixedAny = true;
      }
    }

    // Numerical safety: always fix at least the tightest coalition.
    if (!fixedAny) {
      let tightest = unfixed[0];
      let tightestExcess = Infinity;
      for (const k of unfixed) {
        const xSum = subsetIndices[k].reduce((s, i) => s + res.point[i], 0);
        const e = costs[k] - xSum;
        if (e < tightestExcess) {
          tightestExcess = e;
          tightest = k;
        }
      }
      fixedExcess.set(tightest, tightestExcess);
    }
  }

  if (!lastPoint) {
    return new Array(n).fill(grandCoalitionCost / n);
  }

  // Resolve the fully pinned system for the final allocation.
  const equalities: LPConstraint[] = [grandEq];
  for (const [k, val] of fixedExcess) {
    equalities.push({ coeffs: sumCoeffs(subsetIndices[k], n), rhs: costs[k] - val });
  }
  const finalRes = solveLP(n, new Array(n).fill(0), "min", [], equalities);
  const x = finalRes.feasible ? finalRes.point : lastPoint.slice(0, n);

  return x.map(v => Math.max(0, v));
}

export function calculateAllocations(
  participants: Participant[],
  coalitions: CoalitionCost[]
): CalculationResult {
  const n = participants.length;
  const grandCoalitionCost = coalitions.find(c => c.participants.length === n)?.cost ?? 0;

  // Separable costs: c(N) - c(N - {i}); missing coalitions fall back to no cooperation
  const separableCosts = participants.map(p => {
    const withoutIds = participants.filter(pp => pp.id !== p.id).map(pp => pp.id);
    return grandCoalitionCost - getCoalitionCost(withoutIds, participants, coalitions);
  });

  // SCRB Method
  const totalSeparable = separableCosts.reduce((a, b) => a + b, 0);
  const nonseparableCost = grandCoalitionCost - totalSeparable;

  const remainingBenefits = participants.map((p, i) =>
    Math.max(0, p.independentCost - separableCosts[i])
  );
  const totalRemainingBenefits = remainingBenefits.reduce((a, b) => a + b, 0);

  const scrbAllocations = participants.map((_, i) => {
    const share = totalRemainingBenefits > 0
      ? (remainingBenefits[i] / totalRemainingBenefits) * nonseparableCost
      : nonseparableCost / n;
    return separableCosts[i] + share;
  });

  // MCRS Method (paper eqs. 19–23, exact core bounds via LP)
  const mcrs = calculateMCRS(participants, coalitions, grandCoalitionCost);

  // Shapley Value — proper permutation-based calculation
  const shapleyValues = calculateShapleyViaPermutations(participants, coalitions);

  // Nucleolus — exact sequential-LP calculation
  const nucleolusValues = calculateNucleolus(participants, coalitions, grandCoalitionCost);

  // Equal split
  const equalSplit = participants.map(() => grandCoalitionCost / n);

  // Total savings
  const totalIndependentCost = participants.reduce((sum, p) => sum + p.independentCost, 0);
  const savings = totalIndependentCost - grandCoalitionCost;
  const savingsPercent = totalIndependentCost > 0 ? (savings / totalIndependentCost) * 100 : 0;

  return {
    separableCosts,
    nonseparableCost,
    scrbAllocations,
    mcrsAllocations: mcrs.allocations,
    mcrsLowerBounds: mcrs.lowerBounds,
    mcrsUpperBounds: mcrs.upperBounds,
    mcrsNonseparableCost: mcrs.nonseparableCost,
    coreEmpty: mcrs.coreEmpty,
    coreRelaxationTheta: mcrs.theta,
    shapleyValues,
    nucleolusValues,
    equalSplit,
    grandCoalitionCost,
    totalIndependentCost,
    savings,
    savingsPercent,
  };
}
