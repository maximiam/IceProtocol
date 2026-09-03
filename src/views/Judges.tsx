import { useMemo } from "react";
import { useApp } from "../store";
import { Telegram } from "../lib/telegram";
import { Reveal } from "../components/ui";
import { IcJudge } from "../components/icons";

interface Persona {
  n: string;
  f: string;
  p: number;
  e: number;
  r: number;
}

const PERSONAS: Persona[] = [
  { n: "Elena Moretti", f: "🇮🇹", p: 41, e: 262, r: 12 },
  { n: "Tomo Yamamoto", f: "🇯🇵", p: 38, e: 240, r: 10 },
  { n: "Sofie Fischer", f: "🇩🇪", p: 33, e: 198, r: 9 },
  { n: "Antoine Dubois", f: "🇫🇷", p: 29, e: 176, r: 8 },
  { n: "Marta Kowalska", f: "🇵🇱", p: 24, e: 150, r: 7 },
  { n: "Rut Lindqvist", f: "🇸🇪", p: 21, e: 128, r: 6 },
  { n: "Jack Parker", f: "🇬🇧", p: 17, e: 96, r: 5 },
  { n: "Lucía Costa", f: "🇪🇸", p: 12, e: 66, r: 4 },
  { n: "Nia Petrova", f: "🇧🇬", p: 8, e: 40, r: 3 },
];

const AV = [
  "linear-gradient(150deg,#6fe3ff,#4aa8d9)",
  "linear-gradient(150deg,#b79bff,#8a6fd9)",
  "linear-gradient(150deg,#7bf0c2,#4ac99a)",
  "linear-gradient(150deg,#ffcf6b,#e0a54a)",
  "linear-gradient(150deg,#ff9d9a,#d9726f)",
  "linear-gradient(150deg,#9ad4ff,#6fa8e0)",
  "linear-gradient(150deg,#e3c9ff,#b794e0)",
  "linear-gradient(150deg,#c2f0e0,#8fd9c0)",
  "linear-gradient(150deg,#ffe3a8,#e0c080)",
  "linear-gradient(150deg,#ffd0ce,#e0a0a0)",
];

const RINGS = ["#c9d8e8", "#ffcf6b", "#e0a37a"];
const COLS = ["linear-gradient(180deg,#dbe7f4,#b9c9dc)", "linear-gradient(180deg,#ffcf6b,#ffe9ad)", "linear-gradient(180deg,#eec39c,#d3a176)"];

interface JudgeRow {
  name: string;
  flag: string;
  p: number;
  e: number;
  pts: number;
  you: boolean;
}

export function JudgesBoard() {
  const { t, lang, protocols, setView, buzz } = useApp();

  const { rows, youIdx } = useMemo(() => {
    const week = Math.floor(Date.now() / 604800000);
    const totalElements = protocols.reduce((s, p) => s + p.elements.length, 0);
    const user: JudgeRow = {
      name: Telegram.user?.first_name ?? (lang === "ru" ? "Вы" : "You"),
      flag: Telegram.user ? "" : "⛸️",
      p: protocols.length,
      e: totalElements,
      pts: protocols.length * 15 + totalElements,
      you: true,
    };
    const list: JudgeRow[] = [
      user,
      ...PERSONAS.map((ps) => ({
        name: ps.n,
        flag: ps.f,
        p: ps.p,
        e: ps.e,
        pts: ps.p * 15 + ps.e + (week % 13) * ps.r,
        you: false,
      })),
    ];
    list.sort((a, b) => b.pts - a.pts);
    return { rows: list, youIdx: list.findIndex((r) => r.you) };
  }, [protocols, lang]);

  const you = rows[youIdx];
  const ahead = youIdx > 0 ? rows[youIdx - 1] : null;
  const podiumOrder = [1, 0, 2];
  const podiumH = [86, 114, 72];

  return (
    <div>
      <Reveal>
        <h1 className="h1">
          {t("nav_judges")} <em>IceProtocol</em>
        </h1>
        <p className="sub">{t("judges_sub")}</p>
      </Reveal>

      <Reveal delay={40}>
        <div className="glass" style={{ padding: "18px 12px 10px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 10 }}>
            {podiumOrder.map((pos) => {
              const j = rows[pos];
              if (!j) return null;
              return (
                <div key={j.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: pos === 0 ? 52 : 42,
                      height: pos === 0 ? 52 : 42,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: pos === 0 ? 18 : 15,
                      color: "#04202b",
                      background: AV[pos % AV.length],
                      boxShadow: `0 0 0 3px var(--ink-2), 0 0 0 5px ${RINGS[pos]}, 0 8px 20px -6px rgba(0,0,0,.45)`,
                      marginBottom: -9,
                      zIndex: 1,
                    }}
                  >
                    {j.name.trim()[0]?.toUpperCase() ?? "J"}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, marginTop: 12, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {j.name.split(" ")[0]} {j.flag}
                  </div>
                  <div
                    style={{
                      height: podiumH[pos],
                      width: "100%",
                      marginTop: 5,
                      borderRadius: "14px 14px 4px 4px",
                      background: COLS[pos],
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      color: "#1d2b42",
                    }}
                  >
                    <b style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{pos + 1}</b>
                    <span style={{ fontSize: 10, fontWeight: 800, opacity: 0.75 }}>{j.pts}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <div className="glass" style={{ padding: "13px 15px", marginBottom: 10, borderColor: "rgba(255,207,107,.35)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                color: "#04202b",
                background: "linear-gradient(140deg,var(--cyan),var(--violet))",
                boxShadow: "0 0 0 2.5px var(--ink-2), 0 0 0 4.5px var(--gold)",
              }}
            >
              {you.name.trim()[0]?.toUpperCase() ?? "J"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <b style={{ fontSize: 13.5 }}>{you.name}</b>
                <span className="badge gold">{t("you_badge")}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--mist-dim)", marginTop: 1 }}>
                {t("your_rank")}: <b style={{ color: "var(--frost)" }}>#{youIdx + 1}</b> · {you.p} {t("st_protocols")} · {you.e} {t("st_elements")}
              </div>
            </div>
            <b style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--gold)", flexShrink: 0 }}>
              {you.pts} <span style={{ fontSize: 10.5, color: "var(--mist-dim)", fontFamily: "var(--font-body)", fontWeight: 700 }}>{t("pts")}</span>
            </b>
          </div>
          <div style={{ height: 5, borderRadius: 10, background: "var(--glass-2)", marginTop: 10, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, Math.round((you.pts / Math.max(1, ahead?.pts ?? you.pts)) * 100))}%`,
                borderRadius: 10,
                background: "linear-gradient(90deg, var(--gold), #fff0c2)",
                transition: "width .6s cubic-bezier(.2,.7,.2,1)",
              }}
            />
          </div>
          <div style={{ fontSize: 10.5, color: "var(--mist-dim)", marginTop: 6 }}>
            {ahead ? t("to_next_pts").replace("{n}", String(ahead.pts - you.pts)) : t("top_judge")}
          </div>
        </div>
      </Reveal>

      <Reveal delay={100}>
        {rows.map((j, i) => (
          <div
            key={j.name}
            className="list-row glass glass-tight"
            style={{
              padding: "10px 13px",
              borderColor: j.you ? "rgba(255,207,107,.4)" : undefined,
              background: j.you ? "rgba(255,207,107,.06)" : undefined,
            }}
          >
            <span
              style={{
                width: 22,
                textAlign: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 14,
                color: i < 3 ? "var(--gold)" : "var(--mist-dim)",
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            <div className="avatar" style={{ width: 34, height: 34, borderRadius: 11, background: AV[i % AV.length], fontSize: 13 }}>
              {j.name.trim()[0]?.toUpperCase() ?? "J"}
            </div>
            <div className="meta">
              <b style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {j.name} {j.flag ? <span style={{ fontSize: 13 }}>{j.flag}</span> : null}
                {j.you && <span className="badge gold">{t("you_badge")}</span>}
              </b>
              <span>
                {j.p} {t("st_protocols")} · {j.e} {t("st_elements")}
              </span>
            </div>
            <b style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: j.you ? "var(--gold)" : "var(--frost)", flexShrink: 0 }}>
              {j.pts}
            </b>
          </div>
        ))}
      </Reveal>

      {you.pts === 0 && (
        <Reveal delay={140}>
          <button
            className="btn"
            type="button"
            style={{ margin: "6px 0 2px" }}
            onClick={() => {
              buzz("medium");
              setView("studio");
            }}
          >
            <IcJudge size={16} />
            {t("judge_first")}
          </button>
        </Reveal>
      )}

      <p style={{ textAlign: "center", fontSize: 10.5, color: "var(--mist-dim)", margin: "10px 0 0" }}>{t("how_pts")}</p>
    </div>
  );
}
