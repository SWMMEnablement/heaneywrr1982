import { useMemo } from "react";
import { motion } from "framer-motion";
import { Triangle, Target, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CoreVisualizationProps {
  participants: { id: number; name: string; independentCost: number }[];
  coalitions: { participants: number[]; cost: number }[];
  scrbAllocations: number[];
  shapleyValues: number[];
  grandCoalitionCost: number;
}

const CoreVisualization = ({
  participants,
  coalitions,
  scrbAllocations,
  shapleyValues,
  grandCoalitionCost,
}: CoreVisualizationProps) => {
  // SVG dimensions
  const width = 400;
  const height = 360;
  const padding = 40;
  
  // Triangle vertices (equilateral triangle)
  const triangleHeight = height - padding * 2;
  const triangleWidth = triangleHeight * (2 / Math.sqrt(3));
  const centerX = width / 2;
  
  const vertices = {
    A: { x: centerX, y: padding }, // Top (Player 1)
    B: { x: centerX - triangleWidth / 2, y: padding + triangleHeight }, // Bottom left (Player 2)
    C: { x: centerX + triangleWidth / 2, y: padding + triangleHeight }, // Bottom right (Player 3)
  };

  // Convert barycentric coordinates to Cartesian
  const barycentricToCartesian = (coords: number[]) => {
    const [a, b, c] = coords;
    return {
      x: a * vertices.A.x + b * vertices.B.x + c * vertices.C.x,
      y: a * vertices.A.y + b * vertices.B.y + c * vertices.C.y,
    };
  };

  // Normalize allocations to barycentric coordinates
  const allocationToBarycentric = (allocation: number[]) => {
    const total = allocation.reduce((sum, v) => sum + v, 0);
    if (total === 0) return [1/3, 1/3, 1/3];
    return allocation.map(v => v / total);
  };

  // Calculate core constraints
  const coreConstraints = useMemo(() => {
    const n = participants.length;
    if (n !== 3) return { vertices: [], isFeasible: false };

    const c1 = participants[0].independentCost;
    const c2 = participants[1].independentCost;
    const c3 = participants[2].independentCost;
    
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

    const C = grandCoalitionCost;

    // Core constraints for a 3-player cost game:
    // x1 <= c1, x2 <= c2, x3 <= c3 (individual rationality)
    // x1 + x2 <= c12, x1 + x3 <= c13, x2 + x3 <= c23 (coalition rationality)
    // x1 + x2 + x3 = C (efficiency)

    // Define constraint half-planes in the simplex
    // We'll compute the core polygon by intersecting these constraints
    
    const constraints = [
      { type: 'individual', player: 1, bound: c1 },
      { type: 'individual', player: 2, bound: c2 },
      { type: 'individual', player: 3, bound: c3 },
      { type: 'coalition', players: [1, 2], bound: c12 },
      { type: 'coalition', players: [1, 3], bound: c13 },
      { type: 'coalition', players: [2, 3], bound: c23 },
    ];

    // Generate core polygon vertices using constraint intersection
    // For visualization, we'll sample the feasible region
    const coreVertices: number[][] = [];
    const step = 0.02;
    
    for (let x1 = 0; x1 <= C; x1 += step * C) {
      for (let x2 = 0; x2 <= C - x1; x2 += step * C) {
        const x3 = C - x1 - x2;
        if (x3 < 0) continue;
        
        // Check all constraints
        if (x1 > c1 + 0.001) continue;
        if (x2 > c2 + 0.001) continue;
        if (x3 > c3 + 0.001) continue;
        if (x1 + x2 > c12 + 0.001) continue;
        if (x1 + x3 > c13 + 0.001) continue;
        if (x2 + x3 > c23 + 0.001) continue;
        
        coreVertices.push([x1, x2, x3]);
      }
    }

    // Compute convex hull of feasible points for polygon
    const points = coreVertices.map(v => {
      const bary = allocationToBarycentric(v);
      return barycentricToCartesian(bary);
    });

    // Simple convex hull using gift wrapping
    const computeConvexHull = (pts: { x: number; y: number }[]) => {
      if (pts.length < 3) return pts;
      
      const sorted = [...pts].sort((a, b) => a.x - b.x || a.y - b.y);
      const cross = (o: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) =>
        (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
      
      const lower: { x: number; y: number }[] = [];
      for (const p of sorted) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
          lower.pop();
        }
        lower.push(p);
      }
      
      const upper: { x: number; y: number }[] = [];
      for (let i = sorted.length - 1; i >= 0; i--) {
        const p = sorted[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
          upper.pop();
        }
        upper.push(p);
      }
      
      lower.pop();
      upper.pop();
      return [...lower, ...upper];
    };

    const hull = computeConvexHull(points);
    
    return {
      vertices: hull,
      isFeasible: hull.length >= 3,
      constraints,
    };
  }, [participants, coalitions, grandCoalitionCost]);

  // Calculate positions for allocation methods
  const scrbPoint = useMemo(() => {
    const bary = allocationToBarycentric(scrbAllocations);
    return barycentricToCartesian(bary);
  }, [scrbAllocations]);

  const shapleyPoint = useMemo(() => {
    const bary = allocationToBarycentric(shapleyValues);
    return barycentricToCartesian(bary);
  }, [shapleyValues]);

  // Equal split point (centroid)
  const centroid = barycentricToCartesian([1/3, 1/3, 1/3]);

  // Generate grid lines for the simplex
  const gridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const divisions = 5;
    
    for (let i = 1; i < divisions; i++) {
      const t = i / divisions;
      
      // Lines parallel to each side
      // Parallel to BC (bottom)
      const p1a = { x: vertices.A.x + t * (vertices.B.x - vertices.A.x), y: vertices.A.y + t * (vertices.B.y - vertices.A.y) };
      const p1b = { x: vertices.A.x + t * (vertices.C.x - vertices.A.x), y: vertices.A.y + t * (vertices.C.y - vertices.A.y) };
      lines.push({ x1: p1a.x, y1: p1a.y, x2: p1b.x, y2: p1b.y });
      
      // Parallel to AC (right)
      const p2a = { x: vertices.B.x + t * (vertices.A.x - vertices.B.x), y: vertices.B.y + t * (vertices.A.y - vertices.B.y) };
      const p2b = { x: vertices.B.x + t * (vertices.C.x - vertices.B.x), y: vertices.B.y + t * (vertices.C.y - vertices.B.y) };
      lines.push({ x1: p2a.x, y1: p2a.y, x2: p2b.x, y2: p2b.y });
      
      // Parallel to AB (left)
      const p3a = { x: vertices.C.x + t * (vertices.A.x - vertices.C.x), y: vertices.C.y + t * (vertices.A.y - vertices.C.y) };
      const p3b = { x: vertices.C.x + t * (vertices.B.x - vertices.C.x), y: vertices.C.y + t * (vertices.B.y - vertices.C.y) };
      lines.push({ x1: p3a.x, y1: p3a.y, x2: p3b.x, y2: p3b.y });
    }
    
    return lines;
  }, [vertices]);

  // Create core polygon path
  const corePath = useMemo(() => {
    if (coreConstraints.vertices.length < 3) return '';
    const v = coreConstraints.vertices;
    return `M ${v[0].x} ${v[0].y} ${v.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')} Z`;
  }, [coreConstraints.vertices]);

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Triangle className="w-5 h-5 text-accent" />
          The Core Visualization
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>The shaded region represents the Core - all stable allocations where no coalition has an incentive to defect.</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
        <CardDescription>
          Triangular coordinate plot showing feasible allocation space
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <svg width={width} height={height} className="overflow-visible">
            {/* Definitions */}
            <defs>
              <linearGradient id="coreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--interactive))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Grid lines */}
            <g className="stroke-muted/30" strokeWidth="0.5">
              {gridLines.map((line, i) => (
                <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
              ))}
            </g>

            {/* Main triangle (simplex) */}
            <motion.polygon
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              points={`${vertices.A.x},${vertices.A.y} ${vertices.B.x},${vertices.B.y} ${vertices.C.x},${vertices.C.y}`}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />

            {/* Core region */}
            {coreConstraints.isFeasible && (
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                d={corePath}
                fill="url(#coreGradient)"
                stroke="hsl(var(--interactive))"
                strokeWidth="2"
                strokeLinejoin="round"
                filter="url(#glow)"
              />
            )}

            {/* Vertex labels */}
            <g className="text-xs font-medium fill-primary">
              <text x={vertices.A.x} y={vertices.A.y - 12} textAnchor="middle" className="font-serif text-sm">
                {participants[0]?.name || 'P1'}
              </text>
              <text x={vertices.B.x - 12} y={vertices.B.y + 16} textAnchor="middle" className="font-serif text-sm">
                {participants[1]?.name || 'P2'}
              </text>
              <text x={vertices.C.x + 12} y={vertices.C.y + 16} textAnchor="middle" className="font-serif text-sm">
                {participants[2]?.name || 'P3'}
              </text>
            </g>

            {/* Centroid (equal split) */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <circle
                cx={centroid.x}
                cy={centroid.y}
                r="4"
                fill="hsl(var(--muted-foreground))"
                opacity="0.5"
              />
            </motion.g>

            {/* SCRB allocation point */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
            >
              <circle
                cx={scrbPoint.x}
                cy={scrbPoint.y}
                r="8"
                fill="hsl(var(--primary))"
                stroke="white"
                strokeWidth="2"
                filter="url(#glow)"
              />
              <text
                x={scrbPoint.x}
                y={scrbPoint.y - 14}
                textAnchor="middle"
                className="text-xs font-medium fill-primary"
              >
                SCRB
              </text>
            </motion.g>

            {/* Shapley allocation point */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
            >
              <circle
                cx={shapleyPoint.x}
                cy={shapleyPoint.y}
                r="8"
                fill="hsl(var(--interactive))"
                stroke="white"
                strokeWidth="2"
                filter="url(#glow)"
              />
              <text
                x={shapleyPoint.x}
                y={shapleyPoint.y + 20}
                textAnchor="middle"
                className="text-xs font-medium fill-interactive"
              >
                Shapley
              </text>
            </motion.g>

            {/* Axis labels showing percentage */}
            <g className="text-[10px] fill-muted-foreground font-mono">
              <text x={centerX} y={height - 8} textAnchor="middle">Cost share proportions</text>
            </g>
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-interactive bg-interactive/20" />
            <span className="text-muted-foreground">Core Region</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">SCRB Method</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-interactive" />
            <span className="text-muted-foreground">Shapley Value</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground/50" />
            <span className="text-muted-foreground">Equal Split</span>
          </div>
        </div>

        {/* Core status */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-interactive" />
            <span className="text-sm font-medium">
              {coreConstraints.isFeasible 
                ? "Core exists — stable allocations available"
                : "Core may be empty — check constraint feasibility"
              }
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Points inside the shaded region satisfy all individual and coalition rationality constraints.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoreVisualization;
