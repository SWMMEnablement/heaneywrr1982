import { describe, it, expect } from "vitest";
import { computeCorePolygon } from "./core-geometry";
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

describe("computeCorePolygon", () => {
  it("Three Towns core is the Fig. 2 quadrilateral", () => {
    const { status, vertices } = computeCorePolygon(
      threeTowns.participants,
      threeTowns.coalitions,
      7
    );
    expect(status).toBe("exists");
    expect(vertices).toHaveLength(4);
    // Expected corners (x1, x2, x3): (1,1,5), (2,1,4), (2,3,2), (1,4,2)
    const asKeys = vertices.map(v => v.map(x => Math.round(x * 1000) / 1000).join(","));
    expect(asKeys).toContain("1,1,5");
    expect(asKeys).toContain("2,1,4");
    expect(asKeys).toContain("2,3,2");
    expect(asKeys).toContain("1,4,2");
  });

  it("every vertex satisfies all core constraints", () => {
    const { vertices } = computeCorePolygon(threeTowns.participants, threeTowns.coalitions, 7);
    for (const [x1, x2, x3] of vertices) {
      expect(x1).toBeLessThanOrEqual(2 + 1e-9);
      expect(x2).toBeLessThanOrEqual(4 + 1e-9);
      expect(x3).toBeLessThanOrEqual(6 + 1e-9);
      expect(x1 + x2).toBeLessThanOrEqual(5 + 1e-9);
      expect(x1 + x3).toBeLessThanOrEqual(6 + 1e-9);
      expect(x2 + x3).toBeLessThanOrEqual(6 + 1e-9);
      expect(x1 + x2 + x3).toBeCloseTo(7, 6);
    }
  });

  it("reports a point core as degenerate, not empty", () => {
    // The p. 480 game with relaxed costs (θ = 1/19) has a point core
    const participants: Participant[] = [
      { id: 1, name: "P1", independentCost: 4 },
      { id: 2, name: "P2", independentCost: 4 },
      { id: 3, name: "P3", independentCost: 5 },
    ];
    const coalitions: CoalitionCost[] = [
      { participants: [1, 2], cost: 5.26 },
      { participants: [1, 3], cost: 8.42 },
      { participants: [2, 3], cost: 6.32 },
      { participants: [1, 2, 3], cost: 10 },
    ];
    const { status, vertices } = computeCorePolygon(participants, coalitions, 10);
    expect(status).toBe("degenerate");
    expect(vertices.length).toBeGreaterThan(0);
    // The point is approximately (3.68, 1.58, 4.74)
    const [x1, x2, x3] = vertices[0];
    expect(x1).toBeCloseTo(3.68, 1);
    expect(x2).toBeCloseTo(1.58, 1);
    expect(x3).toBeCloseTo(4.74, 1);
  });

  it("reports the p. 480 unrelaxed game as empty", () => {
    const participants: Participant[] = [
      { id: 1, name: "P1", independentCost: 4 },
      { id: 2, name: "P2", independentCost: 4 },
      { id: 3, name: "P3", independentCost: 5 },
    ];
    const coalitions: CoalitionCost[] = [
      { participants: [1, 2], cost: 5 },
      { participants: [1, 3], cost: 8 },
      { participants: [2, 3], cost: 6 },
      { participants: [1, 2, 3], cost: 10 },
    ];
    const { status, vertices } = computeCorePolygon(participants, coalitions, 10);
    expect(status).toBe("empty");
    expect(vertices).toHaveLength(0);
  });

  it("is id-agnostic (same game, ids 17/27/37)", () => {
    const { status, vertices } = computeCorePolygon(
      [
        { id: 17, name: "A", independentCost: 2 },
        { id: 27, name: "B", independentCost: 4 },
        { id: 37, name: "C", independentCost: 6 },
      ],
      [
        { participants: [17, 27], cost: 5 },
        { participants: [17, 37], cost: 6 },
        { participants: [27, 37], cost: 6 },
        { participants: [17, 27, 37], cost: 7 },
      ],
      7
    );
    expect(status).toBe("exists");
    expect(vertices).toHaveLength(4);
  });

  it("returns empty for non-3-player games", () => {
    const { status } = computeCorePolygon(
      [
        { id: 1, name: "A", independentCost: 2 },
        { id: 2, name: "B", independentCost: 4 },
      ],
      [{ participants: [1, 2], cost: 5 }],
      5
    );
    expect(status).toBe("empty");
  });
});
