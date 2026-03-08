import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Eye, EyeOff, Calculator, ArrowRight, Plus, Equal, Divide } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { GlossaryTermLink } from "./Glossary";
import { permutations, getCoalitionCost, getMarginalContribution } from "@/lib/steps-helpers";

interface Participant {
  id: number;
  name: string;
  independentCost: number;
}

interface CoalitionCost {
  participants: number[];
  cost: number;
}

interface ShowStepsPanelProps {
  participants: Participant[];
  coalitions: CoalitionCost[];
  calculations: {
    separableCosts: number[];
    nonseparableCost: number;
    scrbAllocations: number[];
    shapleyValues: number[];
    nucleolusValues: number[];
    grandCoalitionCost: number;
  };
}

const ShowStepsPanel = ({ participants, coalitions, calculations }: ShowStepsPanelProps) => {
  const [showSteps, setShowSteps] = useState(false);
  const [openMethod, setOpenMethod] = useState<string | null>(null);

  const n = participants.length;
  const allOrders = permutations(participants.map(p => p.id));

  // Calculate Shapley value step by step
  const shapleySteps = participants.map(p => {
    const contributions: { order: number[]; before: number[]; marginal: number }[] = [];
    
    for (const order of allOrders) {
      const playerIndex = order.indexOf(p.id);
      const before = order.slice(0, playerIndex);
      const marginal = getMarginalContribution(p.id, before, participants, coalitions);
      contributions.push({ order, before, marginal });
    }
    
    const average = contributions.reduce((sum, c) => sum + c.marginal, 0) / contributions.length;
    
    return {
      participant: p,
      contributions,
      average,
    };
  });

  // SCRB steps
  const scrbSteps = participants.map((p, i) => {
    const separable = calculations.separableCosts[i];
    const remainingBenefit = Math.max(0, p.independentCost - separable);
    const totalRemaining = participants.reduce((sum, pp, j) => 
      sum + Math.max(0, pp.independentCost - calculations.separableCosts[j]), 0
    );
    const share = totalRemaining > 0 
      ? (remainingBenefit / totalRemaining) * calculations.nonseparableCost 
      : calculations.nonseparableCost / n;
    
    return {
      participant: p,
      separable,
      remainingBenefit,
      totalRemaining,
      share,
      final: separable + share,
    };
  });

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-serif text-base">
            <Calculator className="w-4 h-4 text-interactive" />
            How Are These Calculated?
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSteps(!showSteps)}
            className="gap-2"
          >
            {showSteps ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showSteps ? "Hide Steps" : "Show Steps"}
          </Button>
        </div>
      </CardHeader>

      <AnimatePresence>
        {showSteps && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="pt-0 space-y-4">
              {/* Shapley Value */}
              <Collapsible open={openMethod === 'shapley'} onOpenChange={() => setOpenMethod(openMethod === 'shapley' ? null : 'shapley')}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-interactive/10 border border-interactive/20 hover:bg-interactive/15 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-interactive" />
                      <span className="font-medium">Shapley Value</span>
                      <Badge variant="secondary" className="text-xs">All {allOrders.length} orderings</Badge>
                    </div>
                    {openMethod === 'shapley' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-3 p-4 rounded-lg bg-muted/50 border border-border space-y-4">
                    <p className="text-sm text-muted-foreground">
                      The <GlossaryTermLink term="Shapley Value">Shapley Value</GlossaryTermLink> calculates each player's{" "}
                      <span className="text-foreground font-medium">average <GlossaryTermLink term="Marginal Contribution">marginal contribution</GlossaryTermLink></span> across 
                      all possible orderings. Think of it as: "What do you add to the <GlossaryTermLink term="Coalition">coalition</GlossaryTermLink> when you join?"
                    </p>
                    
                    {shapleySteps.map((step, i) => (
                      <div key={step.participant.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{step.participant.name}</span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono font-bold text-interactive">{step.average.toFixed(2)}</span>
                        </div>
                        
                        <div className="pl-4 space-y-1 max-h-40 overflow-y-auto">
                          {step.contributions.map((c, j) => (
                            <div key={j} className="flex items-center gap-2 text-xs font-mono">
                              <span className="text-muted-foreground w-24">
                                Order: [{c.order.join(', ')}]
                              </span>
                              <span className="text-muted-foreground">→</span>
                              <span className="w-16">
                                {c.before.length === 0 ? 'First' : `After {${c.before.join(',')}}`}
                              </span>
                              <span className="text-muted-foreground">=</span>
                              <span className={c.marginal >= 0 ? 'text-foreground' : 'text-destructive'}>
                                {c.marginal.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="pl-4 pt-1 border-t border-dashed border-border">
                          <span className="text-xs text-muted-foreground">
                            Average: ({step.contributions.map(c => c.marginal.toFixed(1)).join(' + ')}) ÷ {step.contributions.length} = {" "}
                            <span className="font-bold text-interactive">{step.average.toFixed(2)}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* SCRB Method */}
              <Collapsible open={openMethod === 'scrb'} onOpenChange={() => setOpenMethod(openMethod === 'scrb' ? null : 'scrb')}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="font-medium">SCRB Method</span>
                      <Badge variant="secondary" className="text-xs">2-part formula</Badge>
                    </div>
                    {openMethod === 'scrb' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-3 p-4 rounded-lg bg-muted/50 border border-border space-y-4">
                    <p className="text-sm text-muted-foreground">
                      <GlossaryTermLink term="SCRB Method">SCRB</GlossaryTermLink> splits the cost into two parts:{" "}
                      <span className="text-foreground font-medium"><GlossaryTermLink term="Separable Cost">separable costs</GlossaryTermLink></span> (what you uniquely bring) 
                      and a <span className="text-foreground font-medium">fair share of joint benefits</span>.
                    </p>

                    <div className="p-3 rounded-lg bg-background border border-border">
                      <p className="text-xs font-medium mb-2">Formula:</p>
                      <p className="font-mono text-sm">
                        x<sub>i</sub> = SC<sub>i</sub> + (RB<sub>i</sub> / ΣRB) × NSC
                      </p>
                      <div className="mt-2 text-xs text-muted-foreground space-y-1">
                        <p>• SC<sub>i</sub> = Separable Cost = c(N) - c(N-{'{i}'})</p>
                        <p>• RB<sub>i</sub> = Remaining Benefit = max(0, c(i) - SC<sub>i</sub>)</p>
                        <p>• NSC = Non-Separable Cost = c(N) - ΣSC = {calculations.nonseparableCost.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    {scrbSteps.map((step) => (
                      <div key={step.participant.id} className="space-y-2 p-3 rounded-lg bg-background/50">
                        <p className="font-medium">{step.participant.name}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">c({step.participant.id}) alone:</span>
                            <span className="font-mono ml-2">{step.participant.independentCost}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Separable cost:</span>
                            <span className="font-mono ml-2">{step.separable.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Remaining benefit:</span>
                            <span className="font-mono ml-2">{step.remainingBenefit.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">NSC share:</span>
                            <span className="font-mono ml-2">{step.share.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm pt-1 border-t border-dashed border-border">
                          <span className="font-mono">{step.separable.toFixed(2)}</span>
                          <Plus className="w-3 h-3" />
                          <span className="font-mono">{step.share.toFixed(2)}</span>
                          <Equal className="w-3 h-3" />
                          <span className="font-mono font-bold text-primary">{step.final.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Nucleolus */}
              <Collapsible open={openMethod === 'nucleolus'} onOpenChange={() => setOpenMethod(openMethod === 'nucleolus' ? null : 'nucleolus')}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/15 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-accent" />
                      <span className="font-medium">Nucleolus</span>
                      <Badge variant="secondary" className="text-xs">Iterative optimization</Badge>
                    </div>
                    {openMethod === 'nucleolus' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-3 p-4 rounded-lg bg-muted/50 border border-border space-y-4">
                    <p className="text-sm text-muted-foreground">
                      The <GlossaryTermLink term="Nucleolus">Nucleolus</GlossaryTermLink> finds the allocation that{" "}
                      <span className="text-foreground font-medium">minimizes the maximum unhappiness</span> of any <GlossaryTermLink term="Coalition">coalition</GlossaryTermLink>. 
                      It asks: "What's the fairest way to make the angriest group as happy as possible?"
                    </p>

                    <div className="p-3 rounded-lg bg-background border border-border space-y-2">
                      <p className="text-xs font-medium">
                        Key Concept: <GlossaryTermLink term="Excess">Excess</GlossaryTermLink> (unhappiness)
                      </p>
                      <p className="font-mono text-sm">
                        e(S) = c(S) - Σx<sub>i</sub> for i ∈ S
                      </p>
                      <p className="text-xs text-muted-foreground">
                        If e(S) is negative, <GlossaryTermLink term="Coalition">coalition</GlossaryTermLink> S is paying MORE than they would alone — they're unhappy! 
                        This violates <GlossaryTermLink term="Coalition Rationality">coalition rationality</GlossaryTermLink>.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">The Algorithm:</p>
                      <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Start with equal split: {calculations.grandCoalitionCost.toFixed(2)} ÷ {n} = {(calculations.grandCoalitionCost / n).toFixed(2)} each</li>
                        <li>Calculate excess for each coalition</li>
                        <li>Find the most unhappy coalition (most negative excess)</li>
                        <li>Adjust allocations to reduce their unhappiness</li>
                        <li>Repeat until no coalition can be made happier without making another angrier</li>
                      </ol>
                    </div>

                    <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                      <p className="text-sm font-medium mb-2">Result:</p>
                      <div className="flex flex-wrap gap-3">
                        {participants.map((p, i) => (
                          <div key={p.id} className="flex items-center gap-2">
                            <span className="text-sm">{p.name}:</span>
                            <span className="font-mono font-bold text-accent">{calculations.nucleolusValues[i].toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ShowStepsPanel;
