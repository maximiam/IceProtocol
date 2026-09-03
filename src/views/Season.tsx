import { useMemo, useState } from "react";
import { useApp, useNow } from "../store";
import { EVENTS, type FsEvent, type Series } from "../data/skaters";
import type { StrKey } from "../lib/i18n";
import { Chip, Reveal } from "../components/ui";
import { IcCalendar } from "../components/icons";

type SeasonKey = "25/26" | "26/27";
type Group = "all" | "gp" | "jgp" | "cs" | "champ";

const META: Record<Series, { key: StrKey; color: string; badge?: "gold" | "cyan" | "violet" }> = {
  gp: { key: "type_gp", color: "#b79bff", badge: "violet" },
  gpf: { key: "type_gpf", color: "#ffcf6b", badge: "gold" },
  champ: { key: "type_champ", color: "#6fe3ff", badge: "cyan" },
  oly: { key: "type_oly", color: "#ffcf6b", badge: "gold" },
  jgp: { key: "s_jgp", color: "#7bf0c2" },
  cs: { key: "s_cs", color: "#8fb3d9" },
  wtt: { key: "s_wtt", color: "#ff7f7a" },
};

const inGroup = (g: Group, s: Series) =>
  g === "all" || (g === "gp" && (s === "gp" || s === "gpf")) || (g === "jgp" && s === "jgp") || (g === "cs" && s === "cs") || (g === "champ" && (s === "champ" || s === "oly" || s === "wtt"));

export function Season() {
  const { t, lang } = useApp();
  const now = useNow(30000);
  const [season, setSeason] = useState<SeasonKey>(() => (Date.now() < +new Date("2026-03-30T00:00:00") ? "25/26" : "26/27"));
  const [group, setGroup] = useState<Group>("all");

  const events = useMemo(
    () => EVENTS.filter((e) => e.season === season && inGroup(group, e.series)).sort((a, b) => a.start.localeCompare(b.start)),
    [season, group],
  );

  const loc = lang === "ru" ? "ru-RU" : "en-GB";
  const fday = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString(loc, { day: "numeric", month: "short" });

  const range = (e: FsEvent) => {
    const a = new Date(e.start + "T12:00:00");
    const b = new Date(e.end + "T12:00:00");
    return a.getMonth() === b.getMonth()
      ? `${a.getDate()}–${fday(e.end)}`
      : `${fday(e.start)} – ${fday(e.end)}`;
  };

  const status = (e: FsEvent) => {
    const s = +new Date(e.start + "T00:00:00");
    const en = +new Date(e.end + "T23:59:59");
    if (now > en) return "done";
    if (now >= s) return "live";
    const d = Math.ceil((s - now) / 86400000);
    return d <= 0 ? "today" : d < 60 ? `in:${d}` : "soon";
  };

  return (
    <div>
      <Reveal>
        <h1 className="h1">
          {t("nav_season")} <em>{season}</em>
        </h1>
        <p className="sub">{t("season_sub")}</p>
      </Reveal>

      <Reveal delay={40}>
        <div className="seg-toggle">
          {(["25/26", "26/27"] as SeasonKey[]).map((s) => (
            <button key={s} type="button" className={season === s ? "active" : ""} onClick={() => setSeason(s)}>
              20{s}
            </button>
          ))}
        </div>
        <div className="chip-row" style={{ marginBottom: 4 }}>
          <Chip active={group === "all"} onClick={() => setGroup("all")}>
            {t("all")}
          </Chip>
          <Chip active={group === "gp"} onClick={() => setGroup("gp")}>
            {t("f_gp")}
          </Chip>
          <Chip active={group === "jgp"} onClick={() => setGroup("jgp")}>
            {t("f_jgp")}
          </Chip>
          <Chip active={group === "cs"} onClick={() => setGroup("cs")}>
            {t("f_cs")}
          </Chip>
          <Chip active={group === "champ"} onClick={() => setGroup("champ")}>
            {t("f_champ")}
          </Chip>
        </div>
        <div style={{ fontSize: 11, color: "var(--mist-dim)", margin: "8px 4px 12px" }}>
          {events.length} · {t("events_word")}
        </div>
      </Reveal>

      <div style={{ position: "relative", paddingLeft: 18 }}>
        <div style={{ position: "absolute", left: 5, top: 10, bottom: 10, width: 2, borderRadius: 2, background: "var(--glass-3)" }} />
        {events.map((e, i) => {
          const m = META[e.series];
          const st = status(e);
          return (
            <Reveal key={e.id} delay={Math.min(i * 30, 240)}>
              <div style={{ position: "relative", marginBottom: 9 }}>
                <span
                  className={st === "live" ? "rec-dot" : ""}
                  style={{
                    position: "absolute",
                    left: -17,
                    top: 22,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: m.color,
                    boxShadow: `0 0 0 3px var(--ink)`,
                    animation: st === "live" ? "pulse 1.1s infinite" : undefined,
                  }}
                />
                <div className="list-row glass glass-tight" style={{ opacity: st === "done" ? 0.55 : 1, marginBottom: 0 }}>
                  <div className="ev-date" style={{ minWidth: 56, flexShrink: 0, fontSize: 11, fontWeight: 800, color: "var(--mist)", lineHeight: 1.3 }}>
                    {range(e)}
                  </div>
                  <span className="flag" style={{ fontSize: 17 }}>{e.flag}</span>
                  <div className="meta">
                    <b style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      {lang === "ru" ? e.ru : e.en}
                      <span className={`badge ${m.badge ?? ""}`} style={m.badge ? undefined : { color: m.color, borderColor: `${m.color}55` }}>
                        {t(m.key)}
                      </span>
                    </b>
                    <span>
                      {lang === "ru" ? e.cityRu : e.city}
                    </span>
                  </div>
                  {st === "done" ? (
                    <span className="badge">{t("finished")}</span>
                  ) : st === "live" ? (
                    <span className="badge" style={{ color: "var(--ember)", borderColor: "rgba(255,127,122,.5)" }}>
                      {t("live_now")}
                    </span>
                  ) : st === "today" ? (
                    <span className="badge cyan">{t("today_word")}</span>
                  ) : st.startsWith("in:") ? (
                    <span className="badge cyan">{t("in_days").replace("{n}", st.slice(3))}</span>
                  ) : (
                    <span className="badge">{t("upcoming")}</span>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="glass glass-tight" style={{ textAlign: "center", padding: "30px 20px", color: "var(--mist-dim)" }}>
          <IcCalendar size={32} />
          <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: "var(--mist)" }}>{t("no_results")}</div>
        </div>
      )}

      <a
        className="btn ghost sm"
        href="https://isu-skating.com/figure-skating/events/"
        target="_blank"
        rel="noreferrer"
        style={{ display: "flex", margin: "10px auto 0", textDecoration: "none" }}
      >
        <IcCalendar size={14} />
        {t("official_calendar")}
      </a>
    </div>
  );
}
