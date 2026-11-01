import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: vi.fn() } } }));

import { collectFailures } from "./explain-audit";
import { auditAllocation } from "./audit";
import { calculateAllocations } from "./calculations";

// Paper Table 1 four-player game (calculator's 4-player default)
const participants = [
  { id: 1, name: "Purpose 1", independentCost: 2 },
  { id: 2, name: "Purpose 2", independentCost: 4 },
  { id: 3, name: "Purpose 3", independentCost: 6 },
  { id: 4, name: "Purpose 4", independentCost: 8 },
];
const coalitions = [
  { participants: [1, 2], cost: 5 }, { participants: [1, 3], cost: 6 }, { participants: [1, 4], cost: 9 },
  { participants: [2, 3], cost: 6 }, { participants: [2, 4], cost: 10 }, { participants: [3, 4], cost: 10 },
  { participants: [1, 2, 3], cost: 7 }, { participants: [1, 2, 4], cost: 12 }, { participants: [1, 3, 4], cost: 12 },
  { participants: [2, 3, 4], cost: 11 }, { participants: [1, 2, 3, 4], cost: 12 },
];

describe("audit failures sent for explanation", () => {
  const r = calculateAllocations(participants, coalitions);
  const methods = [
    { key: "mcrs", label: "MCRS", values: r.mcrsAllocations },
    { key: "equal", label: "Equal Split", values: r.equalSplit },
  ];
  const audits = methods.map(method => ({ method, audit: auditAllocation(participants, coalitions, method.values) }));
  const failures = collectFailures(participants, audits);

  it("lists only Equal Split's three failed constraints", () => {
    expect(failures.map(f => f.id)).toEqual(["equal:x1", "equal:x12", "equal:x123"]);
  });

  it("passes the computed figures through unchanged", () => {
    const f = failures.find(x => x.id === "equal:x123")!;
    expect([f.paid, f.coalitionCost, f.overcharge]).toEqual([9, 7, 2]);
    expect(r.equalSplit).toEqual([3, 3, 3, 3]);
  });

  it("orders constraints by size, then by participant order", () => {
    const keys = audits[0].audit.checks.map(c => c.key);
    expect(keys.slice(4, 10)).toEqual(["x12", "x13", "x14", "x23", "x24", "x34"]);
  });
});
