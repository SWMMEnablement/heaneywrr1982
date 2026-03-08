import { describe, it, expect } from "vitest";
import { calculateAllocations, Participant, CoalitionCost } from "./calculations";

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

const symmetric: { participants: Participant[]; coalitions: CoalitionCost[] } = {
  participants: [
    { id: 1, name: "A", independentCost: 10 },
    { id: 2, name: "B", independentCost: 10 },
    { id: 3, name: "C", independentCost: 10 },
  ],
  coalitions: [
    { participants: [1, 2], cost: 15 },
    { participants: [1, 3], cost: 15 },
    { participants: [2, 3], cost: 15 },
    { participants: [1, 2, 3], cost: 18 },
  ],
};

describe("MCRS Method", () => {
  it("allocations sum to grand coalition cost", () => {
    const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
    const total = result.mcrsAllocations.reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(7, 5);
  });

  it("all values are non-negative", () => {
    const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
    result.mcrsAllocations.forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0);
    });
  });

  it("symmetric players get equal MCRS allocations", () => {
    const result = calculateAllocations(symmetric.participants, symmetric.coalitions);
    expect(result.mcrsAllocations[0]).toBeCloseTo(result.mcrsAllocations[1], 5);
    expect(result.mcrsAllocations[1]).toBeCloseTo(result.mcrsAllocations[2], 5);
  });

  it("does not exceed standalone cost (individual rationality)", () => {
    const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
    result.mcrsAllocations.forEach((v, i) => {
      expect(v).toBeLessThanOrEqual(threeTowns.participants[i].independentCost + 0.01);
    });
  });

  it("symmetric MCRS allocations sum to grand coalition cost", () => {
    const result = calculateAllocations(symmetric.participants, symmetric.coalitions);
    const total = result.mcrsAllocations.reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(18, 5);
  });

  it("minimum costs are at most standalone costs", () => {
    // MCRS minimum marginals should not exceed standalone costs
    const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
    // Each MCRS allocation = minCost + share, and minCost ≤ standaloneCost
    // So MCRS allocation ≤ standaloneCost is guaranteed when remaining savings are non-negative
    result.mcrsAllocations.forEach((v, i) => {
      expect(v).toBeLessThanOrEqual(threeTowns.participants[i].independentCost + 0.01);
    });
  });

  it("handles two-player game", () => {
    const participants: Participant[] = [
      { id: 1, name: "A", independentCost: 10 },
      { id: 2, name: "B", independentCost: 20 },
    ];
    const coalitions: CoalitionCost[] = [
      { participants: [1, 2], cost: 24 },
    ];
    const result = calculateAllocations(participants, coalitions);
    const total = result.mcrsAllocations.reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(24, 5);
  });
});
