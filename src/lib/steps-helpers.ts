import type { Participant, CoalitionCost } from "./calculations";

/** Generate all permutations of an array */
export const permutations = <T,>(arr: T[]): T[][] => {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const perms = permutations(rest);
    for (const perm of perms) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
};

/** Find a coalition entry by participant IDs (order-independent) */
export const findCoalition = (
  ids: number[],
  coalitions: CoalitionCost[]
): CoalitionCost | undefined => {
  const sorted = [...ids].sort((a, b) => a - b);
  return coalitions.find(c =>
    c.participants.length === sorted.length &&
    sorted.every(id => c.participants.includes(id))
  );
};

/**
 * Get coalition cost by participant IDs.
 * A coalition missing from the table falls back to the sum of its members'
 * standalone costs (the "no cooperation" default) — never zero, which would
 * poison Shapley, SCRB and the core. The paper notes "it is not required
 * that all coalition values be available".
 */
export const getCoalitionCost = (
  ids: number[],
  participants: Participant[],
  coalitions: CoalitionCost[]
): number => {
  if (ids.length === 1) {
    return participants.find(p => p.id === ids[0])?.independentCost ?? 0;
  }
  const coalition = findCoalition(ids, coalitions);
  if (coalition) return coalition.cost;
  // No-cooperation fallback: members act independently
  return ids.reduce(
    (sum, id) => sum + (participants.find(p => p.id === id)?.independentCost ?? 0),
    0
  );
};

/** Calculate marginal contribution for a player joining after orderBefore */
export const getMarginalContribution = (
  playerId: number,
  orderBefore: number[],
  participants: Participant[],
  coalitions: CoalitionCost[]
): number => {
  const costWithPlayer = getCoalitionCost([...orderBefore, playerId], participants, coalitions);
  const costWithout = orderBefore.length === 0 ? 0 : getCoalitionCost(orderBefore, participants, coalitions);
  return costWithPlayer - costWithout;
};

/** Calculate full Shapley value via permutation enumeration */
export const calculateShapleyViaPermutations = (
  participants: Participant[],
  coalitions: CoalitionCost[]
): number[] => {
  const allOrders = permutations(participants.map(p => p.id));

  return participants.map(p => {
    let totalMarginal = 0;
    for (const order of allOrders) {
      const playerIndex = order.indexOf(p.id);
      const before = order.slice(0, playerIndex);
      totalMarginal += getMarginalContribution(p.id, before, participants, coalitions);
    }
    return totalMarginal / allOrders.length;
  });
};
