import { useMemo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Triangle, Target, Info, Eye, EyeOff, Move, MousePointer, Play, RotateCcw } from "lucide-react";
import CoreStoryMode from "./CoreStoryMode";
import ContextualQuizPrompt from "./ContextualQuizPrompt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface HoveredPoint {
  type: 'scrb' | 'shapley' | 'centroid' | 'nucleolus' | 'custom';
  x: number;
  y: number;
  values?: number[];
}

interface ClickedConstraint {
  label: string;
  description: string;
  type: 'individual' | 'coalition';
  color: string;
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
  const [clickedConstraint, setClickedConstraint] = useState<ClickedConstraint | null>(null);
  const [draggingPoint, setDraggingPoint] = useState<'scrb' | 'shapley' | 'nucleolus' | null>(null);
  const [dragOffsets, setDragOffsets] = useState<{
    scrb: { x: number; y: number };
    shapley: { x: number; y: number };
    nucleolus: { x: number; y: number };
  }>({
    scrb: { x: 0, y: 0 },
    shapley: { x: 0, y: 0 },
    nucleolus: { x: 0, y: 0 },
  });
  
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
  const barycentricToCartesian = useCallback((coords: number[]) => {
    const [a, b, c] = coords;
    return {
      x: a * vertices.A.x + b * vertices.B.x + c * vertices.C.x,
      y: a * vertices.A.y + b * vertices.B.y + c * vertices.C.y,
    };
  }, [vertices]);

  // Convert Cartesian to barycentric
  const cartesianToBarycentric = useCallback((x: number, y: number) => {
    const { A, B, C } = vertices;
    const det = (B.y - C.y) * (A.x - C.x) + (C.x - B.x) * (A.y - C.y);
    const a = ((B.y - C.y) * (x - C.x) + (C.x - B.x) * (y - C.y)) / det;
    const b = ((C.y - A.y) * (x - C.x) + (A.x - C.x) * (y - C.y)) / det;
    const c = 1 - a - b;
    return [Math.max(0, Math.min(1, a)), Math.max(0, Math.min(1, b)), Math.max(0, Math.min(1, c))];
  }, [vertices]);

  // Normalize allocations to barycentric coordinates
  const allocationToBarycentric = useCallback((allocation: number[]) => {
    const total = allocation.reduce((sum, v) => sum + v, 0);
    if (total === 0) return [1/3, 1/3, 1/3];
    return allocation.map(v => v / total);
  }, []);

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

    // Core constraints for a 3-player cost game
    const constraints = [
      { type: 'individual', player: 1, bound: c1 },
      { type: 'individual', player: 2, bound: c2 },
      { type: 'individual', player: 3, bound: c3 },
      { type: 'coalition', players: [1, 2], bound: c12 },
      { type: 'coalition', players: [1, 3], bound: c13 },
      { type: 'coalition', players: [2, 3], bound: c23 },
    ];

    // Generate core polygon vertices using constraint intersection
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
  }, [participants, coalitions, grandCoalitionCost, allocationToBarycentric, barycentricToCartesian]);

  // Check if a point is in the core
  const isPointInCore = useCallback((x: number, y: number, C: number) => {
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

    const bary = cartesianToBarycentric(x, y);
    const x1 = bary[0] * C;
    const x2 = bary[1] * C;
    const x3 = bary[2] * C;

    return (
      x1 <= c1 + 0.01 &&
      x2 <= c2 + 0.01 &&
      x3 <= c3 + 0.01 &&
      x1 + x2 <= c12 + 0.01 &&
      x1 + x3 <= c13 + 0.01 &&
      x2 + x3 <= c23 + 0.01
    );
  }, [participants, coalitions, cartesianToBarycentric]);

  // Calculate positions for allocation methods
  const scrbPoint = useMemo(() => {
    const bary = allocationToBarycentric(scrbAllocations);
    return barycentricToCartesian(bary);
  }, [scrbAllocations, allocationToBarycentric, barycentricToCartesian]);

  const shapleyPoint = useMemo(() => {
    const bary = allocationToBarycentric(shapleyValues);
    return barycentricToCartesian(bary);
  }, [shapleyValues, allocationToBarycentric, barycentricToCartesian]);

  // Equal split point (centroid)
  const centroid = barycentricToCartesian([1/3, 1/3, 1/3]);

  // Calculate Nucleolus
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
  }, [participants, coalitions, grandCoalitionCost]);

  const nucleolusPoint = useMemo(() => {
    const bary = allocationToBarycentric(nucleolusValues);
    return barycentricToCartesian(bary);
  }, [nucleolusValues, allocationToBarycentric, barycentricToCartesian]);

  // Generate grid lines for the simplex
  const gridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const divisions = 5;
    
    for (let i = 1; i < divisions; i++) {
      const t = i / divisions;
      
      const p1a = { x: vertices.A.x + t * (vertices.B.x - vertices.A.x), y: vertices.A.y + t * (vertices.B.y - vertices.A.y) };
      const p1b = { x: vertices.A.x + t * (vertices.C.x - vertices.A.x), y: vertices.A.y + t * (vertices.C.y - vertices.A.y) };
      lines.push({ x1: p1a.x, y1: p1a.y, x2: p1b.x, y2: p1b.y });
      
      const p2a = { x: vertices.B.x + t * (vertices.A.x - vertices.B.x), y: vertices.B.y + t * (vertices.A.y - vertices.B.y) };
      const p2b = { x: vertices.B.x + t * (vertices.C.x - vertices.B.x), y: vertices.B.y + t * (vertices.C.y - vertices.B.y) };
      lines.push({ x1: p2a.x, y1: p2a.y, x2: p2b.x, y2: p2b.y });
      
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

  // Constraint descriptions for clickable lines
  const constraintDescriptions: Record<string, { short: string; description: string }> = {
    'x₁': { 
      short: 'Individual Rationality for P1', 
      description: `${participants[0]?.name || 'Participant 1'} should not pay more than their standalone cost. This ensures they benefit from joining the coalition.` 
    },
    'x₂': { 
      short: 'Individual Rationality for P2', 
      description: `${participants[1]?.name || 'Participant 2'} should not pay more than their standalone cost. This ensures they benefit from joining the coalition.` 
    },
    'x₃': { 
      short: 'Individual Rationality for P3', 
      description: `${participants[2]?.name || 'Participant 3'} should not pay more than their standalone cost. This ensures they benefit from joining the coalition.` 
    },
    'x₁+x₂': { 
      short: 'Coalition Rationality for P1 & P2', 
      description: `The combined cost for ${participants[0]?.name || 'P1'} and ${participants[1]?.name || 'P2'} should not exceed what they'd pay forming their own coalition, otherwise they'd leave.` 
    },
    'x₁+x₃': { 
      short: 'Coalition Rationality for P1 & P3', 
      description: `The combined cost for ${participants[0]?.name || 'P1'} and ${participants[2]?.name || 'P3'} should not exceed what they'd pay forming their own coalition, otherwise they'd leave.` 
    },
    'x₂+x₃': { 
      short: 'Coalition Rationality for P2 & P3', 
      description: `The combined cost for ${participants[1]?.name || 'P2'} and ${participants[2]?.name || 'P3'} should not exceed what they'd pay forming their own coalition, otherwise they'd leave.` 
    },
  };

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
      constraintKey: string;
      type: 'individual' | 'coalition';
      color: string;
    }[] = [];

    // Individual constraint x1 = c1
    if (c1 < C && c1 > 0) {
      const x1 = c1;
      const p1 = allocationToBarycentric([x1, 0, C - x1]);
      const p2 = allocationToBarycentric([x1, C - x1, 0]);
      const pt1 = barycentricToCartesian(p1);
      const pt2 = barycentricToCartesian(p2);
      lines.push({ ...pt1, x2: pt2.x, y2: pt2.y, x1: pt1.x, y1: pt1.y, label: `x₁ ≤ ${c1}`, constraintKey: 'x₁', type: 'individual', color: 'hsl(var(--chart-1))' });
    }

    // Individual constraint x2 = c2
    if (c2 < C && c2 > 0) {
      const x2 = c2;
      const p1 = allocationToBarycentric([0, x2, C - x2]);
      const p2 = allocationToBarycentric([C - x2, x2, 0]);
      const pt1 = barycentricToCartesian(p1);
      const pt2 = barycentricToCartesian(p2);
      lines.push({ ...pt1, x2: pt2.x, y2: pt2.y, x1: pt1.x, y1: pt1.y, label: `x₂ ≤ ${c2}`, constraintKey: 'x₂', type: 'individual', color: 'hsl(var(--chart-2))' });
    }

    // Individual constraint x3 = c3
    if (c3 < C && c3 > 0) {
      const x3 = c3;
      const p1 = allocationToBarycentric([0, C - x3, x3]);
      const p2 = allocationToBarycentric([C - x3, 0, x3]);
      const pt1 = barycentricToCartesian(p1);
      const pt2 = barycentricToCartesian(p2);
      lines.push({ ...pt1, x2: pt2.x, y2: pt2.y, x1: pt1.x, y1: pt1.y, label: `x₃ ≤ ${c3}`, constraintKey: 'x₃', type: 'individual', color: 'hsl(var(--chart-3))' });
    }

    // Coalition constraint x1 + x2 = c12
    if (c12 < C && C - c12 > 0) {
      const x3 = C - c12;
      const p1 = allocationToBarycentric([0, C - x3, x3]);
      const p2 = allocationToBarycentric([C - x3, 0, x3]);
      const pt1 = barycentricToCartesian(p1);
      const pt2 = barycentricToCartesian(p2);
      lines.push({ ...pt1, x2: pt2.x, y2: pt2.y, x1: pt1.x, y1: pt1.y, label: `x₁+x₂ ≤ ${c12}`, constraintKey: 'x₁+x₂', type: 'coalition', color: 'hsl(var(--chart-4))' });
    }

    // Coalition constraint x1 + x3 = c13
    if (c13 < C && C - c13 > 0) {
      const x2 = C - c13;
      const p1 = allocationToBarycentric([0, x2, C - x2]);
      const p2 = allocationToBarycentric([C - x2, x2, 0]);
      const pt1 = barycentricToCartesian(p1);
      const pt2 = barycentricToCartesian(p2);
      lines.push({ ...pt1, x2: pt2.x, y2: pt2.y, x1: pt1.x, y1: pt1.y, label: `x₁+x₃ ≤ ${c13}`, constraintKey: 'x₁+x₃', type: 'coalition', color: 'hsl(var(--chart-5))' });
    }

    // Coalition constraint x2 + x3 = c23
    if (c23 < C && C - c23 > 0) {
      const x1 = C - c23;
      const p1 = allocationToBarycentric([x1, 0, C - x1]);
      const p2 = allocationToBarycentric([x1, C - x1, 0]);
      const pt1 = barycentricToCartesian(p1);
      const pt2 = barycentricToCartesian(p2);
      lines.push({ ...pt1, x2: pt2.x, y2: pt2.y, x1: pt1.x, y1: pt1.y, label: `x₂+x₃ ≤ ${c23}`, constraintKey: 'x₂+x₃', type: 'coalition', color: 'hsl(var(--accent))' });
    }

    return lines;
  }, [participants, coalitions, grandCoalitionCost, allocationToBarycentric, barycentricToCartesian]);

  // State for showing constraint labels
  const [showConstraints, setShowConstraints] = useState(true);
  const [highlightedConstraint, setHighlightedConstraint] = useState<string | null>(null);
  const [storyModeConstraints, setStoryModeConstraints] = useState<string[]>([]);
  const [isStoryModeActive, setIsStoryModeActive] = useState(false);

  // Story mode callbacks
  const handleHighlightConstraints = useCallback((constraints: string[]) => {
    setIsStoryModeActive(true);
    setStoryModeConstraints(constraints);
    setShowConstraints(true);
  }, []);

  const handleResetHighlights = useCallback(() => {
    setIsStoryModeActive(false);
    setStoryModeConstraints([]);
  }, []);

  // Check if a constraint is highlighted in story mode
  const isConstraintHighlighted = useCallback((constraintKey: string) => {
    if (!isStoryModeActive || storyModeConstraints.length === 0) return true;
    // Map constraint keys: x₁ -> x1, x₁+x₂ -> x12, etc.
    const normalizedKey = constraintKey
      .replace(/₁/g, '1')
      .replace(/₂/g, '2')
      .replace(/₃/g, '3')
      .replace(/\+/g, '');
    return storyModeConstraints.some(sc => {
      const normalizedSc = sc.replace(/x/g, '');
      return normalizedKey.includes(normalizedSc) || normalizedSc === normalizedKey.replace(/x/g, '');
    });
  }, [isStoryModeActive, storyModeConstraints]);

  // Handle constraint click
  const handleConstraintClick = (line: typeof constraintLines[0]) => {
    const desc = constraintDescriptions[line.constraintKey];
    setClickedConstraint({
      label: line.label,
      description: desc?.description || 'This constraint defines a boundary of the Core region.',
      type: line.type,
      color: line.color,
    });
  };

  // Handle drag for points
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingPoint) return;
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Clamp to triangle bounds
    const clampedX = Math.max(vertices.B.x, Math.min(vertices.C.x, x));
    const clampedY = Math.max(vertices.A.y, Math.min(vertices.B.y, y));
    
    const basePoint = draggingPoint === 'scrb' ? scrbPoint : 
                      draggingPoint === 'shapley' ? shapleyPoint : nucleolusPoint;
    
    setDragOffsets(prev => ({
      ...prev,
      [draggingPoint]: { x: clampedX - basePoint.x, y: clampedY - basePoint.y }
    }));
    
    // Calculate and show allocation values for dragged position
    const bary = cartesianToBarycentric(clampedX, clampedY);
    const C = grandCoalitionCost;
    const values = [bary[0] * C, bary[1] * C, bary[2] * C];
    setHoveredPoint({ type: 'custom', x: clampedX, y: clampedY, values });
  }, [draggingPoint, scrbPoint, shapleyPoint, nucleolusPoint, vertices, cartesianToBarycentric, grandCoalitionCost]);

  const handleMouseUp = useCallback(() => {
    setDraggingPoint(null);
    setHoveredPoint(null);
  }, []);

  // Get dragged point position
  const getDraggedPosition = (type: 'scrb' | 'shapley' | 'nucleolus') => {
    const basePoint = type === 'scrb' ? scrbPoint : 
                      type === 'shapley' ? shapleyPoint : nucleolusPoint;
    const offset = dragOffsets[type];
    return {
      x: basePoint.x + offset.x,
      y: basePoint.y + offset.y,
    };
  };

  // Check if dragged point is in core
  const isDraggedPointInCore = (type: 'scrb' | 'shapley' | 'nucleolus') => {
    const pos = getDraggedPosition(type);
    return isPointInCore(pos.x, pos.y, grandCoalitionCost);
  };

  // Reset drag offsets
  const resetDrag = () => {
    setDragOffsets({
      scrb: { x: 0, y: 0 },
      shapley: { x: 0, y: 0 },
      nucleolus: { x: 0, y: 0 },
    });
  };

  const hasDragOffsets = Object.values(dragOffsets).some(o => o.x !== 0 || o.y !== 0);
  
  // State for first-time overlay
  const [showOverlay, setShowOverlay] = useState(() => {
    return !localStorage.getItem('hasSeenCoreOverlay');
  });
  
  // State for contextual quiz prompt (shows after overlay is dismissed)
  const [showQuizPrompt, setShowQuizPrompt] = useState(false);
  const [hasSeenCoreQuiz, setHasSeenCoreQuiz] = useState(() => {
    return localStorage.getItem('hasSeenCoreQuiz') === 'true';
  });
  
  const dismissOverlay = () => {
    setShowOverlay(false);
    localStorage.setItem('hasSeenCoreOverlay', 'true');
    // Show quiz prompt after a short delay if user hasn't seen it
    if (!hasSeenCoreQuiz) {
      setTimeout(() => setShowQuizPrompt(true), 1500);
    }
  };
  
  const handleQuizComplete = () => {
    setHasSeenCoreQuiz(true);
    localStorage.setItem('hasSeenCoreQuiz', 'true');
  };
  
  const handleQuizDismiss = () => {
    setShowQuizPrompt(false);
  };

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
              <p>The shaded region represents the Core - all stable allocations where no coalition has an incentive to defect. Click constraint lines for explanations, drag points to explore!</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
        <CardDescription>
          Triangular coordinate plot showing feasible allocation space • Click constraints • Drag points
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* One-sentence explanatory overlay for first-time users */}
        <AnimatePresence>
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 rounded-xl bg-gradient-to-r from-interactive/15 via-accent/10 to-primary/10 border-2 border-interactive/30 relative"
            >
              <button 
                onClick={dismissOverlay}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/50 transition-colors"
                aria-label="Dismiss"
              >
                ✕
              </button>
              <div className="flex gap-3 items-start pr-6">
                <div className="p-2 rounded-lg bg-interactive/20 shrink-0">
                  <Target className="w-5 h-5 text-interactive" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">What is this diagram?</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The shaded "<span className="font-semibold text-interactive">Core</span>" region shows all cost splits where{" "}
                    <span className="text-foreground">no town or pair of towns would be better off building alone</span>.{" "}
                    <span className="text-muted-foreground/80">Drag the method points to see if they are stable!</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Contextual quiz prompt after overlay dismissal */}
          {showQuizPrompt && !showOverlay && (
            <ContextualQuizPrompt
              context="core"
              onDismiss={handleQuizDismiss}
              onComplete={handleQuizComplete}
            />
          )}
        </AnimatePresence>
        <div className="flex justify-center">
          <svg 
            width={width} 
            height={height} 
            className="overflow-visible cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
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
              <filter id="strongGlow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
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
              stroke="hsl(var(--border))"
              strokeWidth="2"
            />

            {/* Constraint boundary lines - clickable */}
            {showConstraints && constraintLines.map((line, i) => {
              const isHighlighted = isConstraintHighlighted(line.constraintKey);
              const isHovered = highlightedConstraint === line.constraintKey;
              const isStoryHighlight = isStoryModeActive && isHighlighted;
              
              return (
                <motion.g
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: isStoryModeActive ? (isHighlighted ? 1 : 0.15) : 1,
                    scale: isStoryHighlight ? 1 : 1
                  }}
                  transition={{ duration: 0.5, delay: isStoryModeActive ? 0 : 0.2 + i * 0.1 }}
                  className="cursor-pointer"
                  onMouseEnter={() => setHighlightedConstraint(line.constraintKey)}
                  onMouseLeave={() => setHighlightedConstraint(null)}
                  onClick={() => handleConstraintClick(line)}
                >
                  {/* Invisible wider hitbox */}
                  <line
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="transparent"
                    strokeWidth="16"
                  />
                  {/* Visible line */}
                  <line
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke={line.color}
                    strokeWidth={isHovered || isStoryHighlight ? 4 : 1.5}
                    strokeDasharray={line.type === 'individual' ? "4 2" : "8 4"}
                    opacity={isHovered ? 1 : isStoryHighlight ? 0.95 : 0.7}
                    filter={isHovered || isStoryHighlight ? "url(#strongGlow)" : undefined}
                    className="transition-all duration-300"
                  />
                  {/* Label at midpoint */}
                  <text
                    x={(line.x1 + line.x2) / 2 + (i % 2 === 0 ? 8 : -8)}
                    y={(line.y1 + line.y2) / 2 + (i < 3 ? -6 : 12)}
                    textAnchor="middle"
                    className="text-[9px] font-mono pointer-events-none transition-all duration-300"
                    fill={line.color}
                    opacity={isHovered || isStoryHighlight ? 1 : 0.9}
                    fontWeight={isHovered || isStoryHighlight ? 700 : 400}
                    fontSize={isStoryHighlight ? 11 : 9}
                  >
                    {line.label}
                  </text>
                  {/* Click hint */}
                  {isHovered && (
                    <text
                      x={(line.x1 + line.x2) / 2}
                      y={(line.y1 + line.y2) / 2 + 24}
                      textAnchor="middle"
                      className="text-[8px] fill-muted-foreground pointer-events-none"
                    >
                      Click for details
                    </text>
                  )}
                </motion.g>
              );
            })}

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
              onMouseLeave={() => !draggingPoint && setHoveredPoint(null)}
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

            {/* SCRB allocation point - Draggable */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              style={{ cursor: draggingPoint === 'scrb' ? 'grabbing' : 'grab' }}
              onMouseDown={(e) => { e.preventDefault(); setDraggingPoint('scrb'); }}
              onMouseEnter={() => !draggingPoint && setHoveredPoint({ type: 'scrb', x: getDraggedPosition('scrb').x, y: getDraggedPosition('scrb').y })}
              onMouseLeave={() => !draggingPoint && setHoveredPoint(null)}
            >
              <circle
                cx={getDraggedPosition('scrb').x}
                cy={getDraggedPosition('scrb').y}
                r={hoveredPoint?.type === 'scrb' || draggingPoint === 'scrb' ? 12 : 8}
                fill={isDraggedPointInCore('scrb') ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                stroke="white"
                strokeWidth="2"
                filter={draggingPoint === 'scrb' ? "url(#strongGlow)" : "url(#glow)"}
                className="transition-all duration-200"
              />
              {dragOffsets.scrb.x === 0 && dragOffsets.scrb.y === 0 && (
                <text
                  x={getDraggedPosition('scrb').x}
                  y={getDraggedPosition('scrb').y - 14}
                  textAnchor="middle"
                  className="text-xs font-medium fill-primary pointer-events-none"
                >
                  SCRB
                </text>
              )}
              {/* Drag indicator */}
              <Move 
                x={getDraggedPosition('scrb').x - 5} 
                y={getDraggedPosition('scrb').y - 5} 
                width={10} 
                height={10} 
                className="pointer-events-none" 
                style={{ color: 'white', opacity: 0.8 }}
              />
            </motion.g>

            {/* Shapley allocation point - Draggable */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
              style={{ cursor: draggingPoint === 'shapley' ? 'grabbing' : 'grab' }}
              onMouseDown={(e) => { e.preventDefault(); setDraggingPoint('shapley'); }}
              onMouseEnter={() => !draggingPoint && setHoveredPoint({ type: 'shapley', x: getDraggedPosition('shapley').x, y: getDraggedPosition('shapley').y })}
              onMouseLeave={() => !draggingPoint && setHoveredPoint(null)}
            >
              <circle
                cx={getDraggedPosition('shapley').x}
                cy={getDraggedPosition('shapley').y}
                r={hoveredPoint?.type === 'shapley' || draggingPoint === 'shapley' ? 12 : 8}
                fill={isDraggedPointInCore('shapley') ? "hsl(var(--interactive))" : "hsl(var(--destructive))"}
                stroke="white"
                strokeWidth="2"
                filter={draggingPoint === 'shapley' ? "url(#strongGlow)" : "url(#glow)"}
                className="transition-all duration-200"
              />
              {dragOffsets.shapley.x === 0 && dragOffsets.shapley.y === 0 && (
                <text
                  x={getDraggedPosition('shapley').x}
                  y={getDraggedPosition('shapley').y + 20}
                  textAnchor="middle"
                  className="text-xs font-medium fill-interactive pointer-events-none"
                >
                  Shapley
                </text>
              )}
              <Move 
                x={getDraggedPosition('shapley').x - 5} 
                y={getDraggedPosition('shapley').y - 5} 
                width={10} 
                height={10} 
                className="pointer-events-none" 
                style={{ color: 'white', opacity: 0.8 }}
              />
            </motion.g>

            {/* Nucleolus allocation point - Draggable */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring" }}
              style={{ cursor: draggingPoint === 'nucleolus' ? 'grabbing' : 'grab' }}
              onMouseDown={(e) => { e.preventDefault(); setDraggingPoint('nucleolus'); }}
              onMouseEnter={() => !draggingPoint && setHoveredPoint({ type: 'nucleolus', x: getDraggedPosition('nucleolus').x, y: getDraggedPosition('nucleolus').y })}
              onMouseLeave={() => !draggingPoint && setHoveredPoint(null)}
            >
              <circle
                cx={getDraggedPosition('nucleolus').x}
                cy={getDraggedPosition('nucleolus').y}
                r={hoveredPoint?.type === 'nucleolus' || draggingPoint === 'nucleolus' ? 12 : 8}
                fill={isDraggedPointInCore('nucleolus') ? "hsl(var(--accent))" : "hsl(var(--destructive))"}
                stroke="white"
                strokeWidth="2"
                filter={draggingPoint === 'nucleolus' ? "url(#strongGlow)" : "url(#glow)"}
                className="transition-all duration-200"
              />
              {dragOffsets.nucleolus.x === 0 && dragOffsets.nucleolus.y === 0 && (
                <text
                  x={getDraggedPosition('nucleolus').x + 16}
                  y={getDraggedPosition('nucleolus').y + 4}
                  textAnchor="start"
                  className="text-xs font-medium fill-accent pointer-events-none"
                >
                  Nucleolus
                </text>
              )}
              <Move 
                x={getDraggedPosition('nucleolus').x - 5} 
                y={getDraggedPosition('nucleolus').y - 5} 
                width={10} 
                height={10} 
                className="pointer-events-none" 
                style={{ color: 'white', opacity: 0.8 }}
              />
            </motion.g>

            {/* Axis labels */}
            <g className="text-[10px] fill-muted-foreground font-mono">
              <text x={centerX} y={height - 8} textAnchor="middle">Cost share proportions</text>
            </g>

            {/* Hover tooltip */}
            {hoveredPoint && (
              <g>
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
                <text
                  x={Math.min(Math.max(hoveredPoint.x, 80), width - 80)}
                  y={hoveredPoint.y - 68}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-foreground"
                >
                  {hoveredPoint.type === 'scrb' ? 'SCRB Allocation' : 
                   hoveredPoint.type === 'shapley' ? 'Shapley Value' :
                   hoveredPoint.type === 'nucleolus' ? 'Nucleolus' : 
                   hoveredPoint.type === 'custom' ? 'Custom Position' : 'Equal Split'}
                </text>
                <line
                  x1={Math.min(Math.max(hoveredPoint.x - 60, 20), width - 140)}
                  y1={hoveredPoint.y - 58}
                  x2={Math.min(Math.max(hoveredPoint.x + 60, 140), width - 20)}
                  y2={hoveredPoint.y - 58}
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                {participants.map((p, i) => {
                  const values = hoveredPoint.type === 'custom' && hoveredPoint.values ? hoveredPoint.values :
                                 hoveredPoint.type === 'scrb' ? scrbAllocations :
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
                <text
                  x={Math.min(Math.max(hoveredPoint.x - 55, 25), width - 135)}
                  y={hoveredPoint.y - 42 + participants.length * 18}
                  className="text-[11px] fill-muted-foreground font-mono"
                >
                  Total: {(hoveredPoint.type === 'custom' && hoveredPoint.values ? hoveredPoint.values :
                          hoveredPoint.type === 'scrb' ? scrbAllocations :
                          hoveredPoint.type === 'shapley' ? shapleyValues :
                          hoveredPoint.type === 'nucleolus' ? nucleolusValues :
                          [grandCoalitionCost / 3, grandCoalitionCost / 3, grandCoalitionCost / 3])
                          .reduce((a, b) => a + b, 0).toFixed(2)}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Constraint Explanation Popup */}
        <AnimatePresence>
          {clickedConstraint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-4 rounded-lg border-2"
              style={{ borderColor: clickedConstraint.color, backgroundColor: `${clickedConstraint.color}10` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointer className="w-4 h-4" style={{ color: clickedConstraint.color }} />
                    <span className="font-semibold" style={{ color: clickedConstraint.color }}>
                      {clickedConstraint.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {clickedConstraint.type === 'individual' ? 'Individual Rationality' : 'Coalition Rationality'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {clickedConstraint.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setClickedConstraint(null)}
                  className="shrink-0"
                >
                  ✕
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls and Legend */}
        <div className="mt-6 flex flex-col gap-4">
          {/* Toggle constraints button and reset drag */}
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Move className="w-3 h-3" />
              Drag points to explore stability
            </div>
            <div className="flex gap-2">
              {hasDragOffsets && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetDrag}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset Positions
                </Button>
              )}
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
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Outside Core</span>
            </div>
          </div>

          {/* Constraint lines legend */}
          {showConstraints && (
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs font-medium mb-2 text-foreground">Constraint Boundaries (click for details)</p>
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
            Points inside the shaded region satisfy all individual and coalition rationality constraints. Drag solution points to see if alternative allocations would be stable.
          </p>
        </div>

        {/* Story Mode - Integrated */}
        <div className="mt-6">
          <CoreStoryMode
            participants={participants}
            coalitions={coalitions}
            grandCoalitionCost={grandCoalitionCost}
            onHighlightConstraints={handleHighlightConstraints}
            onResetHighlights={handleResetHighlights}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CoreVisualization;
