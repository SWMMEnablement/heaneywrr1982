import { calculateShapleyViaPermutations } from "./steps-helpers";

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
  shapleyValues: number[];
  nucleolusValues: number[];
  equalSplit: number[];
  grandCoalitionCost: number;
  totalIndependentCost: number;
  savings: number;
  savingsPercent: number;
}

export function calculateAllocations(
  participants: Participant[],
  coalitions: CoalitionCost[]
): CalculationResult {
  const n = participants.length;
  const grandCoalitionCost = coalitions.find(c => c.participants.length === n)?.cost ?? 0;

  // Separable costs: c(N) - c(N - {i})
  const separableCosts = participants.map(p => {
    const withoutParticipant = coalitions.find(
      c => c.participants.length === n - 1 && !c.participants.includes(p.id)
    );
    return grandCoalitionCost - (withoutParticipant?.cost ?? 0);
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

  // MCRS Method (Minimum Costs, Remaining Savings)
  // Step 1: Minimum cost for each participant = min over all coalitions containing i of [c(S) - c(S\{i})]
  const minimumCosts = participants.map(p => {
    let minMarginal = p.independentCost; // c({i}) is the standalone marginal
    
    // Check all coalitions containing this participant
    for (const coalition of coalitions) {
      if (!coalition.participants.includes(p.id)) continue;
      if (coalition.participants.length < 2) continue;
      
      // Find c(S \ {i})
      const withoutIds = coalition.participants.filter(id => id !== p.id);
      let costWithout: number;
      
      if (withoutIds.length === 1) {
        costWithout = participants.find(pp => pp.id === withoutIds[0])?.independentCost ?? 0;
      } else {
        const withoutCoalition = coalitions.find(c =>
          c.participants.length === withoutIds.length &&
          withoutIds.every(id => c.participants.includes(id))
        );
        costWithout = withoutCoalition?.cost ?? 0;
      }
      
      const marginal = coalition.cost - costWithout;
      minMarginal = Math.min(minMarginal, marginal);
    }
    
    return Math.max(0, minMarginal);
  });

  const totalMinimumCosts = minimumCosts.reduce((a, b) => a + b, 0);
  const remainingSavingsTotal = grandCoalitionCost - totalMinimumCosts;

  // Step 2: Remaining savings allocated proportionally by standalone cost
  const totalIndependentCostForMCRS = participants.reduce((sum, p) => sum + p.independentCost, 0);
  
  const mcrsAllocations = participants.map((p, i) => {
    const share = totalIndependentCostForMCRS > 0
      ? (p.independentCost / totalIndependentCostForMCRS) * remainingSavingsTotal
      : remainingSavingsTotal / n;
    return minimumCosts[i] + share;
  });

  // Shapley Value — proper permutation-based calculation
  const shapleyValues = calculateShapleyViaPermutations(participants, coalitions);

  // Nucleolus calculation (for 3 players)
  const nucleolusValues = calculateNucleolus(participants, coalitions, grandCoalitionCost, n);

  // Equal split
  const equalSplit = participants.map(() => grandCoalitionCost / n);

  // Total savings
  const totalIndependentCost = participants.reduce((sum, p) => sum + p.independentCost, 0);
  const savings = totalIndependentCost - grandCoalitionCost;
  const savingsPercent = (savings / totalIndependentCost) * 100;

  return {
    separableCosts,
    nonseparableCost,
    scrbAllocations,
    mcrsAllocations,
    shapleyValues,
    nucleolusValues,
    equalSplit,
    grandCoalitionCost,
    totalIndependentCost,
    savings,
    savingsPercent,
  };
}

function calculateNucleolus(
  participants: Participant[],
  coalitions: CoalitionCost[],
  grandCoalitionCost: number,
  n: number
): number[] {
  if (n !== 3) return Array(n).fill(grandCoalitionCost / n);

  const c1 = participants[0].independentCost;
  const c2 = participants[1].independentCost;
  const c3 = participants[2].independentCost;
  const C = grandCoalitionCost;

  const c12 = coalitions.find(c =>
    c.participants.length === 2 &&
    c.participants.includes(1) &&
    c.participants.includes(2)
  )?.cost ?? c1 + c2;

  const c13 = coalitions.find(c =>
    c.participants.length === 2 &&
    c.participants.includes(1) &&
    c.participants.includes(3)
  )?.cost ?? c1 + c3;

  const c23 = coalitions.find(c =>
    c.participants.length === 2 &&
    c.participants.includes(2) &&
    c.participants.includes(3)
  )?.cost ?? c2 + c3;

  let x1 = C / 3;
  let x2 = C / 3;
  let x3 = C / 3;

  const iterations = 100;
  const step = 0.01;

  for (let iter = 0; iter < iterations; iter++) {
    const excesses = [
      { type: 'x1', value: c1 - x1 },
      { type: 'x2', value: c2 - x2 },
      { type: 'x3', value: c3 - x3 },
      { type: 'x12', value: c12 - x1 - x2 },
      { type: 'x13', value: c13 - x1 - x3 },
      { type: 'x23', value: c23 - x2 - x3 },
    ];

    const minExcess = Math.min(...excesses.map(e => e.value));
    const tightConstraints = excesses.filter(e => Math.abs(e.value - minExcess) < step * 2);

    let dx1 = 0, dx2 = 0, dx3 = 0;

    for (const tc of tightConstraints) {
      switch (tc.type) {
        case 'x1': dx1 -= step; break;
        case 'x2': dx2 -= step; break;
        case 'x3': dx3 -= step; break;
        case 'x12': dx1 -= step / 2; dx2 -= step / 2; break;
        case 'x13': dx1 -= step / 2; dx3 -= step / 2; break;
        case 'x23': dx2 -= step / 2; dx3 -= step / 2; break;
      }
    }

    const total = dx1 + dx2 + dx3;
    dx1 -= total / 3;
    dx2 -= total / 3;
    dx3 -= total / 3;

    x1 += dx1;
    x2 += dx2;
    x3 += dx3;

    const sum = x1 + x2 + x3;
    x1 = x1 * C / sum;
    x2 = x2 * C / sum;
    x3 = x3 * C / sum;

    x1 = Math.max(0, x1);
    x2 = Math.max(0, x2);
    x3 = Math.max(0, x3);
  }

  return [x1, x2, x3];
}
