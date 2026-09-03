import { useMemo, useState } from "react";
import { Sheet } from "../ui";
import { useApp } from "../../store";
import { COUNTRIES, EVENTS, SKATERS } from "../../data/skaters";
import { discKey, fmt } from "../../lib/scoring";
import { IcCheck, IcPlus, IcSearch } from "../icons";

/* ================= competition picker ================= */
export function CompSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang, draft, patchDraft, buzz } = useApp();
  const [custom, setCustom] = useState("");
  const loc = lang === "ru" ? "ru-RU" : "en-GB";
  const fday = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString(loc, { day: "numeric", month: "short" });

  const sorted = useMemo(() => [...EVENTS].sort((a, b) => b.start.localeCompare(a.start)), []);

  const useCustom = () => {
    const v = custom.trim();
    if (!v) return;
    patchDraft({ competition: v });
    buzz("medium");
    setCustom("");
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={t("comp_label")} sub={t("comp_pick_sub")}>
      <div className="field-label">{t("comp_custom")}</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
        <input className="input" placeholder={t("comp_custom_ph")} value={custom} onChange={(e) => setCustom(e.target.value)} />
        <button className="btn sm" type="button" style={{ width: "auto", flexShrink: 0 }} disabled={!custom.trim()} onClick={useCustom}>
          {t("comp_use")}
        </button>
      </div>

      <div className="cat-title">{t("comp_official")}</div>
      {sorted.map((e) => {
        const label = lang === "ru" ? e.ru : e.en;
        const active = draft.competition === label;
        return (
          <button
            key={e.id}
            className="list-row glass glass-tight"
            type="button"
            style={{ width: "100%", textAlign: "left", borderColor: active ? "rgba(111,227,255,.55)" : undefined, background: active ? "rgba(111,227,255,.07)" : undefined }}
            onClick={() => {
              patchDraft({ competition: label });
              buzz("medium");
              onClose();
            }}
          >
            <span className="flag" style={{ fontSize: 17 }}>{e.flag}</span>
            <div className="meta">
              <b>{label}</b>
              <span>
                {lang === "ru" ? e.cityRu : e.city} · {fday(e.start)} – {fday(e.end)} · 20{e.season}
              </span>
            </div>
            {active && <IcCheck size={16} className="opacity-40" />}
          </button>
        );
      })}
    </Sheet>
  );
}

/* ================= skater picker ================= */
export function SkaterPickSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang, patchDraft, buzz, showToast } = useApp();
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return SKATERS;
    return SKATERS.filter((s) => [s.name, s.ru, s.country, s.countryRu].some((v) => v.toLowerCase().includes(n)));
  }, [q]);

  const addManual = () => {
    if (!name.trim()) {
      showToast(t("need_name"));
      buzz("error");
      return;
    }
    const c = COUNTRIES.find((x) => x.code === code);
    if (!c) {
      showToast(t("need_country"));
      buzz("error");
      return;
    }
    patchDraft({ athlete: { name: name.trim(), country: c.code, flag: c.flag } });
    buzz("medium");
    showToast(t("athlete_added"));
    setName("");
    setCode("");
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={t("athlete")} sub={t("skater_from_isu")}>
      <div className="field-label">{t("manual_skater")}</div>
      <div className="glass glass-tight" style={{ padding: 12, marginBottom: 4 }}>
        <input className="input" placeholder={t("athlete_ph")} value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 8 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <select className="select" value={code} onChange={(e) => setCode(e.target.value)}>
            <option value="">{t("country_ph")}</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {lang === "ru" ? c.ru : c.en} · {c.code}
              </option>
            ))}
          </select>
          <button className="btn sm" type="button" style={{ width: "auto", flexShrink: 0 }} onClick={addManual} aria-label={t("add_athlete")}>
            <IcPlus size={14} />
          </button>
        </div>
        <div style={{ fontSize: 10.5, color: "var(--mist-dim)", marginTop: 7 }}>{t("add_athlete")} · {t("need_country").toLowerCase()}</div>
      </div>

      <div className="cat-title">{t("skater_from_isu")}</div>
      <div className="search-wrap">
        <IcSearch />
        <input className="input" placeholder={t("search_ph")} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {filtered.length === 0 && <div style={{ fontSize: 12, color: "var(--mist-dim)", padding: "8px 4px" }}>{t("no_results")}</div>}
      {filtered.map((s) => (
        <button
          key={s.id}
          className="list-row glass glass-tight"
          type="button"
          style={{ width: "100%", textAlign: "left" }}
          onClick={() => {
            patchDraft({ athlete: { name: lang === "ru" ? s.ru : s.name, country: s.country, flag: s.flag } });
            buzz("medium");
            showToast(t("athlete_added"));
            onClose();
          }}
        >
          <span className="flag" style={{ fontSize: 17 }}>{s.flag}</span>
          <div className="meta">
            <b>{lang === "ru" ? s.ru : s.name}</b>
            <span>
              {lang === "ru" ? s.countryRu : s.country} · {t(discKey(s.disc))}
            </span>
          </div>
          <span className="score" style={{ fontSize: 14 }}>{fmt(s.total)}</span>
        </button>
      ))}
    </Sheet>
  );
}
