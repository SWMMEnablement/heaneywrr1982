import { describe, it, expect } from "vitest";
import { calculateAllocations, Participant, CoalitionCost } from "./calculations";

// Three Towns scenario: Riverside=2, Hilltop=4, Lakeview=6, together=7
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

// Symmetric scenario: all players identical
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

describe("calculateAllocations", () => {
  describe("Grand Coalition & Savings", () => {
    it("correctly identifies the grand coalition cost", () => {
      const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
      expect(result.grandCoalitionCost).toBe(7);
    });

    it("calculates total independent cost", () => {
      const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
      expect(result.totalIndependentCost).toBe(12); // 2+4+6
    });

    it("calculates savings correctly", () => {
      const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
      expect(result.savings).toBe(5); // 12-7
      expect(result.savingsPercent).toBeCloseTo(41.67, 1);
    });
  });

  describe("Separable Costs", () => {
    it("calculates separable costs for Three Towns", () => {
      const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
      // SC_1 = c(123) - c(23) = 7 - 6 = 1
      expect(result.separableCosts[0]).toBe(1);
      // SC_2 = c(123) - c(13) = 7 - 6 = 1
      expect(result.separableCosts[1]).toBe(1);
      // SC_3 = c(123) - c(12) = 7 - 5 = 2
      expect(result.separableCosts[2]).toBe(2);
    });

    it("calculates non-separable cost", () => {
      const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
      // NSC = 7 - (1+1+2) = 3
      expect(result.nonseparableCost).toBe(3);
    });
  });

  describe("SCRB Method", () => {
    it("allocations sum to grand coalition cost", () => {
      const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
      const total = result.scrbAllocations.reduce((a, b) => a + b, 0);
      expect(total).toBeCloseTo(7, 5);
    });

    it("calculates correct SCRB allocations for Three Towns", () => {
      const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
      // RB_1 = max(0, 2-1) = 1, RB_2 = max(0, 4-1) = 3, RB_3 = max(0, 6-2) = 4
      // totalRB = 8, NSC = 3
      // x_1 = 1 + (1/8)*3 = 1.375
      // x_2 = 1 + (3/8)*3 = 2.125
      // x_3 = 2 + (4/8)*3 = 3.5
      expect(result.scrbAllocations[0]).toBeCloseTo(1.375, 3);
      expect(result.scrbAllocations[1]).toBeCloseTo(2.125, 3);
      expect(result.scrbAllocations[2]).toBeCloseTo(3.5, 3);
    });

    it("does not exceed individual standalone costs (individual rationality)", () => {
      const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
      result.scrbAllocations.forEach((alloc, i) => {
        expect(alloc).toBeLessThanOrEqual(threeTowns.participants[i].independentCost);
      });
    });

    it("produces equal NSC shares when all remaining benefits are zero", () => {
      // When standalone cost equals separable cost for all players
      const participants: Participant[] = [
        { id: 1, name: "A", independentCost: 1 },
        { id: 2, name: "B", independentCost: 1 },
        { id: 3, name: "C", independentCost: 2 },
      ];
      const coalitions: CoalitionCost[] = [
        { participants: [1, 2], cost: 5 },
        { participants: [1, 3], cost: 6 },
        { participants: [2, 3], cost: 6 },
        { participants: [1, 2, 3], cost: 7 },
      ];
      const result = calculateAllocations(participants, coalitions);
      // SC = [1,1,2], standalone = [1,1,2], RB = [0,0,0]
      // Falls back to equal NSC split
      const nscShare = result.nonseparableCost / 3;
      expect(result.scrbAllocations[0]).toBeCloseTo(1 + nscShare, 5);
      expect(result.scrbAllocations[1]).toBeCloseTo(1 + nscShare, 5);
      expect(result.scrbAllocations[2]).toBeCloseTo(2 + nscShare, 5);
    });
  });

  describe("Shapley Value", () => {
    it("allocations sum to grand coalition cost", () => {
      const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
      const total = result.shapleyValues.reduce((a, b) => a + b, 0);
      expect(total).toBeCloseTo(7, 1);
    });

    it("symmetric players get equal Shapley values", () => {
      const result = calculateAllocations(symmetric.participants, symmetric.coalitions);
      expect(result.shapleyValues[0]).toBeCloseTo(result.shapleyValues[1], 2);
      expect(result.shapleyValues[1]).toBeCloseTo(result.shapleyValues[2], 2);
    });

    it("Shapley values are non-negative", () => {
      const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
      result.shapleyValues.forEach(v => {
        expect(v).toBeGreaterThanOrEqual(0);
      });
    });

    it("does not exceed standalone cost (individual rationality)", () => {
      const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
      result.shapleyValues.forEach((v, i) => {
        expect(v).toBeLessThanOrEqual(threeTowns.participants[i].independentCost + 0.01);
      });
    });
  });

  describe("Nucleolus", () => {
    it("allocations sum to grand coalition cost", () => {
      const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
      const total = result.nucleolusValues.reduce((a, b) => a + b, 0);
      expect(total).toBeCloseTo(7, 1);
    });

    it("all values are non-negative", () => {
      const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
      result.nucleolusValues.forEach(v => {
        expect(v).toBeGreaterThanOrEqual(0);
      });
    });

    it("symmetric players get equal nucleolus values", () => {
      const result = calculateAllocations(symmetric.participants, symmetric.coalitions);
      expect(result.nucleolusValues[0]).toBeCloseTo(result.nucleolusValues[1], 1);
      expect(result.nucleolusValues[1]).toBeCloseTo(result.nucleolusValues[2], 1);
    });

    it("does not exceed standalone cost (individual rationality)", () => {
      const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
      result.nucleolusValues.forEach((v, i) => {
        expect(v).toBeLessThanOrEqual(threeTowns.participants[i].independentCost + 0.1);
      });
    });

    it("falls back to equal split for non-3-player games", () => {
      const participants: Participant[] = [
        { id: 1, name: "A", independentCost: 10 },
        { id: 2, name: "B", independentCost: 20 },
      ];
      const coalitions: CoalitionCost[] = [
        { participants: [1, 2], cost: 24 },
      ];
      const result = calculateAllocations(participants, coalitions);
      expect(result.nucleolusValues[0]).toBe(12);
      expect(result.nucleolusValues[1]).toBe(12);
    });
  });

  describe("Equal Split", () => {
    it("splits equally among all participants", () => {
      const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
      expect(result.equalSplit[0]).toBeCloseTo(7 / 3, 5);
      expect(result.equalSplit[1]).toBeCloseTo(7 / 3, 5);
      expect(result.equalSplit[2]).toBeCloseTo(7 / 3, 5);
    });
  });

  describe("Cross-method consistency", () => {
    it("all methods sum to the same grand coalition cost", () => {
      const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);
      const methods = [
        result.scrbAllocations,
        result.shapleyValues,
        result.nucleolusValues,
        result.equalSplit,
      ];
      for (const method of methods) {
        const total = method.reduce((a, b) => a + b, 0);
        expect(total).toBeCloseTo(result.grandCoalitionCost, 1);
      }
    });
  });
});
