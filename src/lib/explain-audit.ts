import { supabase } from "@/integrations/supabase/client";
import type { Participant, CoalitionCost } from "./calculations";
import type { AllocationAudit } from "./audit";
import { getCoalitionCost } from "./steps-helpers";

export interface AuditFailure {
  id: string;
  method: string;
  coalition: string;
  members: { name: string; pays: number; standaloneCost: number }[];
  coalitionCost: number;
  paid: number;
  overcharge: number;
}

const r2 = (v: number) => Math.round(v * 100) / 100;

/** Collect every failed constraint from already-computed audits. Numbers are passed through, never recalculated. */
export function collectFailures(
  participants: Participant[],
  audits: { method: { key: string; label: string; values: number[] }; audit: AllocationAudit }[]
): AuditFailure[] {
  const failures: AuditFailure[] = [];
  for (const { method, audit } of audits) {
    for (const c of audit.checks) {
      if (c.overcharge <= 1e-6) continue;
      failures.push({
        id: `${method.key}:${c.key}`,
        method: method.label,
        coalition: c.label,
        members: c.ids.map(id => {
          const i = participants.findIndex(p => p.id === id);
          return { name: participants[i].name || `P${id}`, pays: r2(method.values[i]), standaloneCost: r2(participants[i].independentCost) };
        }),
        coalitionCost: r2(c.cost),
        paid: r2(c.paid),
        overcharge: r2(c.overcharge),
      });
    }
  }
  return failures;
}

export async function requestExplanations(
  participants: Participant[],
  coalitions: CoalitionCost[],
  grandCoalitionCost: number,
  failures: AuditFailure[]
): Promise<Record<string, string>> {
  const n = participants.length;
  const coalitionCosts: { members: string; cost: number }[] = [];
  for (let mask = 1; mask < (1 << n) - 1; mask++) {
    const idx = participants.filter((_, i) => mask & (1 << i));
    if (idx.length < 2) continue;
    coalitionCosts.push({
      members: idx.map(p => p.name).join(" + "),
      cost: r2(getCoalitionCost(idx.map(p => p.id), participants, coalitions)),
    });
  }

  const { data, error } = await supabase.functions.invoke("explain-audit", {
    body: {
      grandCoalitionCost: r2(grandCoalitionCost),
      participants: participants.map(p => ({ name: p.name, standaloneCost: r2(p.independentCost) })),
      coalitionCosts,
      failures,
    },
  });

  if (error) {
    let message = "Lovable AI could not explain these results right now.";
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const body = await ctx.json();
        if (body?.error) message = body.error;
      } catch { /* keep default */ }
    }
    throw new Error(message);
  }
  const out: Record<string, string> = {};
  for (const e of (data?.explanations ?? []) as { id: string; text: string }[]) out[e.id] = e.text;
  return out;
}
