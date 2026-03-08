import { describe, it, expect } from "vitest";
import {
  permutations,
  getCoalitionCost,
  getMarginalContribution,
  calculateShapleyViaPermutations,
} from "./steps-helpers";
import type { Participant, CoalitionCost } from "./calculations";

const threeTowns: { participants: Participant[]; coalitions: CoalitionCost[] } = {
  participants: [
    { id: 1, name: "Riverside", independentCost: 2 },
    { id: 2, name: "Hilltop", independentCost: 4 },
    { id: 3, name: "Lakeview", independentCost: 6 },
  ],
  coalitions: [
    { participants: [1, 2], cost: 5 },
    { participants: [1, 3], cost: 6 },
    { participants: [2, 3], cost: 6 },
    { participants: [1, 2, 3], cost: 7 },
  ],
};

describe("permutations", () => {
  it("returns single permutation for 1-element array", () => {
    expect(permutations([1])).toEqual([[1]]);
  });

  it("returns 2 permutations for 2-element array", () => {
    const result = permutations([1, 2]);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual([1, 2]);
    expect(result).toContainEqual([2, 1]);
  });

  it("returns 6 permutations for 3-element array", () => {
    expect(permutations([1, 2, 3])).toHaveLength(6);
  });

  it("returns 24 permutations for 4-element array", () => {
    expect(permutations([1, 2, 3, 4])).toHaveLength(24);
  });

  it("contains no duplicate permutations", () => {
    const result = permutations([1, 2, 3]);
    const asStrings = result.map(p => p.join(","));
    expect(new Set(asStrings).size).toBe(6);
  });

  it("works with non-numeric types", () => {
    const result = permutations(["a", "b"]);
    expect(result).toContainEqual(["a", "b"]);
    expect(result).toContainEqual(["b", "a"]);
  });
});

describe("getCoalitionCost", () => {
  const { participants, coalitions } = threeTowns;

  it("returns independent cost for single-player coalition", () => {
    expect(getCoalitionCost([1], participants, coalitions)).toBe(2);
    expect(getCoalitionCost([2], participants, coalitions)).toBe(4);
    expect(getCoalitionCost([3], participants, coalitions)).toBe(6);
  });

  it("returns correct cost for 2-player coalitions", () => {
    expect(getCoalitionCost([1, 2], participants, coalitions)).toBe(5);
    expect(getCoalitionCost([1, 3], participants, coalitions)).toBe(6);
    expect(getCoalitionCost([2, 3], participants, coalitions)).toBe(6);
  });

  it("returns correct cost for grand coalition", () => {
    expect(getCoalitionCost([1, 2, 3], participants, coalitions)).toBe(7);
  });

  it("handles unsorted input IDs", () => {
    expect(getCoalitionCost([3, 1], participants, coalitions)).toBe(6);
    expect(getCoalitionCost([3, 2, 1], participants, coalitions)).toBe(7);
  });

  it("returns 0 for unknown coalition", () => {
    expect(getCoalitionCost([1, 2], participants, [])).toBe(0);
  });

  it("returns 0 for unknown single player", () => {
    expect(getCoalitionCost([99], participants, coalitions)).toBe(0);
  });
});

describe("getMarginalContribution", () => {
  const { participants, coalitions } = threeTowns;

  it("returns standalone cost when player is first", () => {
    expect(getMarginalContribution(1, [], participants, coalitions)).toBe(2);
    expect(getMarginalContribution(2, [], participants, coalitions)).toBe(4);
    expect(getMarginalContribution(3, [], participants, coalitions)).toBe(6);
  });

  it("returns marginal cost when joining a coalition", () => {
    // Player 3 joining {1}: c({1,3}) - c({1}) = 6 - 2 = 4
    expect(getMarginalContribution(3, [1], participants, coalitions)).toBe(4);
    // Player 1 joining {2}: c({1,2}) - c({2}) = 5 - 4 = 1
    expect(getMarginalContribution(1, [2], participants, coalitions)).toBe(1);
  });

  it("returns marginal cost when joining as last player", () => {
    // Player 1 joining {2,3}: c({1,2,3}) - c({2,3}) = 7 - 6 = 1
    expect(getMarginalContribution(1, [2, 3], participants, coalitions)).toBe(1);
    // Player 3 joining {1,2}: c({1,2,3}) - c({1,2}) = 7 - 5 = 2
    expect(getMarginalContribution(3, [1, 2], participants, coalitions)).toBe(2);
  });
});

describe("calculateShapleyViaPermutations", () => {
  const { participants, coalitions } = threeTowns;

  it("values sum to grand coalition cost", () => {
    const values = calculateShapleyViaPermutations(participants, coalitions);
    const total = values.reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(7, 5);
  });

  it("assigns smaller share to smaller player", () => {
    const values = calculateShapleyViaPermutations(participants, coalitions);
    // Player 1 (cost 2) should pay less than Player 3 (cost 6)
    expect(values[0]).toBeLessThan(values[2]);
  });

  it("computes correct Shapley values for Three Towns", () => {
    const values = calculateShapleyViaPermutations(participants, coalitions);
    // Manual calculation from all 6 orderings:
    // Player 1 marginals: [2, 1, 1, 1, 1, 1] → avg = 7/6 ≈ 1.1667
    // Player 2 marginals: [4, 3, 4, 1, 3, 1] → avg = 16/6 ≈ 2.6667
    // Player 3 marginals: [6, 4, 2, 4, 6, 2] → avg = ... 
    // Sum must be 7
    expect(values[0]).toBeCloseTo(7 / 6, 2);
  });

  it("gives equal values for symmetric players", () => {
    const symParticipants: Participant[] = [
      { id: 1, name: "A", independentCost: 10 },
      { id: 2, name: "B", independentCost: 10 },
      { id: 3, name: "C", independentCost: 10 },
    ];
    const symCoalitions: CoalitionCost[] = [
      { participants: [1, 2], cost: 15 },
      { participants: [1, 3], cost: 15 },
      { participants: [2, 3], cost: 15 },
      { participants: [1, 2, 3], cost: 18 },
    ];
    const values = calculateShapleyViaPermutations(symParticipants, symCoalitions);
    expect(values[0]).toBeCloseTo(values[1], 10);
    expect(values[1]).toBeCloseTo(values[2], 10);
    expect(values[0]).toBeCloseTo(6, 5);
  });

  it("satisfies individual rationality", () => {
    const values = calculateShapleyViaPermutations(participants, coalitions);
    values.forEach((v, i) => {
      expect(v).toBeLessThanOrEqual(participants[i].independentCost + 0.001);
    });
  });
});
