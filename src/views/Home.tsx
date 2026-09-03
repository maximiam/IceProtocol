import { useMemo, useState } from "react";
import { useApp, useNow } from "../store";
import { EVENTS } from "../data/skaters";
import type { Discipline, Protocol, Segment } from "../lib/scoring";
import { DISCIPLINES, discKey, fmt, segKey } from "../lib/scoring";
import { Chip, Reveal, SectionLabel } from "../components/ui";
import { ProtocolSheet, RulesSheet } from "../components/sheets/InfoSheets";
import { JudgesBoard } from "./Judges";
import { Telegram } from "../lib/telegram";
import { IcBook, IcCalendar, IcChevR, IcJudge, IcMedal, IcUsers } from "../components/icons";

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

export function Home() {
  const { t, lang, protocols, patchDraft, setView, buzz } = useApp();
  const now = useNow(1000);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [sel, setSel] = useState<Protocol | null>(null);
  const [disc, setDisc] = useState<Discipline>("men");
  const [seg, setSeg] = useState<Segment>("sp");

  const next = useMemo(
    () =>
      [...EVENTS]
        .filter((e) => +new Date(e.end + "T23:59:59") >= now)
        .sort((a, b) => a.start.localeCompare(b.start))[0] ?? null,
    [now],
  );

  const hour = new Date(now).getHours();
  const greetKey = hour < 5 ? "g_night" : hour < 12 ? "g_morning" : hour < 18 ? "g_afternoon" : "g_evening";
  const userName = Telegram.user?.first_name ?? "";

  const allEls = protocols.reduce((s, p) => s + p.elements.length, 0);
  const avgGoe = allEls ? protocols.reduce((s, p) => s + p.elements.reduce((a, e) => a + e.goe, 0), 0) / allEls : null;

  const startTs = next ? +new Date(next.start + "T00:00:00") : 0;
  const live = !!next && now >= startTs;
  const diff = Math.max(0, startTs - now);
  const dd = Math.floor(diff / 86400000);
  const hh = Math.floor((diff % 86400000) / 3600000);
  const mm = Math.floor((diff % 3600000) / 60000);
  const ss = Math.floor((diff % 60000) / 1000);

  const loc = lang === "ru" ? "ru-RU" : "en-GB";
  const fday = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString(loc, { day: "numeric", month: "short" });

  const openStudio = () => {
    buzz("medium");
    patchDraft({ discipline: disc, segment: seg });
    setView("studio");
  };

  const scrollToBoard = () => {
    buzz();
    document.getElementById("judges-board")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <Reveal>
        <h1 className="h1">
          {t(greetKey)}
          {userName ? `, ${userName}` : ""} <em>⛸</em>
        </h1>
        <p className="sub">
          FS Judge · {t("judge")} · ISU 2025/26
        </p>
      </Reveal>

      {/* next start countdown */}
      <Reveal delay={40}>
        <div className="glass" style={{ padding: "16px 16px 18px", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span className="badge cyan">{t("next_start")}</span>
            {live && (
              <span className="badge" style={{ color: "var(--ember)", borderColor: "rgba(255,127,122,.5)" }}>
                <span className="rec-dot" style={{ display: "inline-block", position: "static", marginRight: 5 }} />
                {t("live_now")}
              </span>
            )}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 21, lineHeight: 1.2, marginTop: 10 }}>
            {next ? (lang === "ru" ? next.ru : next.en) : t("season_over")}
          </div>
          {next ? (
            <div style={{ fontSize: 12, color: "var(--mist-dim)", marginTop: 3 }}>
              {next.flag} {lang === "ru" ? next.cityRu : next.city} · {fday(next.start)} – {fday(next.end)}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "var(--mist-dim)", marginTop: 3 }}>{t("season_over_sub")}</div>
          )}
          {next && !live && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 14 }}>
              {[
                { v: dd, l: t("d_days") },
                { v: hh, l: t("d_hours") },
                { v: mm, l: t("d_min") },
                { v: ss, l: t("d_sec") },
              ].map((c) => (
                <div key={c.l} className="glass glass-tight" style={{ padding: "10px 4px", textAlign: "center", boxShadow: "none" }}>
                  <b key={c.v} className="pop" style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, display: "block", color: "var(--cyan)" }}>
                    {pad(c.v)}
                  </b>
                  <span style={{ fontSize: 9.5, color: "var(--mist-dim)", textTransform: "uppercase", letterSpacing: 0.4 }}>{c.l}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      {/* new protocol setup */}
      <Reveal delay={80}>
        <div className="glass" style={{ padding: "16px 16px 15px", marginTop: 12 }}>
          <b style={{ fontFamily: "var(--font-display)", fontSize: 16.5, fontWeight: 600 }}>{t("new_protocol")}</b>
          <div style={{ fontSize: 12, color: "var(--mist-dim)", marginTop: 2, marginBottom: 12 }}>{t("new_protocol_sub")}</div>
          <div className="field-label">{t("discipline")}</div>
          <div className="chip-row" style={{ marginBottom: 10 }}>
            {DISCIPLINES.map((d) => (
              <Chip key={d} active={disc === d} onClick={() => { setDisc(d); buzz(); }}>
                {t(discKey(d))}
              </Chip>
            ))}
          </div>
          <div className="field-label">{t("segment")}</div>
          <div className="seg-toggle" style={{ marginBottom: 12 }}>
            {(["sp", "fs"] as Segment[]).map((s) => (
              <button key={s} type="button" className={seg === s ? "active" : ""} onClick={() => { setSeg(s); buzz(); }}>
                {t(segKey(disc, s))}
              </button>
            ))}
          </div>
          <button className="btn" type="button" onClick={openStudio}>
            <IcJudge size={16} />
            {t("open_studio")}
          </button>
        </div>
      </Reveal>

      {/* quick grid */}
      <Reveal delay={110}>
        <div style={{ marginTop: 18 }}>
          <div className="quick-grid">
            <button className="quick-tile glass glass-tight" type="button" onClick={() => { buzz(); setRulesOpen(true); }}>
              <span className="qi" style={{ color: "var(--cyan)" }}><IcBook size={17} /></span>
              <div><b>{t("quick_ref")}</b><span>{t("quick_ref_sub")}</span></div>
            </button>
            <button className="quick-tile glass glass-tight" type="button" onClick={() => setView("skaters")}>
              <span className="qi" style={{ color: "var(--violet)" }}><IcUsers size={17} /></span>
              <div><b>{t("quick_skaters")}</b><span>{t("quick_skaters_sub")}</span></div>
            </button>
            <button className="quick-tile glass glass-tight" type="button" onClick={() => setView("season")}>
              <span className="qi" style={{ color: "var(--gold)" }}><IcCalendar size={17} /></span>
              <div><b>{t("quick_season")}</b><span>{t("quick_season_sub")}</span></div>
            </button>
            <button className="quick-tile glass glass-tight" type="button" onClick={scrollToBoard}>
              <span className="qi" style={{ color: "var(--mint)" }}><IcMedal size={17} /></span>
              <div><b>{t("quick_judges")}</b><span>{t("quick_judges_sub")}</span></div>
            </button>
          </div>
        </div>
      </Reveal>

      {/* judges leaderboard */}
      <div id="judges-board" style={{ scrollMarginTop: 80 }}>
        <SectionLabel>{t("nav_judges")}</SectionLabel>
        <JudgesBoard />
      </div>

      {/* stats + recent protocols */}
      <Reveal delay={60}>
        <div className="hero-stats" style={{ margin: "18px 0 4px" }}>
          <div className="hero-stat glass glass-tight" style={{ padding: "12px 12px" }}>
            <b>{protocols.length}</b>
            <span>{t("st_protocols")}</span>
          </div>
          <div className="hero-stat glass glass-tight" style={{ padding: "12px 12px" }}>
            <b>{allEls}</b>
            <span>{t("st_elements")}</span>
          </div>
          <div className="hero-stat glass glass-tight" style={{ padding: "12px 12px" }}>
            <b style={{ color: avgGoe == null ? undefined : avgGoe >= 0 ? "var(--mint)" : "var(--ember)" }}>
              {avgGoe == null ? "—" : `${avgGoe > 0 ? "+" : ""}${avgGoe.toFixed(1)}`}
            </b>
            <span>{t("st_avg_goe")}</span>
          </div>
        </div>
      </Reveal>

      <SectionLabel>{t("recent")}</SectionLabel>
      {protocols.length === 0 ? (
        <div className="glass glass-tight">
          <div className="empty">
            <IcJudge size={38} />
            <b>{t("no_recent")}</b>
            <span>{t("no_recent_sub")}</span>
          </div>
        </div>
      ) : (
        protocols.slice(0, 4).map((p) => (
          <div key={p.id} className="list-row glass glass-tight" style={{ cursor: "pointer" }} onClick={() => setSel(p)}>
            <div className="avatar">{(p.skater || "FS").slice(0, 1).toUpperCase()}</div>
            <div className="meta">
              <b>{p.skater || "—"}</b>
              <span>
                {t(discKey(p.discipline))} · {t(segKey(p.discipline, p.segment))} ·{" "}
                {new Date(p.createdAt).toLocaleDateString(loc, { day: "numeric", month: "short" })}
              </span>
            </div>
            <span className="score">{fmt(p.total)}</span>
            <IcChevR size={15} className="opacity-40" />
          </div>
        ))
      )}

      <RulesSheet open={rulesOpen} onClose={() => setRulesOpen(false)} />
      <ProtocolSheet protocol={sel} onClose={() => setSel(null)} />
    </div>
  );
}
