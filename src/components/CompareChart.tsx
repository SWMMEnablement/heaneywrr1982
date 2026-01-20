import { motion } from "framer-motion";
import { GitCompare, ArrowRight, ArrowUp, ArrowDown, Minus, TrendingUp, BarChart3, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo } from "react";
type MethodType = 'scrb' | 'shapley' | 'nucleolus' | 'equal';

interface Participant {
  id: number;
  name: string;
  independentCost: number;
}

interface CompareChartProps {
  participants: Participant[];
  scrbAllocations: number[];
  shapleyValues: number[];
  nucleolusValues: number[];
  equalSplit: number[];
  compareMethod1: MethodType;
  compareMethod2: MethodType;
  setCompareMethod1: (method: MethodType) => void;
  setCompareMethod2: (method: MethodType) => void;
}

const methodLabels: Record<MethodType, string> = {
  scrb: 'SCRB',
  shapley: 'Shapley',
  nucleolus: 'Nucleolus',
  equal: 'Equal Split'
};

const methodColors: Record<MethodType, string> = {
  scrb: 'hsl(var(--primary))',
  shapley: 'hsl(var(--interactive))',
  nucleolus: 'hsl(var(--accent))',
  equal: 'hsl(var(--muted-foreground))'
};

const CompareChart = ({
  participants,
  scrbAllocations,
  shapleyValues,
  nucleolusValues,
  equalSplit,
  compareMethod1,
  compareMethod2,
  setCompareMethod1,
  setCompareMethod2,
}: CompareChartProps) => {
  const getMethodValues = (method: MethodType): number[] => {
    switch (method) {
      case 'scrb': return scrbAllocations;
      case 'shapley': return shapleyValues;
      case 'nucleolus': return nucleolusValues;
      case 'equal': return equalSplit;
    }
  };

  const method1Values = getMethodValues(compareMethod1);
  const method2Values = getMethodValues(compareMethod2);
  const differences = participants.map((_, i) => method1Values[i] - method2Values[i]);
  const maxAbsDiff = Math.max(...differences.map(d => Math.abs(d)), 0.01);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const absDifferences = differences.map(d => Math.abs(d));
    const totalVariance = absDifferences.reduce((a, b) => a + b, 0);
    const avgDifference = totalVariance / participants.length;
    const maxDifference = Math.max(...absDifferences);
    
    // Determine which method favors each participant (lower cost = favorable)
    const participantFavorability = participants.map((p, i) => {
      const diff = differences[i];
      if (Math.abs(diff) < 0.01) return { participant: p.name, favoredMethod: 'equal' as const, savings: 0 };
      // Positive diff means method1 is higher, so method2 is favorable
      // Negative diff means method1 is lower, so method1 is favorable
      return {
        participant: p.name,
        favoredMethod: diff > 0 ? compareMethod2 : compareMethod1,
        savings: Math.abs(diff)
      };
    });

    const method1FavorCount = participantFavorability.filter(f => f.favoredMethod === compareMethod1).length;
    const method2FavorCount = participantFavorability.filter(f => f.favoredMethod === compareMethod2).length;
    const equalCount = participantFavorability.filter(f => f.favoredMethod === 'equal').length;

    return {
      totalVariance,
      avgDifference,
      maxDifference,
      participantFavorability,
      method1FavorCount,
      method2FavorCount,
      equalCount
    };
  }, [differences, participants, compareMethod1, compareMethod2]);
  return (
    <div className="space-y-6">
      {/* Method Selectors */}
      <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-lg bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Method A:</span>
          <Select value={compareMethod1} onValueChange={(v: MethodType) => setCompareMethod1(v)}>
            <SelectTrigger className="w-36" style={{ borderColor: methodColors[compareMethod1] }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scrb">SCRB</SelectItem>
              <SelectItem value="shapley">Shapley</SelectItem>
              <SelectItem value="nucleolus">Nucleolus</SelectItem>
              <SelectItem value="equal">Equal Split</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Method B:</span>
          <Select value={compareMethod2} onValueChange={(v: MethodType) => setCompareMethod2(v)}>
            <SelectTrigger className="w-36" style={{ borderColor: methodColors[compareMethod2] }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scrb">SCRB</SelectItem>
              <SelectItem value="shapley">Shapley</SelectItem>
              <SelectItem value="nucleolus">Nucleolus</SelectItem>
              <SelectItem value="equal">Equal Split</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Difference Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={participants.map((p, i) => ({
            name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
            [methodLabels[compareMethod1]]: Number(method1Values[i].toFixed(2)),
            [methodLabels[compareMethod2]]: Number(method2Values[i].toFixed(2)),
            difference: Number(differences[i].toFixed(2)),
          }))}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
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
            }}
          />
          <Legend wrapperStyle={{ paddingTop: 16 }} iconType="circle" iconSize={8} />
          <Bar 
            dataKey={methodLabels[compareMethod1]} 
            fill={methodColors[compareMethod1]} 
            radius={[4, 4, 0, 0]}
            animationDuration={600}
          />
          <Bar 
            dataKey={methodLabels[compareMethod2]} 
            fill={methodColors[compareMethod2]} 
            radius={[4, 4, 0, 0]}
            animationDuration={600}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Difference Analysis Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b border-border">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-interactive" />
            Difference Analysis: {methodLabels[compareMethod1]} vs {methodLabels[compareMethod2]}
          </h4>
        </div>
        <div className="divide-y divide-border">
          {participants.map((p, i) => {
            const diff = differences[i];
            const absDiff = Math.abs(diff);
            const barWidth = maxAbsDiff > 0 ? (absDiff / maxAbsDiff) * 100 : 0;
            
            return (
              <div key={p.id} className="flex items-center gap-4 px-4 py-3">
                <div className="w-28 font-medium text-sm truncate">{p.name}</div>
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-20 text-right text-sm font-mono" style={{ color: methodColors[compareMethod1] }}>
                    {method1Values[i].toFixed(2)}
                  </div>
                  <div className="flex-1 h-6 relative bg-muted/30 rounded overflow-hidden">
                    <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
                    {diff !== 0 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth / 2}%` }}
                        transition={{ duration: 0.5 }}
                        className={`absolute h-full ${diff > 0 ? 'left-1/2 rounded-r' : 'right-1/2 rounded-l'}`}
                        style={{ 
                          backgroundColor: diff > 0 ? 'hsl(var(--destructive) / 0.6)' : 'hsl(var(--interactive) / 0.6)'
                        }}
                      />
                    )}
                  </div>
                  <div className="w-20 text-sm font-mono" style={{ color: methodColors[compareMethod2] }}>
                    {method2Values[i].toFixed(2)}
                  </div>
                </div>
                <div className={`w-24 flex items-center justify-end gap-1 text-sm font-mono ${
                  diff > 0.01 ? 'text-destructive' : diff < -0.01 ? 'text-interactive' : 'text-muted-foreground'
                }`}>
                  {diff > 0.01 ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : diff < -0.01 ? (
                    <ArrowDown className="w-3 h-3" />
                  ) : (
                    <Minus className="w-3 h-3" />
                  )}
                  {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-muted/30 px-4 py-3 flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Total Difference</span>
          <span className={`font-mono font-medium ${
            differences.reduce((a, b) => a + b, 0) > 0.01 
              ? 'text-destructive' 
              : differences.reduce((a, b) => a + b, 0) < -0.01 
                ? 'text-interactive' 
                : 'text-muted-foreground'
          }`}>
            {differences.reduce((a, b) => a + b, 0) > 0 ? '+' : ''}
            {differences.reduce((a, b) => a + b, 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Summary Statistics Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-lg border border-border overflow-hidden"
      >
        <div className="bg-gradient-to-r from-interactive/10 to-accent/10 px-4 py-3 border-b border-border">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            Summary Statistics
          </h4>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Total Variance</div>
            <div className="text-xl font-bold font-mono text-primary">
              {summaryStats.totalVariance.toFixed(2)}
            </div>
          </div>
          <div className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Avg Difference</div>
            <div className="text-xl font-bold font-mono text-interactive">
              {summaryStats.avgDifference.toFixed(2)}
            </div>
          </div>
          <div className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Max Difference</div>
            <div className="text-xl font-bold font-mono text-accent">
              {summaryStats.maxDifference.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Method Favorability Summary */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Method Favorability</span>
            <span className="text-xs text-muted-foreground ml-auto">(Lower cost = More favorable)</span>
          </div>
          
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: methodColors[compareMethod1] }} />
              <span className="text-sm font-medium">{methodLabels[compareMethod1]}</span>
              <span className="text-xs bg-background px-2 py-0.5 rounded-full font-mono">
                {summaryStats.method1FavorCount} participant{summaryStats.method1FavorCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: methodColors[compareMethod2] }} />
              <span className="text-sm font-medium">{methodLabels[compareMethod2]}</span>
              <span className="text-xs bg-background px-2 py-0.5 rounded-full font-mono">
                {summaryStats.method2FavorCount} participant{summaryStats.method2FavorCount !== 1 ? 's' : ''}
              </span>
            </div>
            {summaryStats.equalCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30">
                <Minus className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm">Equal</span>
                <span className="text-xs bg-background px-2 py-0.5 rounded-full font-mono">
                  {summaryStats.equalCount}
                </span>
              </div>
            )}
          </div>

          {/* Per-participant favorability */}
          <div className="space-y-2">
            {summaryStats.participantFavorability.map((pf, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-3 text-sm"
              >
                <span className="w-28 truncate font-medium">{pf.participant}</span>
                <TrendingUp className="w-3 h-3 text-muted-foreground" />
                {pf.favoredMethod === 'equal' ? (
                  <span className="text-muted-foreground italic">No significant difference</span>
                ) : (
                  <>
                    <span 
                      className="font-medium"
                      style={{ color: methodColors[pf.favoredMethod] }}
                    >
                      {methodLabels[pf.favoredMethod]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      saves <span className="font-mono text-interactive">{pf.savings.toFixed(2)}</span>
                    </span>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CompareChart;
