/* Element catalog — ISU Scale of Values 2025/26 */

export interface JumpDef {
  code: string;
  bv: number;
}
export interface JumpGroup {
  key: string;
  ru: string;
  en: string;
  jumps: JumpDef[];
}

export const JUMP_GROUPS: JumpGroup[] = [
  {
    key: "axel",
    ru: "Аксель",
    en: "Axel",
    jumps: [
      { code: "1A", bv: 1.1 },
      { code: "2A", bv: 3.3 },
      { code: "3A", bv: 8.0 },
      { code: "4A", bv: 12.5 },
    ],
  },
  {
    key: "lutz",
    ru: "Лутц",
    en: "Lutz",
    jumps: [
      { code: "1Lz", bv: 0.6 },
      { code: "2Lz", bv: 2.1 },
      { code: "3Lz", bv: 5.9 },
      { code: "4Lz", bv: 11.5 },
    ],
  },
  {
    key: "flip",
    ru: "Флип",
    en: "Flip",
    jumps: [
      { code: "1F", bv: 0.5 },
      { code: "2F", bv: 1.8 },
      { code: "3F", bv: 5.3 },
      { code: "4F", bv: 11.0 },
    ],
  },
  {
    key: "loop",
    ru: "Риттбергер",
    en: "Loop",
    jumps: [
      { code: "1Lo", bv: 0.5 },
      { code: "2Lo", bv: 1.7 },
      { code: "3Lo", bv: 4.9 },
      { code: "4Lo", bv: 10.5 },
    ],
  },
  {
    key: "salchow",
    ru: "Сальхов",
    en: "Salchow",
    jumps: [
      { code: "1S", bv: 0.4 },
      { code: "2S", bv: 1.3 },
      { code: "3S", bv: 4.3 },
      { code: "4S", bv: 9.7 },
    ],
  },
  {
    key: "toe",
    ru: "Тулуп",
    en: "Toe loop",
    jumps: [
      { code: "1T", bv: 0.4 },
      { code: "2T", bv: 1.3 },
      { code: "3T", bv: 4.2 },
      { code: "4T", bv: 9.5 },
    ],
  },
];

export interface SpinDef {
  code: string;
  ru: string;
  en: string;
  levels: Record<string, number>;
}

export const SPIN_LEVEL_KEYS = ["B", "1", "2", "3", "4"];

export const SPINS: SpinDef[] = [
  {
    code: "CCoSp",
    ru: "Комбинированное вращение",
    en: "Combination spin",
    levels: { B: 2.25, "1": 2.5, "2": 2.75, "3": 3.0, "4": 3.5 },
  },
  {
    code: "FCCoSp",
    ru: "Комбинация с прыжка",
    en: "Flying combination spin",
    levels: { B: 2.25, "1": 2.5, "2": 2.75, "3": 3.0, "4": 3.5 },
  },
  {
    code: "FSSp",
    ru: "Волчок с прыжка",
    en: "Flying sit spin",
    levels: { B: 2.0, "1": 2.3, "2": 2.6, "3": 2.9, "4": 3.0 },
  },
  {
    code: "FCSp",
    ru: "«Ласточка» с прыжка",
    en: "Flying camel spin",
    levels: { B: 2.0, "1": 2.3, "2": 2.6, "3": 2.9, "4": 3.0 },
  },
  {
    code: "CSSp",
    ru: "Волчок (присед)",
    en: "Sit spin",
    levels: { B: 2.0, "1": 2.3, "2": 2.6, "3": 2.9, "4": 3.0 },
  },
  {
    code: "CSp",
    ru: "«Ласточка»",
    en: "Camel spin",
    levels: { B: 2.0, "1": 2.3, "2": 2.6, "3": 2.9, "4": 3.0 },
  },
  {
    code: "LSp",
    ru: "Заклон",
    en: "Layback spin",
    levels: { B: 1.9, "1": 2.2, "2": 2.4, "3": 2.7, "4": 3.0 },
  },
];

export const STSQ = {
  code: "StSq",
  ru: "Дорожка шагов",
  en: "Step sequence",
  levels: { B: 1.8, "1": 2.15, "2": 2.95, "3": 3.75, "4": 4.5 },
};

export const CHSQ = {
  code: "ChSq1",
  bv: 3.0,
  ru: "Хореографическая дорожка",
  en: "Choreographic sequence",
};
