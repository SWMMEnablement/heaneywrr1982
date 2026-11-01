import { describe, it, expect } from "vitest";
import { calculateAllocations } from "./calculations";
import { auditAllocation, validateGameInputs } from "./audit";
import { parseScenario, serializeScenario } from "./scenario-io";

// Default Three Towns scenario shipped in the calculator
const participants = [
  { id: 1, name: "Riverside", independentCost: 2 },
  { id: 2, name: "Hilltop", independentCost: 4 },
  { id: 3, name: "Lakeview", independentCost: 6 },
];
const coalitions = [
  { participants: [1, 2], cost: 5 },
  { participants: [1, 3], cost: 6 },
  { participants: [2, 3], cost: 6 },
  { participants: [1, 2, 3], cost: 7 },
];

describe("deployment check: default scenario results", () => {
  const r = calculateAllocations(participants, coalitions);

  it("MCRS is (1.43, 2.29, 3.29)", () => {
    expect(r.mcrsAllocations.map(v => v.toFixed(2))).toEqual(["1.43", "2.29", "3.29"]);
  });

  it("nucleolus is (1.50, 2.25, 3.25)", () => {
    expect(r.nucleolusValues.map(v => v.toFixed(2))).toEqual(["1.50", "2.25", "3.25"]);
  });

  it("MCRS keeps Hilltop + Lakeview at or below c(23) = 6", () => {
    expect(r.mcrsAllocations[1] + r.mcrsAllocations[2]).toBeLessThanOrEqual(6 + 1e-9);
  });

  it("MCRS and nucleolus pass the full coalition audit", () => {
    expect(auditAllocation(participants, coalitions, r.mcrsAllocations).inCore).toBe(true);
    expect(auditAllocation(participants, coalitions, r.nucleolusValues).inCore).toBe(true);
  });
});

describe("input validation", () => {
  it("rejects a negative grand-coalition cost", () => {
    const bad = coalitions.map(c => (c.participants.length === 3 ? { ...c, cost: -1 } : c));
    expect(validateGameInputs(participants, bad).map(i => i.field)).toEqual(["c(123)"]);
  });

  it("rejects non-finite costs", () => {
    const bad = [{ ...participants[0], independentCost: NaN }, ...participants.slice(1)];
    expect(validateGameInputs(bad, coalitions)).toHaveLength(1);
    const inf = coalitions.map((c, i) => (i === 0 ? { ...c, cost: Infinity } : c));
    expect(validateGameInputs(participants, inf)).toHaveLength(1);
  });

  it("accepts the default scenario", () => {
    expect(validateGameInputs(participants, coalitions)).toEqual([]);
  });
});

describe("coalition audit", () => {
  it("flags the old published MCRS (0.83, 1.67, 4.50) as overcharging Hilltop + Lakeview", () => {
    const a = auditAllocation(participants, coalitions, [0.83, 1.67, 4.5]);
    expect(a.worst?.ids).toEqual([2, 3]);
    expect(a.worst?.overcharge).toBeCloseTo(0.17, 6);
    expect(a.inCore).toBe(false);
  });

  it("counts individual-limit violations separately", () => {
    const a = auditAllocation(participants, coalitions, [3, 2, 2]);
    expect(a.individualViolations.map(v => v.ids)).toEqual([[1]]);
  });

  it("reports budget imbalance", () => {
    expect(auditAllocation(participants, coalitions, [1, 2, 3]).budgetGap).toBeCloseTo(-1, 9);
  });
});

describe("scenario export / import", () => {
  it("round-trips a scenario", () => {
    const s = { playerMode: 3 as const, participants, coalitions };
    expect(parseScenario(serializeScenario(s))).toEqual(s);
  });

  it("rejects files that are not scenarios", () => {
    expect(() => parseScenario("{}")).toThrow(/not a cost-allocation scenario/);
    expect(() => parseScenario("nope")).toThrow(/not valid JSON/);
  });
});
