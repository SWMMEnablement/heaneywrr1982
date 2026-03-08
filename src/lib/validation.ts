import type { Participant, CoalitionCost } from "./calculations";

export interface SubadditivityViolation {
  coalitionS: number[];
  coalitionT: number[];
  costS: number;
  costT: number;
  costUnion: number;
  excess: number;
}

/**
 * Check if coalition costs satisfy subadditivity: c(S∪T) ≤ c(S) + c(T)
 * for all disjoint coalitions S, T.
 * Returns a list of violations found.
 */
export function checkSubadditivity(
  participants: Participant[],
  coalitions: CoalitionCost[]
): SubadditivityViolation[] {
  const violations: SubadditivityViolation[] = [];

  const getCost = (ids: number[]): number | null => {
    if (ids.length === 1) {
      return participants.find(p => p.id === ids[0])?.independentCost ?? null;
    }
    const sorted = [...ids].sort((a, b) => a - b);
    const c = coalitions.find(
      co => co.participants.length === sorted.length &&
        sorted.every(id => co.participants.includes(id))
    );
    return c?.cost ?? null;
  };

  // Generate all non-empty subsets of participant IDs
  const ids = participants.map(p => p.id);
  const subsets: number[][] = [];
  for (let mask = 1; mask < (1 << ids.length); mask++) {
    const subset: number[] = [];
    for (let i = 0; i < ids.length; i++) {
      if (mask & (1 << i)) subset.push(ids[i]);
    }
    subsets.push(subset);
  }

  // Check all pairs of disjoint subsets
  for (let i = 0; i < subsets.length; i++) {
    for (let j = i + 1; j < subsets.length; j++) {
      const s = subsets[i];
      const t = subsets[j];

      // Check disjoint
      if (s.some(id => t.includes(id))) continue;

      const union = [...s, ...t].sort((a, b) => a - b);
      const costS = getCost(s);
      const costT = getCost(t);
      const costUnion = getCost(union);

      if (costS === null || costT === null || costUnion === null) continue;

      if (costUnion > costS + costT) {
        violations.push({
          coalitionS: s,
          coalitionT: t,
          costS,
          costT,
          costUnion,
          excess: costUnion - (costS + costT),
        });
      }
    }
  }

  return violations;
}
