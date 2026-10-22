import type { Participant, CoalitionCost } from "./calculations";
import { getCoalitionCost } from "./steps-helpers";

export type CoreStatus = "exists" | "degenerate" | "empty";

export interface CorePolygon {
  status: CoreStatus;
  /** Polygon vertices as [x1, x2, x3] allocations (empty when status is "empty") */
  vertices: number[][];
}

interface HalfPlane {
  /** a*x1 + b*x2 ≤ c */
  a: number;
  b: number;
  c: number;
}

type Point2 = [number, number];

const EPS = 1e-9;

/** Sutherland–Hodgman: clip a convex polygon by a single half-plane. */
function clipPolygon(poly: Point2[], hp: HalfPlane): Point2[] {
  if (poly.length === 0) return poly;
  const inside = (p: Point2) => hp.a * p[0] + hp.b * p[1] <= hp.c + EPS;
  const result: Point2[] = [];

  for (let i = 0; i < poly.length; i++) {
    const curr = poly[i];
    const prev = poly[(i + poly.length - 1) % poly.length];
    const currIn = inside(curr);
    const prevIn = inside(prev);

    if (currIn !== prevIn) {
      // Edge crosses the boundary — add the intersection point.
      const dPrev = hp.a * prev[0] + hp.b * prev[1] - hp.c;
      const dCurr = hp.a * curr[0] + hp.b * curr[1] - hp.c;
      const t = dPrev / (dPrev - dCurr);
      result.push([prev[0] + t * (curr[0] - prev[0]), prev[1] + t * (curr[1] - prev[1])]);
    }
    if (currIn) result.push(curr);
  }
  return result;
}

function polygonArea(poly: Point2[]): number {
  let area = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area) / 2;
}

/**
 * Exact core polygon for a 3-player cost game.
 *
 * Works in the (x1, x2) plane with x3 = c(N) − x1 − x2. The simplex
 * (x1 ≥ 0, x2 ≥ 0, x1 + x2 ≤ c(N)) is clipped by the six core half-planes:
 *   x1 ≤ c(1)        x2 ≤ c(2)        x1 + x2 ≥ c(N) − c(3)
 *   x1 + x2 ≤ c(12)  x2 ≥ c(N) − c(13)  x1 ≥ c(N) − c(23)
 *
 * Reports "exists" (area polygon), "degenerate" (point or line core), or
 * "empty" separately, so thin or point cores are never mistaken for empty.
 * Coalition lookups are id-aware via getCoalitionCost.
 */
export function computeCorePolygon(
  participants: Participant[],
  coalitions: CoalitionCost[],
  grandCoalitionCost: number
): CorePolygon {
  const n = participants.length;
  if (n !== 3 || grandCoalitionCost <= 0) {
    return { status: "empty", vertices: [] };
  }

  const [p1, p2, p3] = participants;
  const C = grandCoalitionCost;
  const c1 = p1.independentCost;
  const c2 = p2.independentCost;
  const c3 = p3.independentCost;
  const c12 = getCoalitionCost([p1.id, p2.id], participants, coalitions);
  const c13 = getCoalitionCost([p1.id, p3.id], participants, coalitions);
  const c23 = getCoalitionCost([p2.id, p3.id], participants, coalitions);

  const halfPlanes: HalfPlane[] = [
    { a: 1, b: 0, c: c1 },        // x1 ≤ c(1)
    { a: 0, b: 1, c: c2 },        // x2 ≤ c(2)
    { a: -1, b: -1, c: c3 - C },  // x1 + x2 ≥ C − c(3)
    { a: 1, b: 1, c: c12 },       // x1 + x2 ≤ c(12)
    { a: 0, b: -1, c: c13 - C },  // x2 ≥ C − c(13)
    { a: -1, b: 0, c: c23 - C },  // x1 ≥ C − c(23)
  ];

  // Start with the simplex triangle and clip by each half-plane.
  let poly: Point2[] = [[0, 0], [C, 0], [0, C]];
  for (const hp of halfPlanes) {
    poly = clipPolygon(poly, hp);
    if (poly.length === 0) break;
  }

  if (poly.length === 0) {
    return { status: "empty", vertices: [] };
  }

  // Drop consecutive duplicate points introduced by clipping.
  const cleaned: Point2[] = [];
  for (const p of poly) {
    const last = cleaned[cleaned.length - 1];
    if (!last || Math.abs(last[0] - p[0]) > EPS || Math.abs(last[1] - p[1]) > EPS) {
      cleaned.push(p);
    }
  }
  if (
    cleaned.length > 1 &&
    Math.abs(cleaned[0][0] - cleaned[cleaned.length - 1][0]) < EPS &&
    Math.abs(cleaned[0][1] - cleaned[cleaned.length - 1][1]) < EPS
  ) {
    cleaned.pop();
  }

  const degenerate = cleaned.length < 3 || polygonArea(cleaned) < EPS * C * C;
  return {
    status: degenerate ? "degenerate" : "exists",
    vertices: cleaned.map(([x1, x2]) => [x1, x2, C - x1 - x2]),
  };
}
