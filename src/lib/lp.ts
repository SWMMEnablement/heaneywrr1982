/**
 * Exact linear programming by vertex enumeration.
 *
 * Suitable for the small LPs in this app (≤ 5 variables, ≤ ~30 constraints):
 * core bound computation (Heaney & Dickinson 1982, eqs. 19–20) and the
 * sequential-LP nucleolus (Maschler–Peleg–Shapley). No external dependency.
 */

export interface LPConstraint {
  /** Coefficient vector of length numVars */
  coeffs: number[];
  rhs: number;
}

export interface LPResult {
  feasible: boolean;
  point: number[];
  value: number;
}

const PIVOT_TOL = 1e-9;
const FEAS_TOL = 1e-6;

/** Solve a square linear system A x = b via Gauss–Jordan with partial pivoting. */
function solveSquare(A: number[][], b: number[]): number[] | null {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    }
    if (Math.abs(M[piv][col]) < PIVOT_TOL) return null;
    const tmp = M[col];
    M[col] = M[piv];
    M[piv] = tmp;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col] / M[col][col];
      if (f === 0) continue;
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  return M.map((row, i) => row[n] / M[i][i]);
}

/** Yield all combinations of `k` indices chosen from `count`. */
function* combinations(count: number, k: number): Generator<number[]> {
  if (k < 0 || k > count) return;
  const idx = Array.from({ length: k }, (_, i) => i);
  while (true) {
    yield [...idx];
    let i = k - 1;
    while (i >= 0 && idx[i] === count - k + i) i--;
    if (i < 0) return;
    idx[i]++;
    for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1;
  }
}

/**
 * Solve:  min/max  objective · x
 *         s.t.     inequalities: a·x ≤ rhs
 *                  equalities:   a·x = rhs
 *
 * Every vertex of the feasible polytope is the solution of a system of
 * `numVars` linearly independent active constraints (with all equalities
 * active). We enumerate those systems, keep feasible solutions, and return
 * the best objective value.
 */
export function solveLP(
  numVars: number,
  objective: number[],
  sense: "min" | "max",
  inequalities: LPConstraint[],
  equalities: LPConstraint[] = []
): LPResult {
  const infeasible: LPResult = { feasible: false, point: [], value: NaN };
  if (numVars <= 0) return infeasible;

  const isFeasible = (x: number[]): boolean => {
    for (const c of inequalities) {
      let s = 0;
      for (let i = 0; i < numVars; i++) s += c.coeffs[i] * x[i];
      if (s > c.rhs + FEAS_TOL) return false;
    }
    for (const c of equalities) {
      let s = 0;
      for (let i = 0; i < numVars; i++) s += c.coeffs[i] * x[i];
      if (Math.abs(s - c.rhs) > FEAS_TOL) return false;
    }
    return true;
  };

  let best: LPResult = infeasible;
  const consider = (x: number[] | null) => {
    if (!x || !isFeasible(x)) return;
    let v = 0;
    for (let i = 0; i < numVars; i++) v += objective[i] * x[i];
    if (
      !best.feasible ||
      (sense === "min" ? v < best.value - FEAS_TOL : v > best.value + FEAS_TOL)
    ) {
      best = { feasible: true, point: x, value: v };
    }
  };

  // Enumerate all numVars-sized subsets of the full constraint set. Equalities
  // may be mutually redundant (e.g. in the sequential nucleolus LPs), so we
  // cannot force them all into every system — the feasibility check enforces
  // them instead. Problem sizes here are tiny (≤ 31 constraints, ≤ 5 vars).
  const all = [...equalities, ...inequalities];
  for (const combo of combinations(all.length, numVars)) {
    const system = combo.map(i => all[i]);
    consider(solveSquare(system.map(c => c.coeffs), system.map(c => c.rhs)));
  }

  return best;
}
