import { describe, it, expect } from "vitest";
import { calculateAllocations, Participant, CoalitionCost } from "./calculations";

/**
 * Pins every worked example printed in Heaney & Dickinson (1982),
 * "Methods for Apportioning the Cost of a Water Resource Project",
 * WRR 18(3) 476–482, so the engine can never drift from the paper again.
 */

// p. 479 — three-city game: c = (2,4,6), pairs (5,6,6), c(123) = 7
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

// p. 481 Table 1 — four-person game
const fourPerson: { participants: Participant[]; coalitions: CoalitionCost[] } = {
  participants: [
    { id: 1, name: "P1", independentCost: 2 },
    { id: 2, name: "P2", independentCost: 4 },
    { id: 3, name: "P3", independentCost: 6 },
    { id: 4, name: "P4", independentCost: 8 },
  ],
  coalitions: [
    { participants: [1, 2], cost: 5 },
    { participants: [1, 3], cost: 6 },
    { participants: [1, 4], cost: 9 },
    { participants: [2, 3], cost: 6 },
    { participants: [2, 4], cost: 10 },
    { participants: [3, 4], cost: 10 },
    { participants: [1, 2, 3], cost: 7 },
    { participants: [1, 2, 4], cost: 12 },
    { participants: [1, 3, 4], cost: 12 },
    { participants: [2, 3, 4], cost: 11 },
    { participants: [1, 2, 3, 4], cost: 12 },
  ],
};

// p. 480 — game with an empty core: c = (4,4,5), pairs (5,8,6), c(123) = 10
const emptyCore: { participants: Participant[]; coalitions: CoalitionCost[] } = {
  participants: [
    { id: 1, name: "P1", independentCost: 4 },
    { id: 2, name: "P2", independentCost: 4 },
    { id: 3, name: "P3", independentCost: 5 },
  ],
  coalitions: [
    { participants: [1, 2], cost: 5 },
    { participants: [1, 3], cost: 8 },
    { participants: [2, 3], cost: 6 },
    { participants: [1, 2, 3], cost: 10 },
  ],
};

// p. 478 — two-person game: c(1)=2, c(2)=4, c(12)=5
const twoPerson: { participants: Participant[]; coalitions: CoalitionCost[] } = {
  participants: [
    { id: 1, name: "P1", independentCost: 2 },
    { id: 2, name: "P2", independentCost: 4 },
  ],
  coalitions: [{ participants: [1, 2], cost: 5 }],
};

describe("Paper p. 479 — Three Towns", () => {
  const result = calculateAllocations(threeTowns.participants, threeTowns.coalitions);

  it("SCRB = (1 3/8, 2 1/8, 3 1/2)", () => {
    expect(result.scrbAllocations[0]).toBeCloseTo(1.375, 5);
    expect(result.scrbAllocations[1]).toBeCloseTo(2.125, 5);
    expect(result.scrbAllocations[2]).toBeCloseTo(3.5, 5);
  });

  it("Shapley = (1 1/6, 2 1/6, 3 2/3)", () => {
    expect(result.shapleyValues[0]).toBeCloseTo(7 / 6, 4);
    expect(result.shapleyValues[1]).toBeCloseTo(13 / 6, 4);
    expect(result.shapleyValues[2]).toBeCloseTo(11 / 3, 4);
  });

  it("MCRS core bounds are 1≤x1≤2, 1≤x2≤4, 2≤x3≤5", () => {
    expect(result.mcrsLowerBounds[0]).toBeCloseTo(1, 5);
    expect(result.mcrsUpperBounds[0]).toBeCloseTo(2, 5);
    expect(result.mcrsLowerBounds[1]).toBeCloseTo(1, 5);
    expect(result.mcrsUpperBounds[1]).toBeCloseTo(4, 5);
    expect(result.mcrsLowerBounds[2]).toBeCloseTo(2, 5);
    expect(result.mcrsUpperBounds[2]).toBeCloseTo(5, 5);
  });

  it("MCRS = (1 3/7, 2 2/7, 3 2/7)", () => {
    expect(result.mcrsAllocations[0]).toBeCloseTo(1 + 3 / 7, 4);
    expect(result.mcrsAllocations[1]).toBeCloseTo(2 + 2 / 7, 4);
    expect(result.mcrsAllocations[2]).toBeCloseTo(3 + 2 / 7, 4);
  });

  it("Nucleolus = (1 1/2, 2 1/4, 3 1/4)", () => {
    expect(result.nucleolusValues[0]).toBeCloseTo(1.5, 3);
    expect(result.nucleolusValues[1]).toBeCloseTo(2.25, 3);
    expect(result.nucleolusValues[2]).toBeCloseTo(3.25, 3);
  });

  it("core exists (no relaxation)", () => {
    expect(result.coreEmpty).toBe(false);
    expect(result.coreRelaxationTheta).toBe(0);
  });

  it("MCRS allocation lies in the core", () => {
    const [x1, x2, x3] = result.mcrsAllocations;
    expect(x1).toBeLessThanOrEqual(2 + 1e-6);
    expect(x2).toBeLessThanOrEqual(4 + 1e-6);
    expect(x3).toBeLessThanOrEqual(6 + 1e-6);
    expect(x1 + x2).toBeLessThanOrEqual(5 + 1e-6);
    expect(x1 + x3).toBeLessThanOrEqual(6 + 1e-6);
    expect(x2 + x3).toBeLessThanOrEqual(6 + 1e-6);
  });
});

describe("Paper p. 481 Table 1 — four-person game", () => {
  const result = calculateAllocations(fourPerson.participants, fourPerson.coalitions);

  it("MCRS lower bounds = (1, 0, 0, 5)", () => {
    expect(result.mcrsLowerBounds[0]).toBeCloseTo(1, 4);
    expect(result.mcrsLowerBounds[1]).toBeCloseTo(0, 4);
    expect(result.mcrsLowerBounds[2]).toBeCloseTo(0, 4);
    expect(result.mcrsLowerBounds[3]).toBeCloseTo(5, 4);
  });

  it("MCRS upper bounds = (2, 4, 5, 8)", () => {
    expect(result.mcrsUpperBounds[0]).toBeCloseTo(2, 4);
    expect(result.mcrsUpperBounds[1]).toBeCloseTo(4, 4);
    expect(result.mcrsUpperBounds[2]).toBeCloseTo(5, 4);
    expect(result.mcrsUpperBounds[3]).toBeCloseTo(8, 4);
  });

  it("MCRS solution = (1.46, 1.84, 2.31, 6.39) — exactly (19, 24, 30, 83)/13", () => {
    expect(result.mcrsAllocations[0]).toBeCloseTo(19 / 13, 4);
    expect(result.mcrsAllocations[1]).toBeCloseTo(24 / 13, 4);
    expect(result.mcrsAllocations[2]).toBeCloseTo(30 / 13, 4);
    expect(result.mcrsAllocations[3]).toBeCloseTo(83 / 13, 4);
  });

  it("all methods sum to c(N) = 12", () => {
    for (const m of [
      result.scrbAllocations,
      result.mcrsAllocations,
      result.shapleyValues,
      result.nucleolusValues,
      result.equalSplit,
    ]) {
      expect(m.reduce((a, b) => a + b, 0)).toBeCloseTo(12, 4);
    }
  });
});

describe("Paper p. 480 — empty-core game", () => {
  const result = calculateAllocations(emptyCore.participants, emptyCore.coalitions);

  it("detects the empty core", () => {
    expect(result.coreEmpty).toBe(true);
  });

  it("finds θ = 1/19 ≈ 0.0526", () => {
    expect(result.coreRelaxationTheta).toBeCloseTo(1 / 19, 3);
  });

  it("MCRS = point core (3.68, 1.58, 4.74)", () => {
    expect(result.mcrsAllocations[0]).toBeCloseTo(3.68, 2);
    expect(result.mcrsAllocations[1]).toBeCloseTo(1.58, 2);
    expect(result.mcrsAllocations[2]).toBeCloseTo(4.74, 2);
  });
});

describe("Paper p. 478 — two-person game", () => {
  const result = calculateAllocations(twoPerson.participants, twoPerson.coalitions);

  it("core bounds are 1≤x1≤2 and 3≤x2≤4", () => {
    expect(result.mcrsLowerBounds[0]).toBeCloseTo(1, 5);
    expect(result.mcrsUpperBounds[0]).toBeCloseTo(2, 5);
    expect(result.mcrsLowerBounds[1]).toBeCloseTo(3, 5);
    expect(result.mcrsUpperBounds[1]).toBeCloseTo(4, 5);
  });

  it("MCRS splits the nonseparable cost evenly: (1.5, 3.5)", () => {
    expect(result.mcrsAllocations[0]).toBeCloseTo(1.5, 5);
    expect(result.mcrsAllocations[1]).toBeCloseTo(3.5, 5);
  });
});

describe("Id-agnostic lookups", () => {
  it("same game with ids 17/27/37 gives identical results", () => {
    const rekeyed = calculateAllocations(
      [
        { id: 17, name: "Riverside", independentCost: 2 },
        { id: 27, name: "Hilltop", independentCost: 4 },
        { id: 37, name: "Lakeview", independentCost: 6 },
      ],
      [
        { participants: [17, 27], cost: 5 },
        { participants: [17, 37], cost: 6 },
        { participants: [27, 37], cost: 6 },
        { participants: [17, 27, 37], cost: 7 },
      ]
    );
    expect(rekeyed.mcrsAllocations[0]).toBeCloseTo(1 + 3 / 7, 4);
    expect(rekeyed.nucleolusValues[0]).toBeCloseTo(1.5, 3);
    expect(rekeyed.shapleyValues[2]).toBeCloseTo(11 / 3, 4);
  });
});

describe("Missing coalition data", () => {
  it("missing coalition falls back to no-cooperation cost, not zero", () => {
    // Drop c(2,3); it should be treated as 4+6=10, making c(123)=7 attractive
    const partial = calculateAllocations(
      threeTowns.participants,
      [
        { participants: [1, 2], cost: 5 },
        { participants: [1, 3], cost: 6 },
        { participants: [1, 2, 3], cost: 7 },
      ]
    );
    // Separable cost of player 1 = c(123) − c(23) = 7 − 10 = −3 (not 7 − 0 = 7)
    expect(partial.separableCosts[0]).toBeCloseTo(-3, 5);
  });
});
