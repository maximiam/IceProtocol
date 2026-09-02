/* ============================================================
   FS JUDGE — ISU scoring engine (rules 2025/26)
   ============================================================ */

export type Discipline = "men" | "ladies" | "pairs" | "dance";
export type Segment = "sp" | "fs";
export type ElemType = "jump" | "spin" | "step" | "choreo";

export interface SkElement {
  id: string;
  type: ElemType;
  code: string; // "3Lz+3T", "CCoSp4", "StSq3", "ChSq1"
  name: string;
  base: number; // raw base value (before marks)
  flags: string[]; // "x" | "<" | "<<" | "q" | "!" | "e"
  goe: number; // -5..5
}

export interface Pcs {
  comp: number;
  pres: number;
  ss: number;
}

export interface Deds {
  falls: number;
  time: boolean;
  costume: boolean;
  music: boolean;
}

export interface Protocol {
  id: string;
  createdAt: number;
  skater: string;
  discipline: Discipline;
  segment: Segment;
  elements: SkElement[];
  pcs: Pcs;
  deds: Deds;
  tes: number;
  pcsScore: number;
  deductions: number;
  total: number;
}

export const r2 = (n: number) => Math.round(n * 100) / 100;
export const fmt = (n: number) => n.toFixed(2);

/** PCS segment factors (3 components: Composition, Presentation, Skating Skills) */
export const PCS_FACTOR: Record<Discipline, Record<Segment, number>> = {
  men: { sp: 1.67, fs: 3.33 },
  ladies: { sp: 1.33, fs: 2.67 },
  pairs: { sp: 1.33, fs: 2.67 },
  dance: { sp: 1.33, fs: 2.0 },
};

/** Max element slots per segment (singles rules) */
export const LIMITS: Record<Segment, Record<ElemType, number>> = {
  sp: { jump: 3, spin: 2, step: 1, choreo: 0 },
  fs: { jump: 7, spin: 3, step: 1, choreo: 1 },
};

/** Effective base value after judge marks */
export function elementBV(el: SkElement): number {
  let bv = el.base;
  if (el.flags.includes("<<")) bv *= 0.5;
  else if (el.flags.includes("<")) bv *= 0.7;
  if (el.flags.includes("x")) bv *= 1.1;
  return r2(bv);
}

/** GOE = ±10% of (adjusted) BV per grade point */
export function goeValue(el: SkElement): number {
  return r2((elementBV(el) * el.goe) / 10);
}

export function elementScore(el: SkElement): number {
  return r2(elementBV(el) + goeValue(el));
}

export interface Totals {
  tes: number;
  pcsScore: number;
  deductions: number;
  total: number;
}

export function computeTotals(
  elements: SkElement[],
  pcs: Pcs,
  deds: Deds,
  discipline: Discipline,
  segment: Segment,
): Totals {
  const tes = r2(elements.reduce((s, el) => s + elementScore(el), 0));
  const pcsScore = r2((pcs.comp + pcs.pres + pcs.ss) * PCS_FACTOR[discipline][segment]);
  const deductions = r2(
    deds.falls + (deds.time ? 1 : 0) + (deds.costume ? 1 : 0) + (deds.music ? 1 : 0),
  );
  const total = r2(tes + pcsScore - deductions);
  return { tes, pcsScore, deductions, total };
}

export function countByType(elements: SkElement[]): Record<ElemType, number> {
  const c: Record<ElemType, number> = { jump: 0, spin: 0, step: 0, choreo: 0 };
  for (const el of elements) c[el.type]++;
  return c;
}

/** BV for a jump combination: 3-jump combos get 0.7 on the 2nd and 3rd jump */
export function comboBase(parts: number[]): number {
  if (parts.length === 0) return 0;
  if (parts.length <= 2) return r2(parts.reduce((a, b) => a + b, 0));
  return r2(parts[0] + parts[1] * 0.7 + parts[2] * 0.7);
}

export const uid = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

export const DISCIPLINES: Discipline[] = ["men", "ladies", "pairs", "dance"];

export function discKey(d: Discipline): "disc_men" | "disc_ladies" | "disc_pairs" | "disc_dance" {
  return ({ men: "disc_men", ladies: "disc_ladies", pairs: "disc_pairs", dance: "disc_dance" } as const)[d];
}

export function segKey(d: Discipline, s: Segment): "seg_sp" | "seg_fs" | "seg_rd" | "seg_fd" {
  if (d === "dance") return s === "sp" ? "seg_rd" : "seg_fd";
  return s === "sp" ? "seg_sp" : "seg_fs";
}
