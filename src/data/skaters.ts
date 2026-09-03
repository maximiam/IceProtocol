import type { Discipline } from "../lib/scoring";

export interface Country {
  code: string;
  flag: string;
  en: string;
  ru: string;
}

/* ISU member federations — for manual athlete entry */
export const COUNTRIES: Country[] = [
  { code: "JPN", flag: "🇯🇵", en: "Japan", ru: "Япония" },
  { code: "USA", flag: "🇺🇸", en: "United States", ru: "США" },
  { code: "CAN", flag: "🇨🇦", en: "Canada", ru: "Канада" },
  { code: "FRA", flag: "🇫🇷", en: "France", ru: "Франция" },
  { code: "ITA", flag: "🇮🇹", en: "Italy", ru: "Италия" },
  { code: "GER", flag: "🇩🇪", en: "Germany", ru: "Германия" },
  { code: "GBR", flag: "🇬🇧", en: "Great Britain", ru: "Великобритания" },
  { code: "ESP", flag: "🇪🇸", en: "Spain", ru: "Испания" },
  { code: "SUI", flag: "🇨🇭", en: "Switzerland", ru: "Швейцария" },
  { code: "AUT", flag: "🇦🇹", en: "Austria", ru: "Австрия" },
  { code: "NED", flag: "🇳🇱", en: "Netherlands", ru: "Нидерланды" },
  { code: "BEL", flag: "🇧🇪", en: "Belgium", ru: "Бельгия" },
  { code: "SWE", flag: "🇸🇪", en: "Sweden", ru: "Швеция" },
  { code: "FIN", flag: "🇫🇮", en: "Finland", ru: "Финляндия" },
  { code: "NOR", flag: "🇳🇴", en: "Norway", ru: "Норвегия" },
  { code: "DEN", flag: "🇩🇰", en: "Denmark", ru: "Дания" },
  { code: "POL", flag: "🇵🇱", en: "Poland", ru: "Польша" },
  { code: "CZE", flag: "🇨🇿", en: "Czechia", ru: "Чехия" },
  { code: "SVK", flag: "🇸🇰", en: "Slovakia", ru: "Словакия" },
  { code: "HUN", flag: "🇭🇺", en: "Hungary", ru: "Венгрия" },
  { code: "EST", flag: "🇪🇪", en: "Estonia", ru: "Эстония" },
  { code: "LAT", flag: "🇱🇻", en: "Latvia", ru: "Латвия" },
  { code: "LTU", flag: "🇱🇹", en: "Lithuania", ru: "Литва" },
  { code: "GEO", flag: "🇬🇪", en: "Georgia", ru: "Грузия" },
  { code: "ARM", flag: "🇦🇲", en: "Armenia", ru: "Армения" },
  { code: "AZE", flag: "🇦🇿", en: "Azerbaijan", ru: "Азербайджан" },
  { code: "KAZ", flag: "🇰🇿", en: "Kazakhstan", ru: "Казахстан" },
  { code: "UZB", flag: "🇺🇿", en: "Uzbekistan", ru: "Узбекистан" },
  { code: "KOR", flag: "🇰🇷", en: "South Korea", ru: "Южная Корея" },
  { code: "CHN", flag: "🇨🇳", en: "China", ru: "Китай" },
  { code: "AUS", flag: "🇦🇺", en: "Australia", ru: "Австралия" },
  { code: "NZL", flag: "🇳🇿", en: "New Zealand", ru: "Новая Зеландия" },
  { code: "MEX", flag: "🇲🇽", en: "Mexico", ru: "Мексика" },
  { code: "BRA", flag: "🇧🇷", en: "Brazil", ru: "Бразилия" },
  { code: "ARG", flag: "🇦🇷", en: "Argentina", ru: "Аргентина" },
  { code: "ISR", flag: "🇮🇱", en: "Israel", ru: "Израиль" },
  { code: "TUR", flag: "🇹🇷", en: "Türkiye", ru: "Турция" },
  { code: "UKR", flag: "🇺🇦", en: "Ukraine", ru: "Украина" },
  { code: "BUL", flag: "🇧🇬", en: "Bulgaria", ru: "Болгария" },
  { code: "ROU", flag: "🇷🇴", en: "Romania", ru: "Румыния" },
  { code: "SLO", flag: "🇸🇮", en: "Slovenia", ru: "Словения" },
  { code: "CRO", flag: "🇭🇷", en: "Croatia", ru: "Хорватия" },
  { code: "SRB", flag: "🇷🇸", en: "Serbia", ru: "Сербия" },
  { code: "GRE", flag: "🇬🇷", en: "Greece", ru: "Греция" },
];

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
  slug?: string; // isu-skating.com profile slug
}

/* Personal bests at ISU competitions (registry mirror of isu-skating.com) */
export const SKATERS: Skater[] = [
  { id: "malinin", name: "Ilia Malinin", ru: "Илья Малинин", country: "USA", countryRu: "США", flag: "🇺🇸", disc: "men", total: 333.81, sp: 111.29, fs: 238.24, slug: "ilia-malinin" },
  { id: "uno", name: "Shoma Uno", ru: "Сёма Уно", country: "Japan", countryRu: "Япония", flag: "🇯🇵", disc: "men", total: 312.48, sp: 105.9, fs: 206.58, slug: "shoma-uno" },
  { id: "kagiyama", name: "Yuma Kagiyama", ru: "Юма Кагияма", country: "Japan", countryRu: "Япония", flag: "🇯🇵", disc: "men", total: 310.05, sp: 108.77, fs: 212.87, slug: "yuma-kagiyama" },
  { id: "siao", name: "Adam Siao Him Fa", ru: "Адам Сяо Хим Фа", country: "France", countryRu: "Франция", flag: "🇫🇷", disc: "men", total: 301.05, slug: "adam-siao-him-fa" },
  { id: "cha", name: "Cha Junhwan", ru: "Чха Джун Хван", country: "South Korea", countryRu: "Южная Корея", flag: "🇰🇷", disc: "men", total: 296.03, sp: 99.51, fs: 196.39, slug: "junhwan-cha" },
  { id: "brown", name: "Jason Brown", ru: "Джейсон Браун", country: "USA", countryRu: "США", flag: "🇺🇸", disc: "men", total: 294.58, slug: "jason-brown" },
  { id: "shaidorov", name: "Mikhail Shaidorov", ru: "Михаил Шайдоров", country: "Kazakhstan", countryRu: "Казахстан", flag: "🇰🇿", disc: "men", total: 287.47, slug: "mikhail-shaidorov" },
  { id: "aymoz", name: "Kevin Aymoz", ru: "Кевин Аймоз", country: "France", countryRu: "Франция", flag: "🇫🇷", disc: "men", total: 282.02, slug: "kevin-aymoz" },
  { id: "kmiura", name: "Kao Miura", ru: "Као Миура", country: "Japan", countryRu: "Япония", flag: "🇯🇵", disc: "men", total: 281.53, slug: "kao-miura" },
  { id: "grassl", name: "Daniel Grassl", ru: "Даниэль Грассль", country: "Italy", countryRu: "Италия", flag: "🇮🇹", disc: "men", total: 279.5, slug: "daniel-grassl" },
  { id: "sakamoto", name: "Kaori Sakamoto", ru: "Каори Сакамото", country: "Japan", countryRu: "Япония", flag: "🇯🇵", disc: "ladies", total: 238.28, sp: 80.32, fs: 155.77, slug: "kaori-sakamoto" },
  { id: "liu", name: "Alysa Liu", ru: "Алиса Лью", country: "USA", countryRu: "США", flag: "🇺🇸", disc: "ladies", total: 222.97, slug: "alysa-liu" },
  { id: "hendrickx", name: "Loena Hendrickx", ru: "Луна Хендрикс", country: "Belgium", countryRu: "Бельгия", flag: "🇧🇪", disc: "ladies", total: 221.28, slug: "loena-hendrickx" },
  { id: "kimcy", name: "Kim Chae-Yeon", ru: "Ким Чхэ Ён", country: "South Korea", countryRu: "Южная Корея", flag: "🇰🇷", disc: "ladies", total: 220.94, slug: "chae-yeon-kim" },
  { id: "chiba", name: "Mone Chiba", ru: "Монэ Тиба", country: "Japan", countryRu: "Япония", flag: "🇯🇵", disc: "ladies", total: 214.98, slug: "mone-chiba" },
  { id: "levito", name: "Isabeau Levito", ru: "Изабо Левито", country: "USA", countryRu: "США", flag: "🇺🇸", disc: "ladies", total: 213.09, slug: "isabeau-levito" },
  { id: "yoshida", name: "Hana Yoshida", ru: "Хана Ёсида", country: "Japan", countryRu: "Япония", flag: "🇯🇵", disc: "ladies", total: 212.05, slug: "hana-yoshida" },
  { id: "kimyr", name: "Kim Ye-Lim", ru: "Ким Йе Рим", country: "South Korea", countryRu: "Южная Корея", flag: "🇰🇷", disc: "ladies", total: 209.91, slug: "ye-lim-kim" },
  { id: "gubanova", name: "Anastasiia Gubanova", ru: "Анастасия Губанова", country: "Georgia", countryRu: "Грузия", flag: "🇬🇪", disc: "ladies", total: 203.93, slug: "anastasiia-gubanova" },
  { id: "miura", name: "Miura / Kihara", ru: "Миура / Кихара", country: "Japan", countryRu: "Япония", flag: "🇯🇵", disc: "pairs", total: 221.16 },
  { id: "stellato", name: "Stellato-Dudek / Deschamps", ru: "Стеллато-Дюдек / Дешам", country: "Canada", countryRu: "Канада", flag: "🇨🇦", disc: "pairs", total: 221.56 },
  { id: "hase", name: "Hase / Volodin", ru: "Хазе / Володин", country: "Germany", countryRu: "Германия", flag: "🇩🇪", disc: "pairs", total: 219.09 },
  { id: "conti", name: "Conti / Macii", ru: "Конти / Мачии", country: "Italy", countryRu: "Италия", flag: "🇮🇹", disc: "pairs", total: 216.24 },
  { id: "chock", name: "Chock / Bates", ru: "Чок / Бейтс", country: "USA", countryRu: "США", flag: "🇺🇸", disc: "dance", total: 226.01, sp: 91.94, fs: 134.07 },
  { id: "gilles", name: "Gilles / Poirier", ru: "Гиллес / Пурье", country: "Canada", countryRu: "Канада", flag: "🇨🇦", disc: "dance", total: 219.68 },
  { id: "fear", name: "Fear / Gibson", ru: "Фир / Гибсон", country: "Great Britain", countryRu: "Великобритания", flag: "🇬🇧", disc: "dance", total: 215.75 },
];

export type Series = "gp" | "gpf" | "champ" | "jgp" | "cs" | "wtt" | "oly";

export interface FsEvent {
  id: string;
  en: string;
  ru: string;
  series: Series;
  city: string;
  cityRu: string;
  flag: string;
  start: string; // ISO
  end: string;
  season: "25/26" | "26/27";
}

/* Calendar sourced from the official ISU events page (isu-skating.com/figure-skating/events) */
export const EVENTS: FsEvent[] = [
  /* ---------- season 2025/26 ---------- */
  { id: "sc25", en: "GP Skate Canada", ru: "ГП Skate Canada", series: "gp", city: "Saskatoon", cityRu: "Саскатун", flag: "🇨🇦", start: "2025-10-24", end: "2025-10-26", season: "25/26" },
  { id: "fr25", en: "GP Grand Prix de France", ru: "ГП Франции", series: "gp", city: "Angers", cityRu: "Анже", flag: "🇫🇷", start: "2025-10-31", end: "2025-11-02", season: "25/26" },
  { id: "sa25", en: "GP Skate America", ru: "ГП Skate America", series: "gp", city: "Lake Placid", cityRu: "Лейк-Плэсид", flag: "🇺🇸", start: "2025-11-14", end: "2025-11-16", season: "25/26" },
  { id: "nhk25", en: "GP NHK Trophy", ru: "ГП NHK Trophy", series: "gp", city: "Osaka", cityRu: "Осака", flag: "🇯🇵", start: "2025-11-21", end: "2025-11-23", season: "25/26" },
  { id: "coc25", en: "GP Cup of China", ru: "ГП Cup of China", series: "gp", city: "Chongqing", cityRu: "Чунцин", flag: "🇨🇳", start: "2025-11-28", end: "2025-11-30", season: "25/26" },
  { id: "gpf25", en: "Grand Prix Final", ru: "Финал Гран-при", series: "gpf", city: "Nagoya", cityRu: "Нагоя", flag: "🇯🇵", start: "2025-12-04", end: "2025-12-07", season: "25/26" },
  { id: "ec26", en: "European Championships", ru: "Чемпионат Европы", series: "champ", city: "Sheffield", cityRu: "Шеффилд", flag: "🇬🇧", start: "2026-01-14", end: "2026-01-18", season: "25/26" },
  { id: "fc26", en: "Four Continents", ru: "Четыре континента", series: "champ", city: "Beijing", cityRu: "Пекин", flag: "🇨🇳", start: "2026-01-21", end: "2026-01-25", season: "25/26" },
  { id: "og26", en: "Olympic Winter Games", ru: "Олимпийские игры", series: "oly", city: "Milano–Cortina", cityRu: "Милан — Кортина", flag: "🇮🇹", start: "2026-02-06", end: "2026-02-19", season: "25/26" },
  { id: "wc26", en: "World Championships", ru: "Чемпионат мира", series: "champ", city: "Prague", cityRu: "Прага", flag: "🇨🇿", start: "2026-03-24", end: "2026-03-29", season: "25/26" },

  /* ---------- season 2026/27 · Challenger Series ---------- */
  { id: "cs-cran26", en: "CS Cranberry Cup International", ru: "CS Cranberry Cup", series: "cs", city: "Norwood, MA", cityRu: "Норвуд", flag: "🇺🇸", start: "2026-08-06", end: "2026-08-09", season: "26/27" },
  { id: "cs-kinoshita", en: "CS Kinoshita Group Cup", ru: "CS Kinoshita Group Cup", series: "cs", city: "Tokyo", cityRu: "Токио", flag: "🇯🇵", start: "2026-09-04", end: "2026-09-06", season: "26/27" },
  { id: "cs-nicks", en: "CS John Nicks Pairs International", ru: "CS John Nicks Pairs", series: "cs", city: "Norwood, MA", cityRu: "Норвуд", flag: "🇺🇸", start: "2026-09-11", end: "2026-09-12", season: "26/27" },
  { id: "cs-lombardia", en: "CS Lombardia Trophy", ru: "CS Lombardia Trophy", series: "cs", city: "Bergamo", cityRu: "Бергамо", flag: "🇮🇹", start: "2026-09-17", end: "2026-09-20", season: "26/27" },
  { id: "cs-nepela", en: "CS 34th Nepela Memorial", ru: "CS Мемориал Непелы", series: "cs", city: "Bratislava", cityRu: "Братислава", flag: "🇸🇰", start: "2026-09-24", end: "2026-09-27", season: "26/27" },
  { id: "cs-nebelhorn", en: "CS Nebelhorn Trophy", ru: "CS Nebelhorn Trophy", series: "cs", city: "Oberstdorf", cityRu: "Оберстдорф", flag: "🇩🇪", start: "2026-09-24", end: "2026-09-26", season: "26/27" },
  { id: "cs-trialeti", en: "CS Trialeti Trophy", ru: "CS Trialeti Trophy", series: "cs", city: "Batumi", cityRu: "Батуми", flag: "🇬🇪", start: "2026-09-30", end: "2026-10-03", season: "26/27" },
  { id: "cs-denisten", en: "CS Denis Ten Memorial", ru: "CS Мемориал Дениса Тена", series: "cs", city: "Almaty", cityRu: "Алматы", flag: "🇰🇿", start: "2026-10-07", end: "2026-10-11", season: "26/27" },
  { id: "cs-budapest", en: "CS Budapest Trophy", ru: "CS Budapest Trophy", series: "cs", city: "Budapest", cityRu: "Будапешт", flag: "🇭🇺", start: "2026-10-15", end: "2026-10-18", season: "26/27" },
  { id: "cs-tallinn", en: "CS Tallinn Trophy", ru: "CS Tallinn Trophy", series: "cs", city: "Tallinn", cityRu: "Таллин", flag: "🇪🇪", start: "2026-11-16", end: "2026-11-22", season: "26/27" },
  { id: "cs-warsaw", en: "CS PGE Warsaw Cup", ru: "CS Warsaw Cup", series: "cs", city: "Warsaw", cityRu: "Варшава", flag: "🇵🇱", start: "2026-11-25", end: "2026-11-29", season: "26/27" },

  /* ---------- season 2026/27 · Junior Grand Prix ---------- */
  { id: "jgp-xian", en: "JGP Xi'An", ru: "ЮГП Сиань", series: "jgp", city: "Xi'An", cityRu: "Сиань", flag: "🇨🇳", start: "2026-08-20", end: "2026-08-22", season: "26/27" },
  { id: "jgp-riga", en: "JGP Riga", ru: "ЮГП Рига", series: "jgp", city: "Riga", cityRu: "Рига", flag: "🇱🇻", start: "2026-08-27", end: "2026-08-29", season: "26/27" },
  { id: "jgp-bangkok", en: "JGP Bangkok", ru: "ЮГП Бангкок", series: "jgp", city: "Bangkok", cityRu: "Бангкок", flag: "🇹🇭", start: "2026-09-03", end: "2026-09-05", season: "26/27" },
  { id: "jgp-ankara", en: "JGP Ankara", ru: "ЮГП Анкара", series: "jgp", city: "Ankara", cityRu: "Анкара", flag: "🇹🇷", start: "2026-09-17", end: "2026-09-19", season: "26/27" },
  { id: "jgp-batumi", en: "JGP Batumi", ru: "ЮГП Батуми", series: "jgp", city: "Batumi", cityRu: "Батуми", flag: "🇬🇪", start: "2026-09-24", end: "2026-09-26", season: "26/27" },
  { id: "jgp-ljubljana", en: "JGP Ljubljana", ru: "ЮГП Любляна", series: "jgp", city: "Ljubljana", cityRu: "Любляна", flag: "🇸🇮", start: "2026-10-01", end: "2026-10-03", season: "26/27" },
  { id: "jgp-gdansk", en: "JGP Gdańsk", ru: "ЮГП Гданьск", series: "jgp", city: "Gdańsk", cityRu: "Гданьск", flag: "🇵🇱", start: "2026-10-08", end: "2026-10-10", season: "26/27" },

  /* ---------- season 2026/27 · Grand Prix ---------- */
  { id: "gp-france26", en: "GP Grand Prix de France", ru: "ГП Франции", series: "gp", city: "Angers", cityRu: "Анже", flag: "🇫🇷", start: "2026-10-23", end: "2026-10-25", season: "26/27" },
  { id: "gp-canada26", en: "GP Skate Canada International", ru: "ГП Skate Canada", series: "gp", city: "Kelowna, BC", cityRu: "Келоуна", flag: "🇨🇦", start: "2026-10-30", end: "2026-11-01", season: "26/27" },
  { id: "gp-china26", en: "GP Cup of China", ru: "ГП Кубок Китая", series: "gp", city: "Shenzhen", cityRu: "Шэньчжэнь", flag: "🇨🇳", start: "2026-11-06", end: "2026-11-08", season: "26/27" },
  { id: "gp-america26", en: "GP Skate America", ru: "ГП Skate America", series: "gp", city: "Everett, WA", cityRu: "Эверетт", flag: "🇺🇸", start: "2026-11-13", end: "2026-11-15", season: "26/27" },
  { id: "gp-finlandia26", en: "GP Finlandia Trophy", ru: "ГП Finlandia Trophy", series: "gp", city: "Helsinki", cityRu: "Хельсинки", flag: "🇫🇮", start: "2026-11-20", end: "2026-11-21", season: "26/27" },
  { id: "gp-nhk26", en: "GP NHK Trophy", ru: "ГП NHK Trophy", series: "gp", city: "Tokyo", cityRu: "Токио", flag: "🇯🇵", start: "2026-11-27", end: "2026-11-29", season: "26/27" },
  { id: "gpf-26", en: "Grand Prix Final", ru: "Финал Гран-при", series: "gpf", city: "Chongqing", cityRu: "Чунцин", flag: "🇨🇳", start: "2026-12-10", end: "2026-12-13", season: "26/27" },

  /* ---------- season 2026/27 · Championships ---------- */
  { id: "ec27", en: "European Championships", ru: "Чемпионат Европы", series: "champ", city: "Lausanne", cityRu: "Лозанна", flag: "🇨🇭", start: "2027-01-27", end: "2027-01-31", season: "26/27" },
  { id: "fc27", en: "Four Continents Championships", ru: "Четыре континента", series: "champ", city: "Astana", cityRu: "Астана", flag: "🇰🇿", start: "2027-02-09", end: "2027-02-14", season: "26/27" },
  { id: "jwc27", en: "World Junior Championships", ru: "Юниорский ЧМ", series: "champ", city: "Sofia", cityRu: "София", flag: "🇧🇬", start: "2027-02-24", end: "2027-02-28", season: "26/27" },
  { id: "wc27", en: "World Championships", ru: "Чемпионат мира", series: "champ", city: "Tampere", cityRu: "Тампере", flag: "🇫🇮", start: "2027-03-17", end: "2027-03-21", season: "26/27" },
  { id: "wtt27", en: "World Team Trophy", ru: "Командный ЧМ", series: "wtt", city: "Tokyo", cityRu: "Токио", flag: "🇯🇵", start: "2027-04-08", end: "2027-04-11", season: "26/27" },
];
