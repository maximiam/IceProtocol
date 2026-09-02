import { useMemo, useState } from "react";
import { useApp, useNow } from "../store";
import { Telegram } from "../lib/telegram";
import { EVENTS } from "../data/skaters";
import type { Discipline, Protocol, Segment } from "../lib/scoring";
import { DISCIPLINES, discKey, fmt, segKey } from "../lib/scoring";
import { Chip, Empty, Reveal, SectionLabel } from "../components/ui";
import { ProtocolSheet, RulesSheet } from "../components/sheets/InfoSheets";
import { IcBook, IcCalendar, IcChevR, IcClock, IcJudge, IcMedal, IcUsers } from "../components/icons";

function greetingKey(h: number): "g_morning" | "g_afternoon" | "g_evening" | "g_night" {
  if (h < 5) return "g_night";
  if (h < 12) return "g_morning";
  if (h < 18) return "g_afternoon";
  return "g_evening";
}

export function Home() {
  const { t, lang, setView, patchDraft, draft, protocols } = useApp();
  const now = useNow(1000);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [selProto, setSelProto] = useState<Protocol | null>(null);

  const user = Telegram.user;
  const firstName = user?.first_name ?? (lang === "ru" ? "Судья" : "Judge");
  const dateLine = new Date(now).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const nextEvent = useMemo(() => EVENTS.find((e) => new Date(e.end + "T23:59:59").getTime() >= now), [now]);
  const evStart = nextEvent ? new Date(nextEvent.start + "T00:00:00").getTime() : 0;
  const isLive = nextEvent ? now >= evStart : false;
  const diff = Math.max(0, evStart - now);
  const dd = Math.floor(diff / 86400000);
  const hh = Math.floor((diff % 86400000) / 3600000);
  const mm = Math.floor((diff % 3600000) / 60000);
  const ss = Math.floor((diff % 60000) / 1000);

  const totalElements = protocols.reduce((s, p) => s + p.elements.length, 0);
  const allGoe = protocols.flatMap((p) => p.elements.map((e) => e.goe));
  const avgGoe = allGoe.length ? allGoe.reduce((a, b) => a + b, 0) / allGoe.length : null;

  const startProtocol = (discipline: Discipline, segment: Segment) => {
    patchDraft({ discipline, segment });
    setView("studio");
  };

  return (
    <div>
      <Reveal>
        <p className="sub" style={{ margin: "2px 4px 0", fontSize: 12, textTransform: "capitalize" }}>
          {dateLine}
        </p>
        <h1 className="h1">
          {t(greetingKey(new Date(now).getHours()))}, <em>{firstName}</em>
        </h1>
      </Reveal>

      {/* next start countdown */}
      <Reveal delay={60}>
        <div className="glass" style={{ padding: "16px 18px 16px", marginTop: 14, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -24, top: -30, opacity: 0.14, pointerEvents: "none" }}>
            <IcMedal size={130} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 800, color: "var(--mist-dim)", textTransform: "uppercase", letterSpacing: 0.6 }}>
            <IcClock size={13} />
            {t("next_start")}
          </div>
          {nextEvent ? (
            <>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, marginTop: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span className="flag">{nextEvent.flag}</span>
                {lang === "ru" ? nextEvent.ru : nextEvent.en}
                {isLive && (
                  <span className="badge ember" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <span className="status-dot pulse-dot" style={{ background: "var(--ember)", width: 6, height: 6 }} />
                    {t("live_now")}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "var(--mist-dim)", marginTop: 2 }}>
                {lang === "ru" ? nextEvent.cityRu : nextEvent.city}
              </div>
              {!isLive && (
                <div className="cd-grid">
                  {(
                    [
                      [dd, t("d_days")],
                      [hh, t("d_hours")],
                      [mm, t("d_min")],
                      [ss, t("d_sec")],
                    ] as const
                  ).map(([v, label], i) => (
                    <div className="cd-cell" key={i}>
                      <b key={v}>{String(v).padStart(2, "0")}</b>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="sub" style={{ margin: "8px 0 0" }}>
              {t("season_over")}
            </p>
          )}
        </div>
      </Reveal>

      {/* new protocol setup */}
      <Reveal delay={110}>
        <SectionLabel>{t("new_protocol")}</SectionLabel>
        <div className="glass" style={{ padding: 16 }}>
          <div className="field-label">{t("discipline")}</div>
          <div className="chip-row" style={{ marginBottom: 14 }}>
            {DISCIPLINES.map((d) => (
              <Chip key={d} active={draft.discipline === d} onClick={() => patchDraft({ discipline: d })}>
                {t(discKey(d))}
              </Chip>
            ))}
          </div>
          <div className="field-label">{t("segment")}</div>
          <div className="seg-toggle" style={{ marginBottom: 16 }}>
            <button type="button" className={draft.segment === "sp" ? "active" : ""} onClick={() => patchDraft({ segment: "sp" })}>
              {t(segKey(draft.discipline, "sp"))}
            </button>
            <button type="button" className={draft.segment === "fs" ? "active" : ""} onClick={() => patchDraft({ segment: "fs" })}>
              {t(segKey(draft.discipline, "fs"))}
            </button>
          </div>
          <button className="btn" type="button" onClick={() => startProtocol(draft.discipline, draft.segment)}>
            <IcJudge size={16} />
            {t("open_studio")}
          </button>
        </div>
      </Reveal>

      {/* stats strip */}
      <Reveal delay={150}>
        <div className="glass glass-tight stat-strip" style={{ marginTop: 12 }}>
          <div>
            <b>{protocols.length}</b>
            <span>{t("st_protocols")}</span>
          </div>
          <div>
            <b>{totalElements}</b>
            <span>{t("st_elements")}</span>
          </div>
          <div>
            <b style={{ color: avgGoe != null && avgGoe > 0 ? "var(--mint)" : avgGoe != null ? "var(--ember)" : undefined }}>
              {avgGoe == null ? "—" : `${avgGoe > 0 ? "+" : ""}${avgGoe.toFixed(2)}`}
            </b>
            <span>{t("st_avg_goe")}</span>
          </div>
        </div>
      </Reveal>

      {/* quick actions */}
      <Reveal delay={190}>
        <div className="quick-grid" style={{ marginTop: 12 }}>
          <button className="quick-tile glass wide" type="button" onClick={() => setRulesOpen(true)}>
            <div className="qi">
              <IcBook />
            </div>
            <div style={{ flex: 1 }}>
              <b>{t("quick_ref")}</b>
              <span>{t("quick_ref_sub")}</span>
            </div>
            <IcChevR size={16} className="opacity-40" />
          </button>
          <button className="quick-tile glass" type="button" onClick={() => setView("skaters")}>
            <div className="qi">
              <IcUsers />
            </div>
            <div>
              <b>{t("quick_skaters")}</b>
              <span>{t("quick_skaters_sub")}</span>
            </div>
          </button>
          <button className="quick-tile glass" type="button" onClick={() => setView("season")}>
            <div className="qi" style={{ color: "var(--gold)" }}>
              <IcCalendar />
            </div>
            <div>
              <b>{t("quick_season")}</b>
              <span>{t("quick_season_sub")}</span>
            </div>
          </button>
        </div>
      </Reveal>

      {/* recent protocols */}
      <Reveal delay={230}>
        <SectionLabel>{t("recent")}</SectionLabel>
        {protocols.length === 0 ? (
          <div className="glass glass-tight">
            <Empty icon={<IcJudge size={38} />} title={t("no_recent")} sub={t("no_recent_sub")} />
          </div>
        ) : (
          protocols.slice(0, 3).map((p) => (
            <button key={p.id} className="list-row glass glass-tight" type="button" style={{ width: "100%", textAlign: "left" }} onClick={() => setSelProto(p)}>
              <div className="avatar">{(p.skater || "FS").slice(0, 1).toUpperCase()}</div>
              <div className="meta">
                <b>{p.skater || "—"}</b>
                <span>
                  {t(discKey(p.discipline))} · {t(segKey(p.discipline, p.segment))} ·{" "}
                  {new Date(p.createdAt).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB", { day: "numeric", month: "short" })}
                </span>
              </div>
              <span className="score">{fmt(p.total)}</span>
              <IcChevR size={15} className="opacity-40" />
            </button>
          ))
        )}
      </Reveal>

      <RulesSheet open={rulesOpen} onClose={() => setRulesOpen(false)} />
      <ProtocolSheet protocol={selProto} onClose={() => setSelProto(null)} />
    </div>
  );
}
