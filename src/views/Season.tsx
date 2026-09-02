import { useMemo } from "react";
import { useApp, useNow } from "../store";
import { EVENTS, type FsEvent } from "../data/skaters";
import { Chip, Reveal, SectionLabel } from "../components/ui";
import { IcClock, IcMedal } from "../components/icons";

const TYPE_BADGE: Record<FsEvent["type"], string> = {
  gp: "cyan",
  gpf: "violet",
  champ: "gold",
  oly: "ember",
};

export function Season() {
  const { t, lang } = useApp();
  const now = useNow(1000);

  const next = useMemo(() => EVENTS.find((e) => new Date(e.end + "T23:59:59").getTime() >= now), [now]);
  const diff = next ? Math.max(0, new Date(next.start + "T00:00:00").getTime() - now) : 0;
  const dd = Math.floor(diff / 86400000);

  const status = (e: FsEvent): "past" | "live" | "future" => {
    const s = new Date(e.start + "T00:00:00").getTime();
    const en = new Date(e.end + "T23:59:59").getTime();
    if (now > en) return "past";
    if (now >= s) return "live";
    return "future";
  };

  const dateLabel = (e: FsEvent) => {
    const s = new Date(e.start + "T00:00:00");
    const en = new Date(e.end + "T00:00:00");
    const mFmt = (d: Date) => d.toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB", { day: "numeric", month: "short" });
    return `${mFmt(s)} – ${mFmt(en)}`;
  };

  return (
    <div>
      <Reveal>
        <h1 className="h1">
          {t("season_title")} <em>·</em>
        </h1>
        <p className="sub">{t("season_sub")}</p>
      </Reveal>

      {next && (
        <Reveal delay={50}>
          <div className="glass" style={{ padding: "15px 17px", marginBottom: 6, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -20, top: -26, opacity: 0.13, pointerEvents: "none" }}>
              <IcMedal size={110} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 10.5, fontWeight: 800, color: "var(--mist-dim)", textTransform: "uppercase", letterSpacing: 0.6 }}>
              <IcClock size={13} />
              {t("next_start")}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18.5, marginTop: 5, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="flag">{next.flag}</span>
              {lang === "ru" ? next.ru : next.en}
            </div>
            <div style={{ fontSize: 12, color: "var(--mist-dim)", marginTop: 2 }}>
              {lang === "ru" ? next.cityRu : next.city} · {dateLabel(next)}
              {now < new Date(next.start + "T00:00:00").getTime() && (
                <span className="badge cyan" style={{ marginLeft: 8 }}>
                  −{dd} {t("d_days")}
                </span>
              )}
            </div>
          </div>
        </Reveal>
      )}

      <SectionLabel>{t("season_title")}</SectionLabel>

      {EVENTS.map((e, i) => {
        const st = status(e);
        return (
          <Reveal key={e.id} delay={Math.min(i * 40, 320)}>
            <div className="event-row glass glass-tight" style={{ opacity: st === "past" ? 0.62 : 1 }}>
              <div className="event-date">
                <b>
                  {new Date(e.start + "T00:00:00").toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB", { day: "numeric" })}
                </b>
                <span>
                  {new Date(e.start + "T00:00:00").toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB", { month: "short" })}
                </span>
              </div>
              <div className="event-meta">
                <b style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                  {lang === "ru" ? e.ru : e.en}
                  {e.nextSeason && <span className="badge">{t("next_season")}</span>}
                </b>
                <span>
                  <span className="flag" style={{ fontSize: 13 }}>
                    {e.flag}
                  </span>
                  {lang === "ru" ? e.cityRu : e.city} · {dateLabel(e)}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
                <span className={`badge ${TYPE_BADGE[e.type]}`}>{t(({ gp: "type_gp", gpf: "type_gpf", champ: "type_champ", oly: "type_oly" } as const)[e.type])}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--mist-dim)" }}>
                  <span
                    className={`status-dot ${st === "live" ? "pulse-dot" : ""}`}
                    style={{ background: st === "live" ? "var(--ember)" : st === "future" ? "var(--cyan)" : "var(--mist-dim)" }}
                  />
                  {st === "past" ? t("finished") : st === "live" ? t("live_now") : t("upcoming")}
                </span>
              </div>
            </div>
          </Reveal>
        );
      })}
      <div style={{ height: 4 }} />
    </div>
  );
}
