import React, { useMemo } from "react";
import { useApp, type View } from "../store";
import { AnimatedNumber } from "./ui";
import { IcBlade, IcCalendar, IcHome, IcJudge, IcMedal, IcSave, IcUser, IcUsers } from "./icons";

/* ---------- ambient layers ---------- */
const SPARK_COLORS = ["#6fe3ff", "#b79bff", "#7bf0c2", "#ffcf6b", "#6fe3ff"];

export function BgFx() {
  const sparks = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: `${(i * 37 + 13) % 100}%`,
        size: 2 + ((i * 7) % 3),
        dur: 9 + ((i * 13) % 14),
        delay: -((i * 17) % 20),
        dx: `${((i % 5) - 2) * 26}px`,
        color: SPARK_COLORS[i % SPARK_COLORS.length],
      })),
    [],
  );
  return (
    <>
      <div className="bg-aurora" />
      <div className="sparks">
        {sparks.map((s) => (
          <span
            key={s.id}
            className="spark"
            style={
              {
                left: s.left,
                width: s.size,
                height: s.size,
                background: s.color,
                animationDuration: `${s.dur}s`,
                animationDelay: `${s.delay}s`,
                "--dx": s.dx,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </>
  );
}

/* ---------- top bar ---------- */
export function TopBar() {
  const { setView } = useApp();
  return (
    <header className="topbar">
      <button className="brand" onClick={() => setView("home")} type="button">
        <div className="brand-mark">
          <IcBlade size={20} />
        </div>
        <div className="brand-text">
          <b style={{ fontSize: 17.5, letterSpacing: 0.2 }}>IceProtocol</b>
        </div>
      </button>
    </header>
  );
}

/* ---------- tab bar ---------- */
const TABS: { view: View; key: "nav_home" | "nav_studio" | "nav_skaters" | "nav_season" | "tab_judges" | "nav_profile"; icon: React.ReactNode }[] = [
  { view: "home", key: "nav_home", icon: <IcHome /> },
  { view: "studio", key: "nav_studio", icon: <IcJudge /> },
  { view: "skaters", key: "nav_skaters", icon: <IcUsers /> },
  { view: "season", key: "nav_season", icon: <IcCalendar /> },
  { view: "judges", key: "tab_judges", icon: <IcMedal /> },
  { view: "profile", key: "nav_profile", icon: <IcUser /> },
];

export function TabBar() {
  const { view, setView, t } = useApp();
  return (
    <nav className="tabbar-wrap">
      <div className="tabbar glass glass-strong">
        {TABS.map((tb) => (
          <button key={tb.view} type="button" className={`tab-btn ${view === tb.view ? "active" : ""}`} onClick={() => setView(tb.view)}>
            {tb.icon}
            <span>{t(tb.key)}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ---------- floating score bar (studio) ---------- */
export function ScoreBar({
  tes,
  pcs,
  ded,
  total,
  onSave,
  canSave,
}: {
  tes: number;
  pcs: number;
  ded: number;
  total: number;
  onSave: () => void;
  canSave: boolean;
}) {
  const { t } = useApp();
  return (
    <div className="scorebar">
      <div className="scorebar-inner glass glass-strong">
        <div className="sb-item">
          <b>
            <AnimatedNumber value={tes} />
          </b>
          <span>{t("tes")}</span>
        </div>
        <div className="sb-item">
          <b style={{ color: "var(--gold)" }}>
            <AnimatedNumber value={pcs} />
          </b>
          <span>{t("pcs_score")}</span>
        </div>
        <div className="sb-item">
          <b style={{ color: ded > 0 ? "var(--ember)" : undefined }}>
            {ded > 0 ? "−" : ""}
            <AnimatedNumber value={ded} />
          </b>
          <span>{t("ded")}</span>
        </div>
        <div className="sb-total">
          <b key={Math.round(total * 100)} className="pop">
            <AnimatedNumber value={total} />
          </b>
          <span>{t("total")}</span>
        </div>
        <button className="sb-save" type="button" onClick={onSave} disabled={!canSave} style={{ opacity: canSave ? 1 : 0.45 }} aria-label={t("save")}>
          <IcSave size={19} />
        </button>
      </div>
    </div>
  );
}
