import { useMemo, useState } from "react";
import { useApp } from "../store";
import { SKATERS, type Skater } from "../data/skaters";
import type { Discipline } from "../lib/scoring";
import { discKey, fmt } from "../lib/scoring";
import { Chip, Empty, Reveal } from "../components/ui";
import { SkaterSheet } from "../components/sheets/InfoSheets";
import { IcChevR, IcSearch, IcUsers } from "../components/icons";

type Filter = "all" | Discipline;

/* ISU CDN portrait with graceful fallback chain: 2025/26 season → 2024/25 → initials */
function SkaterPhoto({ s, size = 44 }: { s: Skater; size?: number }) {
  const [st, setSt] = useState(0);
  const init = s.name
    .split(/[\s/]+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (!s.slug || st > 1) {
    return (
      <div className="avatar" style={{ width: size, height: size, borderRadius: 13, fontSize: 13, flexShrink: 0 }}>
        {init}
      </div>
    );
  }
  const season = st === 0 ? "2025-2026" : "2024-2025";
  return (
    <img
      src={`https://isu-d8g8b4b7ece7aphs.a03.azurefd.net/isudamcontainer/CMS/Fansite/Figure-Skating/${season}/Skater-Portraits/${s.slug}.jpg`}
      onError={() => setSt((x) => x + 1)}
      alt={s.name}
      style={{ width: size, height: size, borderRadius: 13, objectFit: "cover", flexShrink: 0, background: "var(--glass-2)" }}
    />
  );
}

export function Skaters() {
  const { t, lang } = useApp();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sel, setSel] = useState<Skater | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return SKATERS.filter((s) => {
      if (filter !== "all" && s.disc !== filter) return false;
      if (!needle) return true;
      return [s.name, s.ru, s.country, s.countryRu].some((v) => v.toLowerCase().includes(needle));
    });
  }, [q, filter]);

  return (
    <div>
      <Reveal>
        <h1 className="h1">
          {t("nav_skaters")} <em>ISU</em>
        </h1>
        <p className="sub">{t("pb_note")}</p>
      </Reveal>

      <Reveal delay={50}>
        <div className="search-wrap">
          <IcSearch />
          <input className="input" placeholder={t("search_ph")} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="chip-row" style={{ marginBottom: 6 }}>
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>
            {t("all")}
          </Chip>
          {(["men", "ladies", "pairs", "dance"] as Discipline[]).map((d) => (
            <Chip key={d} active={filter === d} onClick={() => setFilter(d)}>
              {t(discKey(d))}
            </Chip>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--mist-dim)", margin: "8px 4px 10px" }}>
          {filtered.length} · {t("found")}
        </div>
      </Reveal>

      {filtered.length === 0 ? (
        <div className="glass glass-tight">
          <Empty icon={<IcUsers size={38} />} title={t("no_results")} sub={t("no_results_sub")} />
        </div>
      ) : (
        filtered.map((s, i) => (
          <Reveal key={s.id} delay={Math.min(i * 35, 280)}>
            <div className="list-row glass glass-tight" style={{ cursor: "pointer" }} onClick={() => setSel(s)}>
              <SkaterPhoto s={s} />
              <div className="meta">
                <b>{lang === "ru" ? s.ru : s.name}</b>
                <span>
                  {s.flag} {lang === "ru" ? s.countryRu : s.country} · {t(discKey(s.disc))}
                </span>
              </div>
              <span className="score">{fmt(s.total)}</span>
              {s.slug && (
                <a
                  className="badge cyan"
                  href={`https://isu-skating.com/figure-skating/skaters/${s.slug}/`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ textDecoration: "none", flexShrink: 0 }}
                >
                  ISU
                </a>
              )}
              <IcChevR size={15} className="opacity-40" />
            </div>
          </Reveal>
        ))
      )}

      <a
        className="btn ghost sm"
        href="https://isu-skating.com/figure-skating/skaters/"
        target="_blank"
        rel="noreferrer"
        style={{ display: "flex", margin: "12px auto 0", textDecoration: "none" }}
      >
        <IcUsers size={14} />
        {t("isu_registry")}
      </a>

      <SkaterSheet skater={sel} onClose={() => setSel(null)} />
    </div>
  );
}
