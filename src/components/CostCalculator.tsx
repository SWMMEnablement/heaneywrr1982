import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Users, Coins, TrendingDown, RotateCcw, Info, BarChart3, Layers, LayoutGrid, PieChart as PieChartIcon, Radar as RadarIcon, GitCompare, HelpCircle, BookOpen, SlidersHorizontal, Users2, AlertTriangle } from "lucide-react";
import { calculateAllocations, type Participant, type CoalitionCost } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import CoreVisualization from "./CoreVisualization";
import CompareChart from "./CompareChart";
import OnboardingTour from "./OnboardingTour";
import ExampleBank, { Scenario } from "./ExampleBank";
import ParallelCoordinatesChart from "./ParallelCoordinatesChart";
import TetrahedronVisualization from "./TetrahedronVisualization";
import ActiveLearningChallenges from "./ActiveLearningChallenges";
import FirstTimeExperience from "./FirstTimeExperience";
import ShowStepsPanel from "./ShowStepsPanel";
import CheatSheet from "./CheatSheet";


const CostCalculator = () => {
  const [playerMode, setPlayerMode] = useState<3 | 4>(3);
  
  // Three Towns default values (matches the onboarding story)
  // Riverside=$2M, Hilltop=$4M, Lakeview=$6M, together=$7M
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 1, name: "Riverside", independentCost: 2 },
    { id: 2, name: "Hilltop", independentCost: 4 },
    { id: 3, name: "Lakeview", independentCost: 6 },
  ]);
  
  const [coalitions, setCoalitions] = useState<CoalitionCost[]>([
    { participants: [1, 2], cost: 5 },
    { participants: [1, 3], cost: 6 },
    { participants: [2, 3], cost: 6 },
    { participants: [1, 2, 3], cost: 7 },
  ]);

  const [chartMode, setChartMode] = useState<'grouped' | 'stacked' | 'pie' | 'radar' | 'compare'>('grouped');
  const [compareMethod1, setCompareMethod1] = useState<'scrb' | 'mcrs' | 'shapley' | 'nucleolus' | 'equal'>('scrb');
  const [compareMethod2, setCompareMethod2] = useState<'scrb' | 'mcrs' | 'shapley' | 'nucleolus' | 'equal'>('shapley');
  const [showTour, setShowTour] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showFirstTime, setShowFirstTime] = useState(false);

  // Switch player mode
  const switchPlayerMode = (mode: 3 | 4) => {
    setPlayerMode(mode);
    if (mode === 3) {
      // Reset to Three Towns scenario
      setParticipants([
        { id: 1, name: "Riverside", independentCost: 2 },
        { id: 2, name: "Hilltop", independentCost: 4 },
        { id: 3, name: "Lakeview", independentCost: 6 },
      ]);
      setCoalitions([
        { participants: [1, 2], cost: 5 },
        { participants: [1, 3], cost: 6 },
        { participants: [2, 3], cost: 6 },
        { participants: [1, 2, 3], cost: 7 },
      ]);
    } else {
      setParticipants([
        { id: 1, name: "Participant 1", independentCost: 15 },
        { id: 2, name: "Participant 2", independentCost: 25 },
        { id: 3, name: "Participant 3", independentCost: 20 },
        { id: 4, name: "Participant 4", independentCost: 18 },
      ]);
      setCoalitions([
        { participants: [1, 2], cost: 32 },
        { participants: [1, 3], cost: 28 },
        { participants: [1, 4], cost: 26 },
        { participants: [2, 3], cost: 36 },
        { participants: [2, 4], cost: 34 },
        { participants: [3, 4], cost: 30 },
        { participants: [1, 2, 3], cost: 42 },
        { participants: [1, 2, 4], cost: 40 },
        { participants: [1, 3, 4], cost: 38 },
        { participants: [2, 3, 4], cost: 45 },
        { participants: [1, 2, 3, 4], cost: 50 },
      ]);
    }
  };

  // Check if first visit to show tutorial
  useEffect(() => {
    const hasSeenFirstTime = localStorage.getItem('hasSeenFirstTimeExperience');
    if (!hasSeenFirstTime) {
      setShowFirstTime(true);
    }
  }, []);

  const handleFirstTimeComplete = () => {
    localStorage.setItem('hasSeenFirstTimeExperience', 'true');
    setShowFirstTime(false);
  };

  const handleFirstTimeSkip = () => {
    localStorage.setItem('hasSeenFirstTimeExperience', 'true');
    setShowFirstTime(false);
  };

  const handleTourComplete = () => {
    localStorage.setItem('hasSeenCostCalculatorTour', 'true');
  };

  const handleSelectScenario = (scenario: Scenario) => {
    setParticipants(scenario.participants);
    setCoalitions(scenario.coalitions);
    setShowExamples(false);
  };

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
    // Reset to Three Towns scenario for continuity
    setParticipants([
      { id: 1, name: "Riverside", independentCost: 2 },
      { id: 2, name: "Hilltop", independentCost: 4 },
      { id: 3, name: "Lakeview", independentCost: 6 },
    ]);
    setCoalitions([
      { participants: [1, 2], cost: 5 },
      { participants: [1, 3], cost: 6 },
      { participants: [2, 3], cost: 6 },
      { participants: [1, 2, 3], cost: 7 },
    ]);
  };

  // Calculate cost allocations using extracted pure functions
  const calculations = useMemo(() => calculateAllocations(participants, coalitions), [participants, coalitions]);

  return (
    <section id="calculator" className="py-20 px-6">
      {/* First Time Experience - Soft Gate */}
      {showFirstTime && (
        <FirstTimeExperience 
          onComplete={handleFirstTimeComplete}
          onSkip={handleFirstTimeSkip}
        />
      )}

      <OnboardingTour 
        open={showTour} 
        onOpenChange={setShowTour} 
        onComplete={handleTourComplete}
      />
      
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
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Experiment with different cost scenarios and see how various game theory methods 
            allocate costs among participants in a cooperative project.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant={playerMode === 3 ? 'default' : 'ghost'}
                size="sm"
                onClick={() => switchPlayerMode(3)}
                className="gap-1"
              >
                <Users className="w-4 h-4" />
                3 Players
              </Button>
              <Button
                variant={playerMode === 4 ? 'default' : 'ghost'}
                size="sm"
                onClick={() => switchPlayerMode(4)}
                className="gap-1"
              >
                <Users2 className="w-4 h-4" />
                4 Players
                <Badge variant="outline" className="ml-1 text-[10px] px-1">New</Badge>
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowTour(true)}
              className="gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Take a Tour
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowExamples(!showExamples)}
              className="gap-2"
            >
              <BookOpen className="w-4 h-4" />
              {showExamples ? 'Hide Examples' : 'Example Scenarios'}
            </Button>
            <CheatSheet />
          </div>
        </motion.div>

        {/* Example Bank Panel */}
        <AnimatePresence>
          {showExamples && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 overflow-hidden"
            >
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <ExampleBank onSelectScenario={handleSelectScenario} playerMode={playerMode} />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

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
                  <div className="space-y-4">
                    {participants.map(p => (
                      <div key={p.id} className="space-y-2">
                        <div className="flex items-center gap-3">
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
                        <div className="flex items-center gap-3 pl-2">
                          <SlidersHorizontal className="w-3 h-3 text-muted-foreground shrink-0" />
                          <Slider
                            value={[p.independentCost]}
                            onValueChange={(value) => updateParticipant(p.id, 'independentCost', value[0])}
                            min={0}
                            max={20}
                            step={0.5}
                            className="flex-1"
                          />
                          <span className="text-xs text-muted-foreground w-8 text-right">{p.independentCost}</span>
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
                            <div className="w-2 h-2 rounded-full bg-mcrs" />
                            MCRS
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
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-destructive/10 text-destructive border border-destructive/20 cursor-help">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Approx
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs">
                                  The Nucleolus uses an iterative heuristic approximation (100 iterations, step=0.01) rather than the exact LP-based formulation. Results are reasonable for the default scenario but may be inaccurate for other inputs.
                                </p>
                              </TooltipContent>
                            </Tooltip>
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

        {/* Show Steps Panel - How calculations work */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="mt-8"
        >
          <ShowStepsPanel
            participants={participants}
            coalitions={coalitions}
            calculations={calculations}
          />
        </motion.div>

        {/* Bar Chart Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-8"
        >
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <BarChart3 className="w-5 h-5 text-interactive" />
                  Allocation Comparison Chart
                </CardTitle>
                <CardDescription>
                  Visual comparison of cost allocations across all methods
                </CardDescription>
              </div>
              <div className="flex gap-1 p-1 bg-muted rounded-lg">
                <Button
                  variant={chartMode === 'grouped' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartMode('grouped')}
                  className="h-8 px-3 text-xs"
                >
                  <LayoutGrid className="w-3 h-3 mr-1" />
                  Grouped
                </Button>
                <Button
                  variant={chartMode === 'stacked' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartMode('stacked')}
                  className="h-8 px-3 text-xs"
                >
                  <Layers className="w-3 h-3 mr-1" />
                  Stacked
                </Button>
                <Button
                  variant={chartMode === 'pie' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartMode('pie')}
                  className="h-8 px-3 text-xs"
                >
                  <PieChartIcon className="w-3 h-3 mr-1" />
                  Pie
                </Button>
                <Button
                  variant={chartMode === 'radar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartMode('radar')}
                  className="h-8 px-3 text-xs"
                >
                  <RadarIcon className="w-3 h-3 mr-1" />
                  Radar
                </Button>
                <Button
                  variant={chartMode === 'compare' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartMode('compare')}
                  className="h-8 px-3 text-xs"
                >
                  <GitCompare className="w-3 h-3 mr-1" />
                  Compare
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className={chartMode === 'pie' ? 'h-auto' : 'h-80'}>
                {chartMode === 'grouped' ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={participants.map((p, i) => ({
                        name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
                        SCRB: Number(calculations.scrbAllocations[i].toFixed(2)),
                        Shapley: Number(calculations.shapleyValues[i].toFixed(2)),
                        Nucleolus: Number(calculations.nucleolusValues[i].toFixed(2)),
                        'Equal Split': Number(calculations.equalSplit[i].toFixed(2)),
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                        label={{ 
                          value: 'Cost Allocation', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 }
                        }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
                        itemStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: 20 }}
                        iconType="circle"
                        iconSize={8}
                      />
                      <Bar 
                        dataKey="SCRB" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={800}
                      />
                      <Bar 
                        dataKey="Shapley" 
                        fill="hsl(var(--interactive))" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={800}
                      />
                      <Bar 
                        dataKey="Nucleolus" 
                        fill="hsl(var(--accent))" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={800}
                      />
                      <Bar 
                        dataKey="Equal Split" 
                        fill="hsl(var(--muted-foreground))" 
                        opacity={0.5}
                        radius={[4, 4, 0, 0]}
                        animationDuration={800}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : chartMode === 'stacked' ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={[
                        {
                          name: 'SCRB',
                          ...Object.fromEntries(participants.map((p, i) => [p.name, calculations.scrbAllocations[i]])),
                        },
                        {
                          name: 'Shapley',
                          ...Object.fromEntries(participants.map((p, i) => [p.name, calculations.shapleyValues[i]])),
                        },
                        {
                          name: 'Nucleolus',
                          ...Object.fromEntries(participants.map((p, i) => [p.name, calculations.nucleolusValues[i]])),
                        },
                        {
                          name: 'Equal Split',
                          ...Object.fromEntries(participants.map((p, i) => [p.name, calculations.equalSplit[i]])),
                        },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      barCategoryGap="25%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                        label={{ 
                          value: 'Total Cost', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 }
                        }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
                        itemStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        formatter={(value: number) => value.toFixed(2)}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: 20 }}
                        iconType="circle"
                        iconSize={8}
                      />
                      {participants.map((p, i) => (
                        <Bar 
                          key={p.id}
                          dataKey={p.name} 
                          stackId="a"
                          fill={`hsl(var(--chart-${(i % 5) + 1}))`}
                          animationDuration={800}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                ) : chartMode === 'pie' ? (
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { name: 'SCRB', values: calculations.scrbAllocations, color: 'hsl(var(--primary))' },
                      { name: 'Shapley', values: calculations.shapleyValues, color: 'hsl(var(--interactive))' },
                      { name: 'Nucleolus', values: calculations.nucleolusValues, color: 'hsl(var(--accent))' },
                      { name: 'Equal Split', values: calculations.equalSplit, color: 'hsl(var(--muted-foreground))' },
                    ].map((method) => (
                      <div key={method.name} className="flex flex-col items-center">
                        <h4 className="text-sm font-medium mb-2" style={{ color: method.color }}>{method.name}</h4>
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie
                              data={participants.map((p, i) => ({
                                name: p.name,
                                value: Number(method.values[i].toFixed(2)),
                              }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={65}
                              paddingAngle={2}
                              dataKey="value"
                              animationDuration={800}
                              label={({ name, percent }) => `${name.length > 8 ? name.slice(0, 8) + '…' : name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                            >
                              {participants.map((_, i) => (
                                <Cell 
                                  key={`cell-${i}`} 
                                  fill={`hsl(var(--chart-${(i % 5) + 1}))`}
                                  stroke="hsl(var(--background))"
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              }}
                              formatter={(value: number) => value.toFixed(2)}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <p className="text-xs text-muted-foreground mt-1">
                          Total: {method.values.reduce((a, b) => a + b, 0).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : chartMode === 'radar' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {participants.map((p, i) => {
                      const radarData = [
                        { method: 'SCRB', value: Number(calculations.scrbAllocations[i].toFixed(2)), fullMark: Math.max(...participants.map((_, j) => Math.max(calculations.scrbAllocations[j], calculations.shapleyValues[j], calculations.nucleolusValues[j], calculations.equalSplit[j]))) },
                        { method: 'Shapley', value: Number(calculations.shapleyValues[i].toFixed(2)), fullMark: Math.max(...participants.map((_, j) => Math.max(calculations.scrbAllocations[j], calculations.shapleyValues[j], calculations.nucleolusValues[j], calculations.equalSplit[j]))) },
                        { method: 'Nucleolus', value: Number(calculations.nucleolusValues[i].toFixed(2)), fullMark: Math.max(...participants.map((_, j) => Math.max(calculations.scrbAllocations[j], calculations.shapleyValues[j], calculations.nucleolusValues[j], calculations.equalSplit[j]))) },
                        { method: 'Equal Split', value: Number(calculations.equalSplit[i].toFixed(2)), fullMark: Math.max(...participants.map((_, j) => Math.max(calculations.scrbAllocations[j], calculations.shapleyValues[j], calculations.nucleolusValues[j], calculations.equalSplit[j]))) },
                      ];
                      return (
                        <div key={p.id} className="flex flex-col items-center">
                          <h4 className="text-sm font-medium mb-2" style={{ color: `hsl(var(--chart-${(i % 5) + 1}))` }}>
                            {p.name.length > 15 ? p.name.slice(0, 15) + '…' : p.name}
                          </h4>
                          <ResponsiveContainer width="100%" height={220}>
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                              <PolarGrid stroke="hsl(var(--border))" />
                              <PolarAngleAxis 
                                dataKey="method" 
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                              />
                              <PolarRadiusAxis 
                                angle={30} 
                                domain={[0, 'auto']} 
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                                axisLine={{ stroke: 'hsl(var(--border))' }}
                              />
                              <Radar
                                name={p.name}
                                dataKey="value"
                                stroke={`hsl(var(--chart-${(i % 5) + 1}))`}
                                fill={`hsl(var(--chart-${(i % 5) + 1}))`}
                                fillOpacity={0.4}
                                animationDuration={800}
                              />
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                }}
                                formatter={(value: number) => value.toFixed(2)}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                          <p className="text-xs text-muted-foreground mt-1">
                            Avg: {((calculations.scrbAllocations[i] + calculations.shapleyValues[i] + calculations.nucleolusValues[i] + calculations.equalSplit[i]) / 4).toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <CompareChart
                    participants={participants}
                    scrbAllocations={calculations.scrbAllocations}
                    shapleyValues={calculations.shapleyValues}
                    nucleolusValues={calculations.nucleolusValues}
                    equalSplit={calculations.equalSplit}
                    compareMethod1={compareMethod1}
                    compareMethod2={compareMethod2}
                    setCompareMethod1={setCompareMethod1}
                    setCompareMethod2={setCompareMethod2}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

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

        {/* Active Learning Challenges */}
        {playerMode === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8"
          >
            <ActiveLearningChallenges
              scrbAllocations={calculations.scrbAllocations}
              shapleyValues={calculations.shapleyValues}
              nucleolusValues={calculations.nucleolusValues}
              participantNames={participants.map(p => p.name)}
              grandCoalitionCost={calculations.grandCoalitionCost}
            />
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CostCalculator;
