import { useMemo, useState } from "react";
import { Sheet, Chip } from "../ui";
import { useApp } from "../../store";
import { CHSQ, JUMP_GROUPS, SPINS, SPIN_LEVEL_KEYS, STSQ } from "../../data/elements";
import type { ElemType } from "../../lib/scoring";
import { comboBase, countByType, LIMITS, r2, uid } from "../../lib/scoring";
import { IcPlus, IcX } from "../icons";

type Tab = "jump" | "spin" | "step" | "choreo";

export function PickerSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang, draft, addElement, buzz, showToast } = useApp();
  const [tab, setTab] = useState<Tab>("jump");
  const [comboMode, setComboMode] = useState(false);
  const [comboParts, setComboParts] = useState<{ code: string; bv: number }[]>([]);

  const counts = useMemo(() => countByType(draft.elements), [draft.elements]);
  const limits = LIMITS[draft.segment];

  const remaining = (ty: ElemType) => limits[ty] - counts[ty];
  const tabFull = remaining(tab) <= 0;

  const close = () => {
    setComboParts([]);
    onClose();
  };

  const addSingleJump = (code: string, bv: number, name: string) => {
    if (remaining("jump") <= 0) return;
    addElement({ id: uid(), type: "jump", code, name, base: bv, flags: [], goe: 0 });
    buzz("medium");
  };

  const confirmCombo = () => {
    if (comboParts.length < 2 || remaining("jump") <= 0) return;
    const codes = comboParts.map((p) => p.code).join("+");
    addElement({
      id: uid(),
      type: "jump",
      code: codes,
      name: lang === "ru" ? "Каскад" : "Combination",
      base: comboBase(comboParts.map((p) => p.bv)),
      flags: [],
      goe: 0,
    });
    buzz("medium");
    setComboParts([]);
  };

  const addSpin = (code: string, lvl: string, bv: number, name: string) => {
    if (remaining("spin") <= 0) return;
    addElement({ id: uid(), type: "spin", code: code + lvl, name, base: bv, flags: [], goe: 0 });
    buzz("medium");
  };

  const addStep = (lvl: string, bv: number) => {
    if (remaining("step") <= 0) return;
    addElement({ id: uid(), type: "step", code: STSQ.code + lvl, name: lang === "ru" ? STSQ.ru : STSQ.en, base: bv, flags: [], goe: 0 });
    buzz("medium");
  };

  const addChoreo = () => {
    if (remaining("choreo") <= 0) return;
    addElement({ id: uid(), type: "choreo", code: CHSQ.code, name: lang === "ru" ? CHSQ.ru : CHSQ.en, base: CHSQ.bv, flags: [], goe: 0 });
    buzz("medium");
  };

  const lvlBtn = (bv: number, onClick: () => void, label: string, disabled: boolean) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={disabled ? { opacity: 0.35, pointerEvents: "none" } : undefined}
    >
      {label} <span style={{ color: "var(--cyan-dim)", fontWeight: 800 }}>{bv.toFixed(2)}</span>
    </button>
  );

  return (
    <Sheet open={open} onClose={close} title={t("picker_title")} sub={t("picker_sub")}>
      <div className="chip-row" style={{ marginBottom: 14 }}>
        <Chip active={tab === "jump"} onClick={() => setTab("jump")}>
          {t("jumps")} · {Math.max(0, remaining("jump"))}
        </Chip>
        <Chip active={tab === "spin"} onClick={() => setTab("spin")}>
          {t("spins")} · {Math.max(0, remaining("spin"))}
        </Chip>
        <Chip active={tab === "step"} onClick={() => setTab("step")}>
          {t("steps")} · {Math.max(0, remaining("step"))}
        </Chip>
        <Chip active={tab === "choreo"} onClick={() => setTab("choreo")}>
          {t("choreo")} · {Math.max(0, remaining("choreo"))}
        </Chip>
      </div>

      {tabFull && (
        <div className="glass glass-tight" style={{ padding: "10px 13px", fontSize: 12, color: "var(--gold)", fontWeight: 700, marginBottom: 12 }}>
          {t("limit_note")}
        </div>
      )}

      {tab === "jump" && (
        <div>
          <div className="seg-toggle" style={{ marginBottom: 14 }}>
            <button type="button" className={!comboMode ? "active" : ""} onClick={() => setComboMode(false)}>
              {t("single")}
            </button>
            <button type="button" className={comboMode ? "active" : ""} onClick={() => setComboMode(true)}>
              {t("combo")}
            </button>
          </div>

          {!comboMode ? (
            JUMP_GROUPS.map((g, gi) => (
              <div key={g.key} className="fade-up" style={{ animationDelay: `${gi * 40}ms`, marginBottom: 14 }}>
                <div className="cat-title">{lang === "ru" ? g.ru : g.en}</div>
                <div className="lvl-row">
                  {g.jumps.map((j) => (
                    <button
                      key={j.code}
                      type="button"
                      onClick={() => addSingleJump(j.code, j.bv, lang === "ru" ? g.ru : g.en)}
                      disabled={tabFull}
                      style={{ flex: 1, ...(tabFull ? { opacity: 0.35, pointerEvents: "none" } : {}) }}
                    >
                      <span style={{ display: "block", fontWeight: 800, fontSize: 13.5, color: "var(--frost)" }}>{j.code}</span>
                      <span style={{ color: "var(--cyan-dim)", fontWeight: 800, fontSize: 11 }}>{j.bv.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div>
              <p style={{ fontSize: 11.5, color: "var(--mist-dim)", lineHeight: 1.5, margin: "0 2px 12px" }}>{t("combo_hint")}</p>
              <div className="glass glass-tight" style={{ padding: "12px 13px", marginBottom: 12, minHeight: 52, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {comboParts.length === 0 && <span style={{ fontSize: 12.5, color: "var(--mist-dim)" }}>{t("combo_empty")}</span>}
                {comboParts.map((p, i) => (
                  <span key={i} className="badge cyan" style={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: 5 }}>
                    {p.code}
                    <button
                      type="button"
                      onClick={() => setComboParts((c) => c.filter((_, k) => k !== i))}
                      style={{ background: "none", border: "none", color: "inherit", padding: 0, display: "flex" }}
                    >
                      <IcX size={11} />
                    </button>
                  </span>
                ))}
                {comboParts.length >= 2 && (
                  <span className="badge gold" style={{ marginLeft: "auto" }}>
                    {t("base_value")} {r2(comboBase(comboParts.map((p) => p.bv))).toFixed(2)}
                  </span>
                )}
              </div>
              {JUMP_GROUPS.map((g) => (
                <div key={g.key} style={{ marginBottom: 12 }}>
                  <div className="cat-title">{lang === "ru" ? g.ru : g.en}</div>
                  <div className="lvl-row">
                    {g.jumps.map((j) => (
                      <button
                        key={j.code}
                        type="button"
                        disabled={comboParts.length >= 3 || tabFull}
                        onClick={() => {
                          setComboParts((c) => [...c, { code: j.code, bv: j.bv }]);
                          buzz();
                        }}
                        style={{ flex: 1, ...(comboParts.length >= 3 || tabFull ? { opacity: 0.35, pointerEvents: "none" } : {}) }}
                      >
                        <span style={{ display: "block", fontWeight: 800, fontSize: 13, color: "var(--frost)" }}>{j.code}</span>
                        <span style={{ color: "var(--cyan-dim)", fontWeight: 800, fontSize: 10.5 }}>{j.bv.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button className="btn violet" type="button" onClick={confirmCombo} disabled={comboParts.length < 2 || tabFull} style={{ marginTop: 6 }}>
                <IcPlus size={16} />
                {t("confirm_combo")}
              </button>
              {tabFull && <div style={{ height: 8 }} />}
            </div>
          )}
        </div>
      )}

      {tab === "spin" &&
        SPINS.map((s, i) => (
          <div key={s.code} className="fade-up" style={{ animationDelay: `${i * 35}ms`, marginBottom: 14 }}>
            <div className="cat-title">
              {s.code} · {lang === "ru" ? s.ru : s.en}
            </div>
            <div className="lvl-row">
              {SPIN_LEVEL_KEYS.map((lvl) => lvlBtn(s.levels[lvl], () => addSpin(s.code, lvl, s.levels[lvl], lang === "ru" ? s.ru : s.en), lvl, tabFull))}
            </div>
          </div>
        ))}

      {tab === "step" && (
        <div>
          <div className="cat-title">
            StSq · {lang === "ru" ? STSQ.ru : STSQ.en}
          </div>
          <div className="lvl-row" style={{ marginBottom: 16 }}>
            {SPIN_LEVEL_KEYS.map((lvl) => lvlBtn(STSQ.levels[lvl as keyof typeof STSQ.levels], () => addStep(lvl, STSQ.levels[lvl as keyof typeof STSQ.levels]), lvl, tabFull))}
          </div>
        </div>
      )}

      {tab === "choreo" && (
        <div>
          {limits.choreo === 0 ? (
            <div className="glass glass-tight" style={{ padding: "12px 14px", fontSize: 12.5, color: "var(--mist)" }}>
              {t("limit_note")}
            </div>
          ) : (
            <button className="elem-row glass glass-tight" type="button" onClick={addChoreo}>
              <div className="elem-info">
                <b>{CHSQ.code}</b>
                <span>{lang === "ru" ? CHSQ.ru : CHSQ.en}</span>
              </div>
              <span className="elem-score" style={{ color: "var(--cyan)" }}>
                {CHSQ.bv.toFixed(2)}
              </span>
            </button>
          )}
        </div>
      )}
      <div style={{ height: 6 }} />
    </Sheet>
  );
}


