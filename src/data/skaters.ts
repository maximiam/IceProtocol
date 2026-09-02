import type { Discipline } from "../lib/scoring";

export interface Skater {
  id: string;
  name: string;
  ru: string;
  country: string;
  countryRu: string;
  flag: string;
  disc: Discipline;
  total: number;
  sp?: number;
  fs?: number;
}

/* Personal bests at ISU competitions (top totals; sp/fs where recorded) */
export const SKATERS: Skater[] = [
  { id: "malinin", name: "Ilia Malinin", ru: "Илья Малинин", country: "USA", countryRu: "США", flag: "🇺🇸", disc: "men", total: 333.81, sp: 111.29, fs: 238.24 },
  { id: "uno", name: "Shoma Uno", ru: "Сёма Уно", country: "Japan", countryRu: "Япония", flag: "🇯🇵", disc: "men", total: 312.48, sp: 105.9, fs: 206.58 },
  { id: "kagiyama", name: "Yuma Kagiyama", ru: "Юма Кагияма", country: "Japan", countryRu: "Япония", flag: "🇯🇵", disc: "men", total: 310.05, sp: 108.77, fs: 212.87 },
  { id: "siao", name: "Adam Siao Him Fa", ru: "Адам Сяо Хим Фа", country: "France", countryRu: "Франция", flag: "🇫🇷", disc: "men", total: 301.05 },
  { id: "brown", name: "Jason Brown", ru: "Джейсон Браун", country: "USA", countryRu: "США", flag: "🇺🇸", disc: "men", total: 294.58 },
  { id: "shaidorov", name: "Mikhail Shaidorov", ru: "Михаил Шайдоров", country: "Kazakhstan", countryRu: "Казахстан", flag: "🇰🇿", disc: "men", total: 287.47 },
  { id: "sakamoto", name: "Kaori Sakamoto", ru: "Каори Сакамото", country: "Japan", countryRu: "Япония", flag: "🇯🇵", disc: "ladies", total: 238.28, sp: 80.32, fs: 155.77 },
  { id: "liu", name: "Alysa Liu", ru: "Алиса Лью", country: "USA", countryRu: "США", flag: "🇺🇸", disc: "ladies", total: 222.97 },
  { id: "hendrickx", name: "Loena Hendrickx", ru: "Луна Хендрикс", country: "Belgium", countryRu: "Бельгия", flag: "🇧🇪", disc: "ladies", total: 221.28 },
  { id: "levito", name: "Isabeau Levito", ru: "Изабо Левито", country: "USA", countryRu: "США", flag: "🇺🇸", disc: "ladies", total: 213.09 },
  { id: "yoshida", name: "Hana Yoshida", ru: "Хана Ёсида", country: "Japan", countryRu: "Япония", flag: "🇯🇵", disc: "ladies", total: 212.05 },
  { id: "miura", name: "Miura / Kihara", ru: "Миура / Кихара", country: "Japan", countryRu: "Япония", flag: "🇯🇵", disc: "pairs", total: 221.16 },
  { id: "hase", name: "Hase / Volodin", ru: "Хазе / Володин", country: "Germany", countryRu: "Германия", flag: "🇩🇪", disc: "pairs", total: 219.09 },
  { id: "chock", name: "Chock / Bates", ru: "Чок / Бейтс", country: "USA", countryRu: "США", flag: "🇺🇸", disc: "dance", total: 226.01, sp: 91.94, fs: 134.07 },
  { id: "gilles", name: "Gilles / Poirier", ru: "Гиллес / Пурье", country: "Canada", countryRu: "Канада", flag: "🇨🇦", disc: "dance", total: 219.68 },
  { id: "fear", name: "Fear / Gibson", ru: "Фир / Гибсон", country: "Great Britain", countryRu: "Великобритания", flag: "🇬🇧", disc: "dance", total: 215.75 },
];

export interface FsEvent {
  id: string;
  en: string;
  ru: string;
  type: "gp" | "gpf" | "champ" | "oly";
  city: string;
  cityRu: string;
  flag: string;
  start: string; // ISO date
  end: string;
  nextSeason?: boolean;
}

export const EVENTS: FsEvent[] = [
  { id: "sc25", en: "GP Skate Canada", ru: "ГП Skate Canada", type: "gp", city: "Saskatoon", cityRu: "Саскатун", flag: "🇨🇦", start: "2025-10-24", end: "2025-10-26" },
  { id: "fr25", en: "GP Grand Prix de France", ru: "ГП Франции", type: "gp", city: "Angers", cityRu: "Анже", flag: "🇫🇷", start: "2025-10-31", end: "2025-11-02" },
  { id: "sa25", en: "GP Skate America", ru: "ГП Skate America", type: "gp", city: "Lake Placid", cityRu: "Лейк-Плэсид", flag: "🇺🇸", start: "2025-11-14", end: "2025-11-16" },
  { id: "nhk25", en: "GP NHK Trophy", ru: "ГП NHK Trophy", type: "gp", city: "Osaka", cityRu: "Осака", flag: "🇯🇵", start: "2025-11-21", end: "2025-11-23" },
  { id: "coc25", en: "GP Cup of China", ru: "ГП Cup of China", type: "gp", city: "Chongqing", cityRu: "Чунцин", flag: "🇨🇳", start: "2025-11-28", end: "2025-11-30" },
  { id: "gpf25", en: "Grand Prix Final", ru: "Финал Гран-при", type: "gpf", city: "Nagoya", cityRu: "Нагоя", flag: "🇯🇵", start: "2025-12-04", end: "2025-12-07" },
  { id: "ec26", en: "European Championships", ru: "Чемпионат Европы", type: "champ", city: "Sheffield", cityRu: "Шеффилд", flag: "🇬🇧", start: "2026-01-14", end: "2026-01-18" },
  { id: "fc26", en: "Four Continents", ru: "Четыре континента", type: "champ", city: "Beijing", cityRu: "Пекин", flag: "🇨🇳", start: "2026-01-21", end: "2026-01-25" },
  { id: "og26", en: "Olympic Winter Games", ru: "Олимпийские игры", type: "oly", city: "Milano–Cortina", cityRu: "Милан — Кортина", flag: "🇮🇹", start: "2026-02-06", end: "2026-02-19" },
  { id: "wc26", en: "World Championships", ru: "Чемпионат мира", type: "champ", city: "Prague", cityRu: "Прага", flag: "🇨🇿", start: "2026-03-24", end: "2026-03-29" },
  { id: "fr26", en: "GP Grand Prix de France", ru: "ГП Франции", type: "gp", city: "Angers", cityRu: "Анже", flag: "🇫🇷", start: "2026-10-23", end: "2026-10-25", nextSeason: true },
];
