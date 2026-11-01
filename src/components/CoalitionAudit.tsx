import { useMemo, useState } from "react";
import { ShieldCheck, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auditAllocation } from "@/lib/audit";
import type { Participant, CoalitionCost } from "@/lib/calculations";
import { cn } from "@/lib/utils";

export interface AuditMethod {
  key: string;
  label: string;
  /** Tailwind text colour class from the design tokens */
  colorClass: string;
  values: number[];
}

interface CoalitionAuditProps {
  participants: Participant[];
  coalitions: CoalitionCost[];
  methods: AuditMethod[];
  grandCoalitionCost: number;
  highlightedKey: string | null;
  onHighlight: (key: string | null) => void;
  /** Whether the diagram can highlight coalition boundaries (3-player triangle) */
  diagramCanHighlight: boolean;
}

const fmt = (v: number) => v.toFixed(2);

const CoalitionAudit = ({
  participants,
  coalitions,
  methods,
  grandCoalitionCost,
  highlightedKey,
  onHighlight,
  diagramCanHighlight,
}: CoalitionAuditProps) => {
  const [showAll, setShowAll] = useState(participants.length > 3);

  const audits = useMemo(
    () => methods.map(m => ({ method: m, audit: auditAllocation(participants, coalitions, m.values) })),
    [methods, participants, coalitions]
  );
  const checks = audits[0]?.audit.checks ?? [];

  const toggle = (key: string) => onHighlight(highlightedKey === key ? null : key);

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <ShieldCheck className="w-5 h-5 text-interactive" />
          Coalition Audit
        </CardTitle>
        <CardDescription>
          Checks every method against the core conditions (paper eqs. 10–12, p. 478): the budget must balance, nobody
          pays more than going alone, and no group pays more than its own coalition cost.{" "}
          {diagramCanHighlight
            ? "Click a violation to highlight that boundary on the core diagram."
            : "The 3D view shows the allocation simplex only; the core is the region where every constraint below holds."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Stability audit per allocation method</caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="py-2 px-2 text-left font-medium">Method</th>
                <th scope="col" className="py-2 px-2 text-right font-medium">Total allocated</th>
                <th scope="col" className="py-2 px-2 text-right font-medium">Individual-limit violations</th>
                <th scope="col" className="py-2 px-2 text-left font-medium">Worst coalition overcharge</th>
                <th scope="col" className="py-2 px-2 text-left font-medium">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {audits.map(({ method, audit }) => {
                const balanced = Math.abs(audit.budgetGap) <= 1e-6;
                return (
                  <tr key={method.key} className="border-b border-muted">
                    <th scope="row" className={cn("py-2 px-2 text-left font-medium", method.colorClass)}>{method.label}</th>
                    <td className="py-2 px-2 text-right font-mono">
                      {fmt(audit.total)}
                      <span className="block text-[11px] text-muted-foreground">
                        {balanced ? `= c(N) ${fmt(grandCoalitionCost)}` : `off by ${fmt(audit.budgetGap)}`}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-mono">
                      {audit.individualViolations.length === 0
                        ? "0"
                        : `${audit.individualViolations.length} (${audit.individualViolations.map(v => v.label).join(", ")})`}
                    </td>
                    <td className="py-2 px-2">
                      {audit.worst ? (
                        <button
                          type="button"
                          onClick={() => toggle(audit.worst!.key)}
                          aria-pressed={highlightedKey === audit.worst.key}
                          className={cn(
                            "text-left font-mono text-destructive underline decoration-dotted underline-offset-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            highlightedKey === audit.worst.key && "font-bold"
                          )}
                        >
                          +{fmt(audit.worst.overcharge)} on {audit.worst.label}
                          <span className="block text-[11px] text-muted-foreground no-underline">
                            pays {fmt(audit.worst.paid)} &gt; c(S) {fmt(audit.worst.cost)}
                          </span>
                        </button>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      {audit.inCore ? (
                        <span className="inline-flex items-center gap-1 text-interactive font-medium">
                          <ShieldCheck className="w-4 h-4" aria-hidden /> In the core
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-destructive font-medium">
                          <ShieldAlert className="w-4 h-4" aria-hidden /> Not stable
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div>
          <Button variant="outline" size="sm" onClick={() => setShowAll(s => !s)} aria-expanded={showAll} className="gap-2">
            {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showAll ? "Hide" : "Show"} all {checks.length} coalition constraints
          </Button>
          {showAll && (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-xs">
                <caption className="sr-only">Amount each coalition pays under each method versus its coalition cost</caption>
                <thead>
                  <tr className="border-b">
                    <th scope="col" className="py-2 px-2 text-left font-medium">Constraint x(S) ≤ c(S)</th>
                    <th scope="col" className="py-2 px-2 text-right font-medium">c(S)</th>
                    {methods.map(m => (
                      <th key={m.key} scope="col" className={cn("py-2 px-2 text-right font-medium", m.colorClass)}>{m.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {checks.map((check, row) => (
                    <tr
                      key={check.key}
                      className={cn("border-b border-muted", highlightedKey === check.key && "bg-accent/10")}
                    >
                      <th scope="row" className="py-1.5 px-2 text-left font-normal">
                        <button
                          type="button"
                          onClick={() => toggle(check.key)}
                          aria-pressed={highlightedKey === check.key}
                          className="text-left rounded hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className="font-mono">x({check.ids.join("")})</span>{" "}
                          <span className="text-muted-foreground">{check.label}</span>
                        </button>
                      </th>
                      <td className="py-1.5 px-2 text-right font-mono">{fmt(check.cost)}</td>
                      {audits.map(({ method, audit }) => {
                        const c = audit.checks[row];
                        const over = c.overcharge > 1e-6;
                        return (
                          <td
                            key={method.key}
                            className={cn("py-1.5 px-2 text-right font-mono", over ? "text-destructive font-semibold" : "text-muted-foreground")}
                          >
                            {fmt(c.paid)} {over ? "✗" : "✓"}
                            <span className="sr-only">{over ? " violates" : " satisfies"}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CoalitionAudit;
