/* ============================================================
   FS JUDGE — ISU scoring engine (rules 2025/26)
   Disciplines: singles (senior/junior split by class), pairs &
   dance with explicit Senior/Junior category. The required
   element content differs by category.
   ============================================================ */

export type Discipline = "men" | "jmen" | "ladies" | "jladies" | "pairs" | "dance";
export type Category = "senior" | "junior";
export type Segment = "sp" | "fs";
export type ElemType = "jump" | "lift" | "spin" | "step" | "choreo";

export interface SkElement {
  id: string;
  type: ElemType;
  code: string; // "3Lz+3T", "CCoSp4", "5ALi4", "StSq3", "ChSq1"
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
  category?: Category;
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

export const ALL_DISCIPLINES: Discipline[] = ["men", "jmen", "ladies", "jladies", "pairs", "dance"];
export const SINGLES: Discipline[] = ["men", "jmen", "ladies", "jladies"];

/** PCS factor group: junior men use men factors, junior ladies & pairs use ladies factors */
export function factorGroup(d: Discipline): "men" | "ladies" | "dance" {
  if (d === "men" || d === "jmen") return "men";
  if (d === "pairs" || d === "ladies" || d === "jladies") return "ladies";
  return "dance";
}

/** For singles the category is implied by the class (Юноши/Девушки = Junior) */
export function categoryOf(d: Discipline, explicit?: Category): Category {
  if (d === "jmen" || d === "jladies") return "junior";
  if (d === "men" || d === "ladies") return "senior";
  return explicit ?? "senior";
}

export const PCS_FACTOR: Record<"men" | "ladies" | "dance", Record<Segment, number>> = {
  men: { sp: 1.67, fs: 3.33 },
  ladies: { sp: 1.33, fs: 2.67 },
  dance: { sp: 1.33, fs: 2.0 },
};

export type SlotSet = Record<ElemType, number>;

const SINGLES_SP: SlotSet = { jump: 3, lift: 0, spin: 3, step: 1, choreo: 0 };
const SINGLES_FS: SlotSet = { jump: 7, lift: 0, spin: 3, step: 1, choreo: 1 };
const PAIRS_SP: SlotSet = { jump: 3, lift: 1, spin: 2, step: 1, choreo: 0 };
const PAIRS_FS_SR: SlotSet = { jump: 5, lift: 3, spin: 2, step: 1, choreo: 1 };
const PAIRS_FS_JR: SlotSet = { jump: 4, lift: 3, spin: 2, step: 1, choreo: 1 };
const RD_SR: SlotSet = { jump: 0, lift: 0, spin: 2, step: 3, choreo: 1 };
const RD_JR: SlotSet = { jump: 0, lift: 0, spin: 2, step: 2, choreo: 0 };
const FD_SR: SlotSet = { jump: 0, lift: 4, spin: 2, step: 2, choreo: 2 };
const FD_JR: SlotSet = { jump: 0, lift: 3, spin: 2, step: 2, choreo: 1 };

/** Required element slots per discipline / segment / category (ISU well-balanced program, simplified for training) */
export function getLimits(disc: Discipline, seg: Segment, cat: Category): SlotSet {
  if (disc === "pairs") return seg === "sp" ? PAIRS_SP : cat === "junior" ? PAIRS_FS_JR : PAIRS_FS_SR;
  if (disc === "dance") return seg === "sp" ? (cat === "junior" ? RD_JR : RD_SR) : cat === "junior" ? FD_JR : FD_SR;
  return seg === "sp" ? SINGLES_SP : SINGLES_FS;
}

export const SLOT_ORDER: ElemType[] = ["jump", "lift", "spin", "step", "choreo"];

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
  const pcsScore = r2((pcs.comp + pcs.pres + pcs.ss) * PCS_FACTOR[factorGroup(discipline)][segment]);
  const deductions = r2(
    deds.falls + (deds.time ? 1 : 0) + (deds.costume ? 1 : 0) + (deds.music ? 1 : 0),
  );
  const total = r2(tes + pcsScore - deductions);
  return { tes, pcsScore, deductions, total };
}

export function countByType(elements: SkElement[]): SlotSet {
  const c: SlotSet = { jump: 0, lift: 0, spin: 0, step: 0, choreo: 0 };
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

export function discKey(d: Discipline): "disc_men" | "disc_jmen" | "disc_ladies" | "disc_jladies" | "disc_pairs" | "disc_dance" {
  return (
    {
      men: "disc_men",
      jmen: "disc_jmen",
      ladies: "disc_ladies",
      jladies: "disc_jladies",
      pairs: "disc_pairs",
      dance: "disc_dance",
    } as const
  )[d];
}

export function segKey(d: Discipline, s: Segment): "seg_sp" | "seg_fs" | "seg_rd" | "seg_fd" {
  if (d === "dance") return s === "sp" ? "seg_rd" : "seg_fd";
  return s === "sp" ? "seg_sp" : "seg_fs";
}

export function catKey(c: Category): "cat_senior" | "cat_junior" {
  return c === "junior" ? "cat_junior" : "cat_senior";
}
