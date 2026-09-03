import { useMemo, useState } from "react";
import { useApp, useNow } from "../store";
import { EVENTS } from "../data/skaters";
import type { Category, Discipline, Protocol, Segment } from "../lib/scoring";
import { catKey, discKey, fmt, segKey } from "../lib/scoring";
import { Chip, Reveal, SectionLabel } from "../components/ui";
import { ProtocolSheet, RulesSheet } from "../components/sheets/InfoSheets";
import { CompSheet, SkaterPickSheet } from "../components/sheets/PickSheets";
import { IcBook, IcCalendar, IcChevR, IcJudge, IcUsers } from "../components/icons";

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

export function Home() {
  const { t, lang, draft, protocols, patchDraft, setView, buzz } = useApp();
  const now = useNow(1000);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [sel, setSel] = useState<Protocol | null>(null);
  const [compOpen, setCompOpen] = useState(false);
  const [skaterOpen, setSkaterOpen] = useState(false);
  const [group, setGroup] = useState<"m" | "l" | "pairs" | "dance">("m");
  const [seg, setSeg] = useState<Segment>("sp");
  const [cat, setCat] = useState<Category>("senior");

  const disc: Discipline =
    group === "m"
      ? cat === "senior"
        ? "men"
        : "jmen"
      : group === "l"
        ? cat === "senior"
          ? "ladies"
          : "jladies"
        : group;

  const next = useMemo(
    () =>
      [...EVENTS]
        .filter((e) => +new Date(e.end + "T23:59:59") >= now)
        .sort((a, b) => a.start.localeCompare(b.start))[0] ?? null,
    [now],
  );

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
    patchDraft({ discipline: disc, segment: seg, category: cat });
    setView("studio");
  };

  return (
    <div>
      {/* next start countdown */}
      <Reveal>
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
          <div style={{ fontSize: 12, color: "var(--mist-dim)", marginTop: 2, marginBottom: 12 }}>{t("cat_note")}</div>

          <div className="field-label">{t("cat_label")}</div>
          <div className="seg-toggle" style={{ marginBottom: 12 }}>
            {(["senior", "junior"] as Category[]).map((c) => (
              <button key={c} type="button" className={cat === c ? "active" : ""} onClick={() => { setCat(c); buzz(); }}>
                {t(catKey(c))}
              </button>
            ))}
          </div>

          <div className="field-label">
            {t("discipline")} · <span style={{ color: "var(--cyan)" }}>{t(discKey(disc))}</span>
          </div>
          <div className="chip-row" style={{ marginBottom: 12 }}>
            {(
              [
                { g: "m", label: cat === "senior" ? t("disc_men") : t("disc_jmen") },
                { g: "l", label: cat === "senior" ? t("disc_ladies") : t("disc_jladies") },
                { g: "pairs", label: t("disc_pairs") },
                { g: "dance", label: t("disc_dance") },
              ] as { g: "m" | "l" | "pairs" | "dance"; label: string }[]
            ).map((o) => (
              <Chip key={o.g} active={group === o.g} onClick={() => { setGroup(o.g); buzz(); }}>
                {o.label}
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

          <div className="field-label">{t("comp_label")}</div>
          <button
            type="button"
            className="list-row glass glass-tight"
            style={{ width: "100%", textAlign: "left", padding: "11px 13px", marginBottom: 12 }}
            onClick={() => { setCompOpen(true); buzz(); }}
          >
            <span className="qi" style={{ color: "var(--gold)", width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--glass-2)", flexShrink: 0 }}>
              <IcCalendar size={15} />
            </span>
            <div className="meta">
              <b>{draft.competition || t("comp_pick")}</b>
              <span>{t("comp_pick_sub")}</span>
            </div>
            <IcChevR size={15} className="opacity-40" />
          </button>

          <div className="field-label">{t("athlete")}</div>
          <button
            type="button"
            className="list-row glass glass-tight"
            style={{ width: "100%", textAlign: "left", padding: "11px 13px", marginBottom: 14 }}
            onClick={() => { setSkaterOpen(true); buzz(); }}
          >
            {draft.athlete ? (
              <>
                <span className="flag" style={{ fontSize: 20, flexShrink: 0 }}>{draft.athlete.flag}</span>
                <div className="meta">
                  <b>{draft.athlete.name}</b>
                  <span>{draft.athlete.country}</span>
                </div>
              </>
            ) : (
              <>
                <span className="qi" style={{ color: "var(--violet)", width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--glass-2)", flexShrink: 0 }}>
                  <IcUsers size={15} />
                </span>
                <div className="meta">
                  <b>{t("pick_skater")}</b>
                  <span>{t("pick_skater_sub")}</span>
                </div>
              </>
            )}
            <IcChevR size={15} className="opacity-40" />
          </button>

          <button className="btn" type="button" onClick={openStudio}>
            <IcJudge size={16} />
            {t("open_studio")}
          </button>
        </div>
      </Reveal>

      {/* reference row */}
      <Reveal delay={110}>
        <button className="list-row glass glass-tight" type="button" style={{ width: "100%", textAlign: "left", marginTop: 12 }} onClick={() => { buzz(); setRulesOpen(true); }}>
          <span className="qi" style={{ color: "var(--cyan)", width: 36, height: 36, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--glass-2)", flexShrink: 0 }}>
            <IcBook size={17} />
          </span>
          <div className="meta">
            <b>{t("quick_ref")}</b>
            <span>{t("rules_structure_sub")}</span>
          </div>
          <IcChevR size={15} className="opacity-40" />
        </button>
      </Reveal>

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
            <div className="avatar">{p.skaterFlag || (p.skater || "FS").slice(0, 1).toUpperCase()}</div>
            <div className="meta">
              <b>{p.skater || "—"}</b>
              <span>
                {t(discKey(p.discipline))} · {t(catKey(p.category ?? "senior"))} ·{" "}
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
      <CompSheet open={compOpen} onClose={() => setCompOpen(false)} />
      <SkaterPickSheet open={skaterOpen} onClose={() => setSkaterOpen(false)} />
    </div>
  );
}
