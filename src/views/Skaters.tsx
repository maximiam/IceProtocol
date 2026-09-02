import { useMemo, useState } from "react";
import { useApp } from "../store";
import { SKATERS, type Skater } from "../data/skaters";
import type { Discipline } from "../lib/scoring";
import { discKey, fmt } from "../lib/scoring";
import { Chip, Empty, Reveal } from "../components/ui";
import { SkaterSheet } from "../components/sheets/InfoSheets";
import { IcChevR, IcSearch, IcUsers } from "../components/icons";

type Filter = "all" | Discipline;

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
        <p className="sub">{t("pb_isu")}</p>
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
            <button className="list-row glass glass-tight" type="button" style={{ width: "100%", textAlign: "left" }} onClick={() => setSel(s)}>
              <span className="flag">{s.flag}</span>
              <div className="meta">
                <b>{lang === "ru" ? s.ru : s.name}</b>
                <span>
                  {lang === "ru" ? s.countryRu : s.country} · {t(discKey(s.disc))}
                </span>
              </div>
              <span className="score">{fmt(s.total)}</span>
              <IcChevR size={15} className="opacity-40" />
            </button>
          </Reveal>
        ))
      )}

      <SkaterSheet skater={sel} onClose={() => setSel(null)} />
    </div>
  );
}
