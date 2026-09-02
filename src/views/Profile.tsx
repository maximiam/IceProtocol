import { useState } from "react";
import { useApp } from "../store";
import { Telegram } from "../lib/telegram";
import type { Protocol } from "../lib/scoring";
import { discKey, fmt, segKey } from "../lib/scoring";
import { Reveal, SectionLabel, Toggle } from "../components/ui";
import { ProtocolSheet, RulesSheet } from "../components/sheets/InfoSheets";
import { IcBook, IcChevR, IcJudge, IcTrash } from "../components/icons";

export function Profile() {
  const { t, lang, theme, setTheme, setLang, haptics, setHaptics, protocols, deleteProtocol, clearProtocols, buzz, showToast, setView } = useApp();
  const [rulesOpen, setRulesOpen] = useState(false);
  const [selProto, setSelProto] = useState<Protocol | null>(null);
  const [confirming, setConfirming] = useState(false);

  const user = Telegram.user;
  const name = user ? [user.first_name, user.last_name].filter(Boolean).join(" ") : lang === "ru" ? "Судья" : "Judge";
  const username = user?.username ? `@${user.username}` : t("local_judge");
  const initials = (user?.first_name?.[0] ?? "С").toUpperCase();

  const totalElements = protocols.reduce((s, p) => s + p.elements.length, 0);
  const best = protocols.length ? Math.max(...protocols.map((p) => p.total)) : null;

  return (
    <div>
      <Reveal>
        <div className="profile-head">
          <div className="profile-avatar">
            {user?.photo_url ? <img src={user.photo_url} alt="" /> : initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="profile-name">{name}</div>
            <div className="profile-user">{username}</div>
            <span className="badge violet" style={{ marginTop: 6, display: "inline-block" }}>
              FS Judge · {t("nav_studio")}
            </span>
          </div>
        </div>
      </Reveal>

      <Reveal delay={50}>
        <div className="stat-grid">
          <div className="stat-tile glass glass-tight">
            <b>{protocols.length}</b>
            <span>{t("st_protocols")}</span>
          </div>
          <div className="stat-tile glass glass-tight">
            <b>{totalElements}</b>
            <span>{t("st_elements")}</span>
          </div>
          <div className="stat-tile glass glass-tight">
            <b style={{ color: "var(--cyan)" }}>{best == null ? "—" : fmt(best)}</b>
            <span>{t("best_total")}</span>
          </div>
        </div>
      </Reveal>

      <Reveal delay={90}>
        <SectionLabel>{t("settings")}</SectionLabel>
        <div className="glass" style={{ padding: "4px 16px 6px" }}>
          <div className="settings-row">
            <div>
              <div className="sname">{t("theme")}</div>
              <div className="ssub">ISU · liquid glass</div>
            </div>
            <div className="lang-toggle">
              <button type="button" className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}>
                {t("dark")}
              </button>
              <button type="button" className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}>
                {t("light")}
              </button>
            </div>
          </div>
          <div className="settings-row">
            <div>
              <div className="sname">{t("language")}</div>
              <div className="ssub">RU / EN</div>
            </div>
            <div className="lang-toggle">
              <button type="button" className={lang === "ru" ? "active" : ""} onClick={() => setLang("ru")}>
                РУС
              </button>
              <button type="button" className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>
                ENG
              </button>
            </div>
          </div>
          <div className="settings-row">
            <div>
              <div className="sname">{t("haptics")}</div>
              <div className="ssub">{t("haptics_sub")}</div>
            </div>
            <Toggle
              on={haptics}
              onChange={(v) => {
                setHaptics(v);
                if (v) Telegram.haptic("medium");
              }}
            />
          </div>
          <button className="settings-row" type="button" style={{ background: "none", border: "none", color: "inherit", width: "100%", cursor: "pointer", borderTop: "1px solid var(--glass-border)" }} onClick={() => setRulesOpen(true)}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="qi" style={{ width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--glass-2)", color: "var(--cyan)" }}>
                <IcBook size={15} />
              </span>
              <div className="sname">{t("reference")}</div>
            </div>
            <IcChevR size={15} className="opacity-40" />
          </button>
        </div>
      </Reveal>

      <Reveal delay={130}>
        <SectionLabel>{t("saved_protocols")}</SectionLabel>
        {protocols.length === 0 ? (
          <button className="glass glass-tight" style={{ width: "100%", cursor: "pointer" }} type="button" onClick={() => setView("studio")}>
            <div className="empty" style={{ padding: "26px 20px" }}>
              <IcJudge size={34} />
              <b>{t("no_protocols_yet")}</b>
              <span>{t("no_recent_sub")}</span>
            </div>
          </button>
        ) : (
          <>
            {protocols.map((p) => (
              <div key={p.id} className="list-row glass glass-tight" style={{ cursor: "pointer" }} onClick={() => setSelProto(p)}>
                <div className="avatar">{(p.skater || "FS").slice(0, 1).toUpperCase()}</div>
                <div className="meta">
                  <b>{p.skater || "—"}</b>
                  <span>
                    {t(discKey(p.discipline))} · {t(segKey(p.discipline, p.segment))} ·{" "}
                    {new Date(p.createdAt).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <span className="score">{fmt(p.total)}</span>
                <button
                  className="icon-btn"
                  type="button"
                  style={{ width: 32, height: 32, borderRadius: 10, color: "var(--ember)" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProtocol(p.id);
                    buzz();
                  }}
                  aria-label="delete"
                >
                  <IcTrash size={15} />
                </button>
              </div>
            ))}
            <button
              className="btn ghost sm"
              type="button"
              style={{ color: "var(--ember)", borderColor: "rgba(255,127,122,.4)", margin: "4px auto 0" }}
              onClick={() => {
                if (!confirming) {
                  setConfirming(true);
                  buzz();
                  window.setTimeout(() => setConfirming(false), 2600);
                  return;
                }
                clearProtocols();
                setConfirming(false);
                showToast(t("cleared_toast"));
                buzz("medium");
              }}
            >
              <IcTrash size={14} />
              {confirming ? t("confirm_clear") : t("clear_all")}
            </button>
          </>
        )}
      </Reveal>

      <p style={{ textAlign: "center", fontSize: 10.5, color: "var(--mist-dim)", margin: "26px 0 8px", lineHeight: 1.6 }}>{t("version")}</p>

      <RulesSheet open={rulesOpen} onClose={() => setRulesOpen(false)} />
      <ProtocolSheet protocol={selProto} onClose={() => setSelProto(null)} />
    </div>
  );
}
