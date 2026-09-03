import type { Discipline } from "../lib/scoring";

/* ============================================================
   Element catalogs — approximate ISU Scale of Values 2025/26
   ============================================================ */

export interface ElemDef {
  code: string;
  name: string;
  base: number;
}

/** bases array is indexed by level: 0=B, 1..4 */
export interface LeveledDef {
  code: string;
  name: string;
  bases: number[];
}

/* ---------------- jumps (singles) ---------------- */
const J = (code: string, name: string, base: number): ElemDef => ({ code, name, base });

export const JUMP_GROUPS: Record<string, { group: string; jumps: ElemDef[] }> = {
  axel: { group: "Axel", jumps: [J("1A", "Single Axel", 1.1), J("2A", "Double Axel", 3.3), J("3A", "Triple Axel", 8.0), J("4A", "Quad Axel", 12.5)] },
  toeloop: { group: "Toe loop", jumps: [J("1T", "Single Toe loop", 0.4), J("2T", "Double Toe loop", 1.3), J("3T", "Triple Toe loop", 4.2), J("4T", "Quad Toe loop", 9.5)] },
  salchow: { group: "Salchow", jumps: [J("1S", "Single Salchow", 0.4), J("2S", "Double Salchow", 1.3), J("3S", "Triple Salchow", 4.3), J("4S", "Quad Salchow", 9.7)] },
  loop: { group: "Loop", jumps: [J("1Lo", "Single Loop", 0.5), J("2Lo", "Double Loop", 1.7), J("3Lo", "Triple Loop", 4.9), J("4Lo", "Quad Loop", 10.5)] },
  flip: { group: "Flip", jumps: [J("1F", "Single Flip", 0.5), J("2F", "Double Flip", 1.8), J("3F", "Triple Flip", 5.3), J("4F", "Quad Flip", 11.0)] },
  lutz: { group: "Lutz", jumps: [J("1Lz", "Single Lutz", 0.6), J("2Lz", "Double Lutz", 2.1), J("3Lz", "Triple Lutz", 5.9), J("4Lz", "Quad Lutz", 11.5)] },
};

/**
 * Jump content allowed by ISU category:
 *  - Junior Men: no quads (3A allowed)
 *  - Junior Ladies: no quads, no triple Axel
 *  - Senior Ladies: 3A and 4T/4S/4Lo allowed (4F/4Lz/4A excluded)
 */
export function filterJumps(disc: Discipline, jumps: ElemDef[]): ElemDef[] {
  if (disc === "men") return jumps;
  if (disc === "jmen") return jumps.filter((j) => !j.code.startsWith("4"));
  if (disc === "ladies") return jumps.filter((j) => j.code !== "4A" && j.code !== "4F" && j.code !== "4Lz");
  return jumps.filter((j) => !j.code.startsWith("4") && j.code !== "3A"); // junior ladies
}

/* ---------------- spins ---------------- */
export const SPIN_LEVEL_KEYS = ["B", "1", "2", "3", "4"];

export const SINGLES_SPINS: LeveledDef[] = [
  { code: "FSSp", name: "Flying Sit Spin", bases: [1.9, 2.3, 2.6, 3.0, 3.0] },
  { code: "FCSSp", name: "Flying Camel Sit Spin", bases: [2.1, 2.4, 2.8, 3.2, 3.2] },
  { code: "CCoSp", name: "Combination Spin", bases: [2.0, 2.5, 3.0, 3.5, 3.5] },
  { code: "FCCoSp", name: "Flying Combination Spin", bases: [2.5, 3.0, 3.5, 4.0, 4.0] },
  { code: "LSp", name: "Layback / Sideways Spin", bases: [1.9, 2.4, 2.7, 3.2, 3.2] },
  { code: "CSSp", name: "Camel Sit Spin", bases: [2.0, 2.3, 2.6, 3.0, 3.0] },
  { code: "USp", name: "Upright Spin", bases: [1.5, 1.9, 2.3, 2.7, 2.7] },
];

export const DANCE_SPINS: LeveledDef[] = [
  { code: "CoSp", name: "Dance Spin", bases: [3.2, 3.5, 3.9, 4.3, 4.5] },
  { code: "seqTw", name: "Twizzle Sequence", bases: [0.9, 1.1, 1.4, 1.7, 2.0] },
];

export const PAIRS_SPINS: LeveledDef[] = [
  { code: "PCoSp", name: "Pair Combination Spin", bases: [3.0, 3.5, 4.0, 4.5, 5.0] },
  { code: "FiDs", name: "Death Spiral (forward inside)", bases: [2.3, 2.8, 3.3, 3.8, 4.3] },
  { code: "FoDs", name: "Death Spiral (forward outside)", bases: [2.3, 2.8, 3.3, 3.8, 4.3] },
  { code: "BiDs", name: "Death Spiral (backward inside)", bases: [2.5, 3.0, 3.5, 4.0, 4.5] },
  { code: "BoDs", name: "Death Spiral (backward outside)", bases: [2.5, 3.0, 3.5, 4.0, 4.5] },
];

/* ---------------- steps & choreo ---------------- */
export const STSQ: LeveledDef = { code: "StSq", name: "Step Sequence", bases: [1.8, 2.6, 3.3, 4.1, 4.7] };

export const CHSQ: ElemDef[] = [J("ChSq1", "Choreo Sequence", 3.0)];

export const DANCE_CHOREO: ElemDef[] = [
  J("ChSl1", "Choreo Sliding Movement", 3.0),
  J("ChSp1", "Choreo Spinning Movement", 3.0),
  J("ChTw1", "Choreo Twizzle Movement", 3.0),
];

/* ---------------- pairs: twists & throws ---------------- */
export const TWISTS: LeveledDef[] = [
  { code: "2Tw", name: "Double Twist", bases: [2.0, 2.5, 3.0, 3.5, 4.0] },
  { code: "3Tw", name: "Triple Twist", bases: [4.0, 5.0, 5.5, 6.0, 6.5] },
  { code: "4Tw", name: "Quad Twist", bases: [5.5, 6.5, 7.0, 7.5, 8.0] },
];

export const THROWS: ElemDef[] = [
  J("2STh", "Throw Double Salchow", 3.0),
  J("2ATh", "Throw Double Axel", 3.5),
  J("2LoTh", "Throw Double Loop", 3.3),
  J("3STh", "Throw Triple Salchow", 4.4),
  J("3ATh", "Throw Triple Axel", 5.0),
  J("3LoTh", "Throw Triple Loop", 4.5),
  J("3FTh", "Throw Triple Flip", 4.9),
  J("3LzTh", "Throw Triple Lutz", 5.3),
  J("4STh", "Throw Quad Salchow", 6.6),
  J("4ATh", "Throw Quad Axel", 7.2),
  J("4LoTh", "Throw Quad Loop", 6.7),
  J("4FTh", "Throw Quad Flip", 7.1),
];

/* ---------------- lifts ---------------- */
export const PAIRS_LIFTS: LeveledDef[] = [
  { code: "3Li", name: "Group 3 Lift", bases: [2.0, 3.0, 3.5, 4.0, 4.5] },
  { code: "4Li", name: "Group 4 Lift", bases: [2.0, 3.0, 3.5, 4.0, 4.5] },
  { code: "5ALi", name: "Axel Lasso Lift", bases: [2.0, 3.0, 3.5, 4.0, 4.5] },
  { code: "5RLi", name: "Reverse Lasso Lift", bases: [2.0, 3.0, 3.5, 4.0, 4.5] },
  { code: "5SLi", name: "Star Lasso Lift", bases: [2.0, 3.0, 3.5, 4.0, 4.5] },
];

export const DANCE_SHORT_LIFTS: LeveledDef[] = [
  { code: "StaLi", name: "Stationary Lift", bases: [0, 1.1, 1.7, 2.3, 2.9] },
  { code: "CuLi", name: "Curve Lift", bases: [0, 1.1, 1.7, 2.3, 2.9] },
  { code: "SlLi", name: "Straight Line Lift", bases: [0, 1.1, 1.7, 2.3, 2.9] },
  { code: "RoLi", name: "Rotational Lift", bases: [0, 1.1, 1.7, 2.3, 2.9] },
  { code: "SeLi", name: "Serpentine Lift", bases: [0, 1.1, 1.7, 2.3, 2.9] },
];

export const DANCE_LONG_LIFT: ElemDef = J("ChLi1", "Choreo / Long Lift", 7.0);
