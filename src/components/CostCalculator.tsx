import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Users, Coins, TrendingDown, RotateCcw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import CoreVisualization from "./CoreVisualization";
interface Participant {
  id: number;
  name: string;
  independentCost: number;
}

interface CoalitionCost {
  participants: number[];
  cost: number;
}

const CostCalculator = () => {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 1, name: "Participant 1", independentCost: 2 },
    { id: 2, name: "Participant 2", independentCost: 4 },
    { id: 3, name: "Participant 3", independentCost: 6 },
  ]);
  
  const [coalitions, setCoalitions] = useState<CoalitionCost[]>([
    { participants: [1, 2], cost: 5 },
    { participants: [1, 3], cost: 6 },
    { participants: [2, 3], cost: 6 },
    { participants: [1, 2, 3], cost: 7 },
  ]);

  const updateParticipant = (id: number, field: keyof Participant, value: string | number) => {
    setParticipants(prev => 
      prev.map(p => p.id === id ? { ...p, [field]: field === 'independentCost' ? Number(value) : value } : p)
    );
  };

  const updateCoalition = (index: number, cost: number) => {
    setCoalitions(prev => 
      prev.map((c, i) => i === index ? { ...c, cost } : c)
    );
  };

  const resetToDefault = () => {
    setParticipants([
      { id: 1, name: "Participant 1", independentCost: 2 },
      { id: 2, name: "Participant 2", independentCost: 4 },
      { id: 3, name: "Participant 3", independentCost: 6 },
    ]);
    setCoalitions([
      { participants: [1, 2], cost: 5 },
      { participants: [1, 3], cost: 6 },
      { participants: [2, 3], cost: 6 },
      { participants: [1, 2, 3], cost: 7 },
    ]);
  };

  // Calculate cost allocations using different methods
  const calculations = useMemo(() => {
    const n = participants.length;
    const grandCoalitionCost = coalitions.find(c => c.participants.length === n)?.cost ?? 0;
    
    // Separable costs: c(N) - c(N - {i})
    const separableCosts = participants.map(p => {
      const withoutParticipant = coalitions.find(
        c => c.participants.length === n - 1 && !c.participants.includes(p.id)
      );
      return grandCoalitionCost - (withoutParticipant?.cost ?? 0);
    });

    // SCRB Method
    const totalSeparable = separableCosts.reduce((a, b) => a + b, 0);
    const nonseparableCost = grandCoalitionCost - totalSeparable;
    
    const remainingBenefits = participants.map((p, i) => 
      Math.max(0, p.independentCost - separableCosts[i])
    );
    const totalRemainingBenefits = remainingBenefits.reduce((a, b) => a + b, 0);
    
    const scrbAllocations = participants.map((_, i) => {
      const share = totalRemainingBenefits > 0 
        ? (remainingBenefits[i] / totalRemainingBenefits) * nonseparableCost 
        : nonseparableCost / n;
      return separableCosts[i] + share;
    });

    // Shapley Value (simplified for 3 players)
    const shapleyValues = participants.map((p) => {
      let value = 0;
      // All possible orderings weight
      const c1 = p.independentCost; // First in ordering
      const c2coalitions = coalitions.filter(c => c.participants.length === 2 && c.participants.includes(p.id));
      const c2avg = c2coalitions.reduce((sum, c) => {
        const otherCost = participants.find(op => c.participants.includes(op.id) && op.id !== p.id)?.independentCost ?? 0;
        return sum + (c.cost - otherCost);
      }, 0) / Math.max(1, c2coalitions.length);
      
      const withoutP = coalitions.find(c => c.participants.length === n - 1 && !c.participants.includes(p.id))?.cost ?? 0;
      const c3 = grandCoalitionCost - withoutP;
      
      value = (c1 + c2avg + c3) / 3;
      return value;
    });

    // Nucleolus calculation (for 3 players)
    const nucleolusValues = (() => {
      if (n !== 3) return [grandCoalitionCost / 3, grandCoalitionCost / 3, grandCoalitionCost / 3];

      const c1 = participants[0].independentCost;
      const c2 = participants[1].independentCost;
      const c3 = participants[2].independentCost;
      const C = grandCoalitionCost;

      const c12 = coalitions.find(c => 
        c.participants.length === 2 && 
        c.participants.includes(1) && 
        c.participants.includes(2)
      )?.cost ?? c1 + c2;
      
      const c13 = coalitions.find(c => 
        c.participants.length === 2 && 
        c.participants.includes(1) && 
        c.participants.includes(3)
      )?.cost ?? c1 + c3;
      
      const c23 = coalitions.find(c => 
        c.participants.length === 2 && 
        c.participants.includes(2) && 
        c.participants.includes(3)
      )?.cost ?? c2 + c3;

      // Iterative approach to find nucleolus
      let x1 = C / 3;
      let x2 = C / 3;
      let x3 = C / 3;

      const iterations = 100;
      const step = 0.01;

      for (let iter = 0; iter < iterations; iter++) {
        const excesses = [
          { type: 'x1', value: c1 - x1 },
          { type: 'x2', value: c2 - x2 },
          { type: 'x3', value: c3 - x3 },
          { type: 'x12', value: c12 - x1 - x2 },
          { type: 'x13', value: c13 - x1 - x3 },
          { type: 'x23', value: c23 - x2 - x3 },
        ];

        const minExcess = Math.min(...excesses.map(e => e.value));
        const tightConstraints = excesses.filter(e => Math.abs(e.value - minExcess) < step * 2);

        let dx1 = 0, dx2 = 0, dx3 = 0;
        
        for (const tc of tightConstraints) {
          switch (tc.type) {
            case 'x1': dx1 -= step; break;
            case 'x2': dx2 -= step; break;
            case 'x3': dx3 -= step; break;
            case 'x12': dx1 -= step / 2; dx2 -= step / 2; break;
            case 'x13': dx1 -= step / 2; dx3 -= step / 2; break;
            case 'x23': dx2 -= step / 2; dx3 -= step / 2; break;
          }
        }

        const total = dx1 + dx2 + dx3;
        dx1 -= total / 3;
        dx2 -= total / 3;
        dx3 -= total / 3;

        x1 += dx1;
        x2 += dx2;
        x3 += dx3;

        const sum = x1 + x2 + x3;
        x1 = x1 * C / sum;
        x2 = x2 * C / sum;
        x3 = x3 * C / sum;

        x1 = Math.max(0, x1);
        x2 = Math.max(0, x2);
        x3 = Math.max(0, x3);
      }

      return [x1, x2, x3];
    })();

    // Equal split
    const equalSplit = participants.map(() => grandCoalitionCost / n);

    // Total savings
    const totalIndependentCost = participants.reduce((sum, p) => sum + p.independentCost, 0);
    const savings = totalIndependentCost - grandCoalitionCost;
    const savingsPercent = (savings / totalIndependentCost) * 100;

    return {
      separableCosts,
      nonseparableCost,
      scrbAllocations,
      shapleyValues,
      nucleolusValues,
      equalSplit,
      grandCoalitionCost,
      totalIndependentCost,
      savings,
      savingsPercent,
    };
  }, [participants, coalitions]);

  return (
    <section id="calculator" className="py-20 px-6">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-interactive/10 text-interactive text-sm font-medium mb-4">
            <Calculator className="w-4 h-4" />
            Interactive Tool
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
            Cost Allocation Calculator
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experiment with different cost scenarios and see how various game theory methods 
            allocate costs among participants in a cooperative project.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="card-elevated h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <Users className="w-5 h-5 text-interactive" />
                    Input Parameters
                  </CardTitle>
                  <CardDescription>
                    Define costs for individual participants and coalitions
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={resetToDefault}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Individual Costs */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    Individual Costs c(i)
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Cost if each participant acts independently</p>
                      </TooltipContent>
                    </Tooltip>
                  </h4>
                  <div className="space-y-3">
                    {participants.map(p => (
                      <div key={p.id} className="flex items-center gap-3">
                        <Input
                          value={p.name}
                          onChange={(e) => updateParticipant(p.id, 'name', e.target.value)}
                          className="flex-1"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">c({p.id}) =</span>
                          <Input
                            type="number"
                            value={p.independentCost}
                            onChange={(e) => updateParticipant(p.id, 'independentCost', e.target.value)}
                            className="w-20"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coalition Costs */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    Coalition Costs c(S)
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Cost when participants form coalitions</p>
                      </TooltipContent>
                    </Tooltip>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {coalitions.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground font-mono">
                          c({c.participants.join('')}) =
                        </span>
                        <Input
                          type="number"
                          value={c.cost}
                          onChange={(e) => updateCoalition(i, Number(e.target.value))}
                          className="w-20"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="card-elevated h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Coins className="w-5 h-5 text-accent" />
                  Cost Allocations
                </CardTitle>
                <CardDescription>
                  Comparing all four allocation methods side by side
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Savings Summary */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-interactive/10 to-accent/10 border border-interactive/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-interactive" />
                      <span className="font-medium">Coalition Savings</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-interactive">
                        {calculations.savings.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {calculations.savingsPercent.toFixed(1)}% reduction
                      </div>
                    </div>
                  </div>
                </div>

                {/* Allocation Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-2 text-left font-medium">Participant</th>
                        <th className="py-3 px-2 text-right font-medium">
                          <span className="inline-flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            SCRB
                          </span>
                        </th>
                        <th className="py-3 px-2 text-right font-medium">
                          <span className="inline-flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-interactive" />
                            Shapley
                          </span>
                        </th>
                        <th className="py-3 px-2 text-right font-medium">
                          <span className="inline-flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-accent" />
                            Nucleolus
                          </span>
                        </th>
                        <th className="py-3 px-2 text-right font-medium">
                          <span className="inline-flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                            Equal
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence mode="popLayout">
                        {participants.map((p, i) => (
                          <motion.tr
                            key={p.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="border-b border-muted"
                          >
                            <td className="py-3 px-2 font-medium">{p.name}</td>
                            <td className="py-3 px-2 text-right font-mono font-medium text-primary">
                              {calculations.scrbAllocations[i].toFixed(2)}
                            </td>
                            <td className="py-3 px-2 text-right font-mono font-medium text-interactive">
                              {calculations.shapleyValues[i].toFixed(2)}
                            </td>
                            <td className="py-3 px-2 text-right font-mono font-medium text-accent">
                              {calculations.nucleolusValues[i].toFixed(2)}
                            </td>
                            <td className="py-3 px-2 text-right font-mono text-muted-foreground">
                              {calculations.equalSplit[i].toFixed(2)}
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                      <tr className="font-bold bg-muted/30">
                        <td className="py-3 px-2">Total</td>
                        <td className="py-3 px-2 text-right font-mono text-primary">
                          {calculations.scrbAllocations.reduce((a, b) => a + b, 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-interactive">
                          {calculations.shapleyValues.reduce((a, b) => a + b, 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-accent">
                          {calculations.nucleolusValues.reduce((a, b) => a + b, 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-muted-foreground">
                          {calculations.equalSplit.reduce((a, b) => a + b, 0).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Method Descriptions */}
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/5">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />
                    <div>
                      <span className="font-medium text-primary">SCRB</span>
                      <p>Separable costs + proportional remaining benefits share</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-interactive/5">
                    <div className="w-2 h-2 rounded-full bg-interactive mt-1 shrink-0" />
                    <div>
                      <span className="font-medium text-interactive">Shapley</span>
                      <p>Average marginal contribution across all orderings</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-accent/5">
                    <div className="w-2 h-2 rounded-full bg-accent mt-1 shrink-0" />
                    <div>
                      <span className="font-medium text-accent">Nucleolus</span>
                      <p>Minimizes maximum coalition dissatisfaction</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 mt-1 shrink-0" />
                    <div>
                      <span className="font-medium text-muted-foreground">Equal Split</span>
                      <p>Simple equal division of total cost</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Core Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <CoreVisualization
            participants={participants}
            coalitions={coalitions}
            scrbAllocations={calculations.scrbAllocations}
            shapleyValues={calculations.shapleyValues}
            grandCoalitionCost={calculations.grandCoalitionCost}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default CostCalculator;
