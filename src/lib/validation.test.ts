import { describe, it, expect } from "vitest";
import { checkSubadditivity } from "./validation";
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

describe("checkSubadditivity", () => {
  it("returns no violations for the default Three Towns scenario", () => {
    const violations = checkSubadditivity(threeTowns.participants, threeTowns.coalitions);
    expect(violations).toHaveLength(0);
  });

  it("detects violation when c(12) > c(1) + c(2)", () => {
    const coalitions: CoalitionCost[] = [
      { participants: [1, 2], cost: 10 }, // 10 > 2 + 4 = 6
      { participants: [1, 3], cost: 6 },
      { participants: [2, 3], cost: 6 },
      { participants: [1, 2, 3], cost: 7 },
    ];
    const violations = checkSubadditivity(threeTowns.participants, coalitions);
    expect(violations.length).toBeGreaterThan(0);
    const v = violations.find(
      v => v.coalitionS.includes(1) && v.coalitionT.includes(2) && v.coalitionS.length === 1 && v.coalitionT.length === 1
    );
    expect(v).toBeDefined();
    expect(v!.costUnion).toBe(10);
    expect(v!.excess).toBe(4); // 10 - (2+4)
  });

  it("detects violation when grand coalition exceeds sum of sub-coalitions", () => {
    const coalitions: CoalitionCost[] = [
      { participants: [1, 2], cost: 3 },
      { participants: [1, 3], cost: 4 },
      { participants: [2, 3], cost: 5 },
      { participants: [1, 2, 3], cost: 20 }, // 20 > 3 + 6 = 9 ({1,2} + {3})
    ];
    const violations = checkSubadditivity(threeTowns.participants, coalitions);
    expect(violations.length).toBeGreaterThan(0);
  });

  it("returns no violations when all coalitions are subadditive", () => {
    const participants: Participant[] = [
      { id: 1, name: "A", independentCost: 10 },
      { id: 2, name: "B", independentCost: 10 },
    ];
    const coalitions: CoalitionCost[] = [
      { participants: [1, 2], cost: 15 }, // 15 < 10 + 10
    ];
    const violations = checkSubadditivity(participants, coalitions);
    expect(violations).toHaveLength(0);
  });

  it("reports correct excess amount", () => {
    const participants: Participant[] = [
      { id: 1, name: "A", independentCost: 5 },
      { id: 2, name: "B", independentCost: 5 },
    ];
    const coalitions: CoalitionCost[] = [
      { participants: [1, 2], cost: 13 }, // 13 > 5 + 5, excess = 3
    ];
    const violations = checkSubadditivity(participants, coalitions);
    expect(violations).toHaveLength(1);
    expect(violations[0].excess).toBe(3);
  });

  it("handles symmetric scenario with no violations", () => {
    const participants: Participant[] = [
      { id: 1, name: "A", independentCost: 10 },
      { id: 2, name: "B", independentCost: 10 },
      { id: 3, name: "C", independentCost: 10 },
    ];
    const coalitions: CoalitionCost[] = [
      { participants: [1, 2], cost: 15 },
      { participants: [1, 3], cost: 15 },
      { participants: [2, 3], cost: 15 },
      { participants: [1, 2, 3], cost: 18 },
    ];
    const violations = checkSubadditivity(participants, coalitions);
    expect(violations).toHaveLength(0);
  });
});
