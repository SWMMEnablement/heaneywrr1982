import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Triangle, Target, Info, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface HoveredPoint {
  type: 'scrb' | 'shapley' | 'centroid' | 'nucleolus';
  x: number;
  y: number;
}

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
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null);
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

  // Calculate Nucleolus - minimizes the maximum excess of any coalition
  const nucleolusValues = useMemo(() => {
    const n = participants.length;
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

    // For a 3-player cost game, we can compute the nucleolus analytically
    // The nucleolus minimizes the maximum excess e(S,x) = c(S) - x(S)
    // Using an iterative approach to find the lexicographically minimal excess vector
    
    // Start from the centroid of the core or equal split
    let x1 = C / 3;
    let x2 = C / 3;
    let x3 = C / 3;

    // Iterative refinement - move towards the center of the core
    const iterations = 100;
    const step = 0.01;

    for (let iter = 0; iter < iterations; iter++) {
      // Calculate excesses for each constraint
      const excesses = [
        { type: 'x1', value: c1 - x1 },
        { type: 'x2', value: c2 - x2 },
        { type: 'x3', value: c3 - x3 },
        { type: 'x12', value: c12 - x1 - x2 },
        { type: 'x13', value: c13 - x1 - x3 },
        { type: 'x23', value: c23 - x2 - x3 },
      ];

      // Find the minimum excess (most violated constraint)
      const minExcess = Math.min(...excesses.map(e => e.value));
      const tightConstraints = excesses.filter(e => Math.abs(e.value - minExcess) < step * 2);

      // Adjust allocation to balance tight constraints
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

      // Normalize to maintain efficiency (sum = C)
      const total = dx1 + dx2 + dx3;
      dx1 -= total / 3;
      dx2 -= total / 3;
      dx3 -= total / 3;

      x1 += dx1;
      x2 += dx2;
      x3 += dx3;

      // Project back to simplex
      const sum = x1 + x2 + x3;
      x1 = x1 * C / sum;
      x2 = x2 * C / sum;
      x3 = x3 * C / sum;

      // Ensure non-negativity
      x1 = Math.max(0, x1);
      x2 = Math.max(0, x2);
      x3 = Math.max(0, x3);
    }

    return [x1, x2, x3];
  }, [participants, coalitions, grandCoalitionCost]);

  const nucleolusPoint = useMemo(() => {
    const bary = allocationToBarycentric(nucleolusValues);
    return barycentricToCartesian(bary);
  }, [nucleolusValues]);

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

  // Calculate constraint boundary lines
  const constraintLines = useMemo(() => {
    const C = grandCoalitionCost;
    if (C === 0) return [];

    const c1 = participants[0]?.independentCost ?? 0;
    const c2 = participants[1]?.independentCost ?? 0;
    const c3 = participants[2]?.independentCost ?? 0;
    
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

    const lines: { 
      x1: number; y1: number; x2: number; y2: number; 
      label: string; 
      type: 'individual' | 'coalition';
      color: string;
    }[] = [];

    // Helper to get line endpoints for a constraint on the simplex
    // For x_i = bound, we need to find where this intersects the simplex (x1 + x2 + x3 = C)
    
    // Individual constraint x1 = c1 (line parallel to edge BC)
    if (c1 < C && c1 > 0) {
      const x1 = c1;
      // x2 ranges from 0 to C - c1, x3 = C - c1 - x2
      const p1 = allocationToBarycentric([x1, 0, C - x1]);
      const p2 = allocationToBarycentric([x1, C - x1, 0]);
      const pt1 = barycentricToCartesian(p1);
      const pt2 = barycentricToCartesian(p2);
      lines.push({ ...pt1, x2: pt2.x, y2: pt2.y, x1: pt1.x, y1: pt1.y, label: `x₁ ≤ ${c1}`, type: 'individual', color: 'hsl(var(--chart-1))' });
    }

    // Individual constraint x2 = c2 (line parallel to edge AC)
    if (c2 < C && c2 > 0) {
      const x2 = c2;
      const p1 = allocationToBarycentric([0, x2, C - x2]);
      const p2 = allocationToBarycentric([C - x2, x2, 0]);
      const pt1 = barycentricToCartesian(p1);
      const pt2 = barycentricToCartesian(p2);
      lines.push({ ...pt1, x2: pt2.x, y2: pt2.y, x1: pt1.x, y1: pt1.y, label: `x₂ ≤ ${c2}`, type: 'individual', color: 'hsl(var(--chart-2))' });
    }

    // Individual constraint x3 = c3 (line parallel to edge AB)
    if (c3 < C && c3 > 0) {
      const x3 = c3;
      const p1 = allocationToBarycentric([0, C - x3, x3]);
      const p2 = allocationToBarycentric([C - x3, 0, x3]);
      const pt1 = barycentricToCartesian(p1);
      const pt2 = barycentricToCartesian(p2);
      lines.push({ ...pt1, x2: pt2.x, y2: pt2.y, x1: pt1.x, y1: pt1.y, label: `x₃ ≤ ${c3}`, type: 'individual', color: 'hsl(var(--chart-3))' });
    }

    // Coalition constraint x1 + x2 = c12 → x3 = C - c12
    if (c12 < C && C - c12 > 0) {
      const x3 = C - c12;
      const p1 = allocationToBarycentric([0, C - x3, x3]);
      const p2 = allocationToBarycentric([C - x3, 0, x3]);
      const pt1 = barycentricToCartesian(p1);
      const pt2 = barycentricToCartesian(p2);
      lines.push({ ...pt1, x2: pt2.x, y2: pt2.y, x1: pt1.x, y1: pt1.y, label: `x₁+x₂ ≤ ${c12}`, type: 'coalition', color: 'hsl(var(--chart-4))' });
    }

    // Coalition constraint x1 + x3 = c13 → x2 = C - c13
    if (c13 < C && C - c13 > 0) {
      const x2 = C - c13;
      const p1 = allocationToBarycentric([0, x2, C - x2]);
      const p2 = allocationToBarycentric([C - x2, x2, 0]);
      const pt1 = barycentricToCartesian(p1);
      const pt2 = barycentricToCartesian(p2);
      lines.push({ ...pt1, x2: pt2.x, y2: pt2.y, x1: pt1.x, y1: pt1.y, label: `x₁+x₃ ≤ ${c13}`, type: 'coalition', color: 'hsl(var(--chart-5))' });
    }

    // Coalition constraint x2 + x3 = c23 → x1 = C - c23
    if (c23 < C && C - c23 > 0) {
      const x1 = C - c23;
      const p1 = allocationToBarycentric([x1, 0, C - x1]);
      const p2 = allocationToBarycentric([x1, C - x1, 0]);
      const pt1 = barycentricToCartesian(p1);
      const pt2 = barycentricToCartesian(p2);
      lines.push({ ...pt1, x2: pt2.x, y2: pt2.y, x1: pt1.x, y1: pt1.y, label: `x₂+x₃ ≤ ${c23}`, type: 'coalition', color: 'hsl(var(--accent))' });
    }

    return lines;
  }, [participants, coalitions, grandCoalitionCost, allocationToBarycentric, barycentricToCartesian]);

  // State for showing constraint labels
  const [showConstraints, setShowConstraints] = useState(true);

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

            {/* Constraint boundary lines */}
            {showConstraints && constraintLines.map((line, i) => (
              <motion.g
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              >
                <line
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={line.color}
                  strokeWidth="1.5"
                  strokeDasharray={line.type === 'individual' ? "4 2" : "8 4"}
                  opacity="0.7"
                />
                {/* Label at midpoint */}
                <text
                  x={(line.x1 + line.x2) / 2 + (i % 2 === 0 ? 8 : -8)}
                  y={(line.y1 + line.y2) / 2 + (i < 3 ? -6 : 12)}
                  textAnchor="middle"
                  className="text-[9px] font-mono"
                  fill={line.color}
                  opacity="0.9"
                >
                  {line.label}
                </text>
              </motion.g>
            ))}

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
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint({ type: 'centroid', x: centroid.x, y: centroid.y })}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle
                cx={centroid.x}
                cy={centroid.y}
                r={hoveredPoint?.type === 'centroid' ? 8 : 5}
                fill="hsl(var(--muted-foreground))"
                opacity={hoveredPoint?.type === 'centroid' ? 0.8 : 0.5}
                className="transition-all duration-200"
              />
            </motion.g>

            {/* SCRB allocation point */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint({ type: 'scrb', x: scrbPoint.x, y: scrbPoint.y })}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle
                cx={scrbPoint.x}
                cy={scrbPoint.y}
                r={hoveredPoint?.type === 'scrb' ? 10 : 8}
                fill="hsl(var(--primary))"
                stroke="white"
                strokeWidth="2"
                filter="url(#glow)"
                className="transition-all duration-200"
              />
              <text
                x={scrbPoint.x}
                y={scrbPoint.y - 14}
                textAnchor="middle"
                className="text-xs font-medium fill-primary pointer-events-none"
              >
                SCRB
              </text>
            </motion.g>

            {/* Shapley allocation point */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint({ type: 'shapley', x: shapleyPoint.x, y: shapleyPoint.y })}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle
                cx={shapleyPoint.x}
                cy={shapleyPoint.y}
                r={hoveredPoint?.type === 'shapley' ? 10 : 8}
                fill="hsl(var(--interactive))"
                stroke="white"
                strokeWidth="2"
                filter="url(#glow)"
                className="transition-all duration-200"
              />
              <text
                x={shapleyPoint.x}
                y={shapleyPoint.y + 20}
                textAnchor="middle"
                className="text-xs font-medium fill-interactive pointer-events-none"
              >
                Shapley
              </text>
            </motion.g>

            {/* Nucleolus allocation point */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring" }}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint({ type: 'nucleolus', x: nucleolusPoint.x, y: nucleolusPoint.y })}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle
                cx={nucleolusPoint.x}
                cy={nucleolusPoint.y}
                r={hoveredPoint?.type === 'nucleolus' ? 10 : 8}
                fill="hsl(var(--accent))"
                stroke="white"
                strokeWidth="2"
                filter="url(#glow)"
                className="transition-all duration-200"
              />
              <text
                x={nucleolusPoint.x + 16}
                y={nucleolusPoint.y + 4}
                textAnchor="start"
                className="text-xs font-medium fill-accent pointer-events-none"
              >
                Nucleolus
              </text>
            </motion.g>

            {/* Axis labels showing percentage */}
            <g className="text-[10px] fill-muted-foreground font-mono">
              <text x={centerX} y={height - 8} textAnchor="middle">Cost share proportions</text>
            </g>

            {/* Hover tooltip */}
            {hoveredPoint && (
              <g>
                {/* Tooltip background */}
                <rect
                  x={Math.min(Math.max(hoveredPoint.x - 70, 10), width - 150)}
                  y={hoveredPoint.y - 90}
                  width="140"
                  height={participants.length * 18 + 30}
                  rx="6"
                  fill="hsl(var(--card))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                  filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                />
                {/* Tooltip title */}
                <text
                  x={Math.min(Math.max(hoveredPoint.x, 80), width - 80)}
                  y={hoveredPoint.y - 68}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-foreground"
                >
                  {hoveredPoint.type === 'scrb' ? 'SCRB Allocation' : 
                   hoveredPoint.type === 'shapley' ? 'Shapley Value' :
                   hoveredPoint.type === 'nucleolus' ? 'Nucleolus' : 'Equal Split'}
                </text>
                {/* Divider line */}
                <line
                  x1={Math.min(Math.max(hoveredPoint.x - 60, 20), width - 140)}
                  y1={hoveredPoint.y - 58}
                  x2={Math.min(Math.max(hoveredPoint.x + 60, 140), width - 20)}
                  y2={hoveredPoint.y - 58}
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                {/* Allocation values */}
                {participants.map((p, i) => {
                  const values = hoveredPoint.type === 'scrb' ? scrbAllocations :
                                 hoveredPoint.type === 'shapley' ? shapleyValues :
                                 hoveredPoint.type === 'nucleolus' ? nucleolusValues :
                                 [grandCoalitionCost / 3, grandCoalitionCost / 3, grandCoalitionCost / 3];
                  return (
                    <text
                      key={p.id}
                      x={Math.min(Math.max(hoveredPoint.x - 55, 25), width - 135)}
                      y={hoveredPoint.y - 42 + i * 18}
                      className="text-[11px] fill-foreground font-mono"
                    >
                      {p.name.length > 10 ? p.name.slice(0, 10) + '…' : p.name}: {values[i].toFixed(2)}
                    </text>
                  );
                })}
                {/* Total */}
                <text
                  x={Math.min(Math.max(hoveredPoint.x - 55, 25), width - 135)}
                  y={hoveredPoint.y - 42 + participants.length * 18}
                  className="text-[11px] fill-muted-foreground font-mono"
                >
                  Total: {(hoveredPoint.type === 'scrb' ? scrbAllocations :
                          hoveredPoint.type === 'shapley' ? shapleyValues :
                          hoveredPoint.type === 'nucleolus' ? nucleolusValues :
                          [grandCoalitionCost / 3, grandCoalitionCost / 3, grandCoalitionCost / 3])
                          .reduce((a, b) => a + b, 0).toFixed(2)}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Controls and Legend */}
        <div className="mt-6 flex flex-col gap-4">
          {/* Toggle constraints button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConstraints(!showConstraints)}
              className="text-xs"
            >
              {showConstraints ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
              {showConstraints ? 'Hide' : 'Show'} Constraints
            </Button>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 text-sm">
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
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-muted-foreground">Nucleolus</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground/50" />
              <span className="text-muted-foreground">Equal Split</span>
            </div>
          </div>

          {/* Constraint lines legend */}
          {showConstraints && (
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs font-medium mb-2 text-foreground">Constraint Boundaries</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0 border-t-2 border-dashed" style={{ borderColor: 'hsl(var(--chart-1))' }} />
                  <span>Individual (xᵢ ≤ cᵢ)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0 border-t-2" style={{ borderColor: 'hsl(var(--chart-4))', borderStyle: 'dashed', borderSpacing: '8px' }} />
                  <span>Coalition (xᵢ+xⱼ ≤ cᵢⱼ)</span>
                </div>
              </div>
            </div>
          )}
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
