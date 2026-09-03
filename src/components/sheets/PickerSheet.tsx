import { useEffect, useMemo, useState } from "react";
import { Sheet, Chip } from "../ui";
import { useApp } from "../../store";
import {
  CHSQ,
  DANCE_CHOREO,
  DANCE_LONG_LIFT,
  DANCE_SHORT_LIFTS,
  DANCE_SPINS,
  JUMP_GROUPS,
  PAIRS_LIFTS,
  PAIRS_SPINS,
  PST,
  SINGLES_SPINS,
  SPIN_LEVEL_KEYS,
  STSQ,
  THROWS,
  TWISTS,
  filterJumps,
  type ElemDef,
  type LeveledDef,
} from "../../data/elements";
import type { Category, Discipline, ElemType, Segment, SlotSet } from "../../lib/scoring";
import { categoryOf, comboBase, countByType, getLimits, r2, uid } from "../../lib/scoring";
import { IcCheck, IcPlus, IcX } from "../icons";

type JumpTab = "single" | "twist" | "throw";
type Tab = "jump" | "combo" | "lift" | "spin" | "step" | "choreo";

export interface NewElement {
  type: ElemType;
  code: string;
  name: string;
  base: number;
  defCode?: string;
  levelIdx?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  discipline: Discipline;
  segment: Segment;
  category: Category;
  /** when set, the sheet works in "replace" mode: picked element is returned instead of appended */
  onPick?: (el: NewElement) => void;
}

/* remembered last-used level per element family (persisted for the session) */
const levelMemory: Record<string, number> = {};

/** map picker tab to element type for slot accounting */
const tabType = (k: Tab): ElemType => (k === "combo" ? "jump" : k);

export function PickerSheet({ open, onClose, discipline, segment, category, onPick }: Props) {
  const { t, lang, draft, addElement, buzz, showToast } = useApp();
  const cat = categoryOf(discipline, category);
  const limits = getLimits(discipline, segment, cat);
  const counts = useMemo(() => countByType(draft.elements), [draft.elements]);
  const replaceMode = !!onPick;

  const hasJumps = limits.jump > 0 && discipline !== "pairs";
  const availableTabs: Tab[] = useMemo(() => {
    const list: Tab[] = [];
    if (hasJumps) list.push("jump", "combo");
    if (limits.jump > 0 && discipline === "pairs") list.push("jump");
    if (limits.lift > 0) list.push("lift");
    if (limits.spin > 0) list.push("spin");
    if (limits.step > 0) list.push("step");
    if (limits.choreo > 0) list.push("choreo");
    return list;
  }, [limits, discipline, hasJumps]);

  const [tab, setTab] = useState<Tab>("jump");
  const [combo, setCombo] = useState<ElemDef[]>([]);
  const [jumpTab, setJumpTab] = useState<JumpTab>("single");
  const [level, setLevel] = useState(1);

  useEffect(() => {
    if (open) {
      if (!availableTabs.includes(tab)) setTab(availableTabs[0] ?? "spin");
      setCombo([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const safeTab: Tab = availableTabs.includes(tab) ? tab : availableTabs[0] ?? "spin";

  const spinCatalog: LeveledDef[] =
    discipline === "dance" ? DANCE_SPINS : discipline === "pairs" ? [...SINGLES_SPINS, ...PAIRS_SPINS] : SINGLES_SPINS;
  const liftCatalog: LeveledDef[] = discipline === "pairs" ? PAIRS_LIFTS : DANCE_SHORT_LIFTS;
  const choreoCatalog: ElemDef[] = discipline === "dance" ? DANCE_CHOREO : CHSQ;

  const full = (ty: ElemType) => counts[ty] >= limits[ty];

  const addEl = (e: NewElement) => {
    if (!replaceMode && full(e.type)) {
      showToast(t("limit_note"));
      buzz("error");
      return;
    }
    if (replaceMode && onPick) {
      onPick(e);
      onClose();
      return;
    }
    addElement({ id: uid(), type: e.type, code: e.code, name: e.name, base: e.base, flags: [], goe: 0, defCode: e.defCode, levelIdx: e.levelIdx });
    buzz("medium");
  };

  const addCombo = () => {
    if (!combo.length) return;
    addEl({
      type: "jump",
      code: combo.map((c) => c.code).join("+"),
      name: combo.map((c) => c.name).join(" + "),
      base: comboBase(combo.map((c) => c.base)),
    });
    setCombo([]);
  };

  const gridBtn = "glass glass-tight";
  const gridStyle: React.CSSProperties = {
    padding: "10px 6px",
    borderRadius: "var(--r-sm)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    width: "100%",
  };

  const JumpGrid = ({ jumps }: { jumps: ElemDef[] }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
      {jumps.map((j) => (
        <button key={j.code} type="button" className={gridBtn} style={gridStyle} onClick={() => addEl({ type: "jump", code: j.code, name: j.name, base: j.base })}>
          <b style={{ fontSize: 14 }}>{j.code}</b>
          <span style={{ fontSize: 10, color: "var(--mist-dim)" }}>{j.base.toFixed(1)}</span>
        </button>
      ))}
    </div>
  );

  const setLvl = (i: number, family: string) => {
    setLevel(i);
    levelMemory[family] = i;
    buzz();
  };

  const LeveledGrid = ({ items, type, family }: { items: LeveledDef[]; type: ElemType; family: string }) => {
    const lvl = levelMemory[family] ?? level;
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "2px 0 10px", flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "var(--mist-dim)", fontWeight: 700 }}>{t("lvl")}:</span>
          {SPIN_LEVEL_KEYS.map((k, i) => (
            <button
              key={k}
              type="button"
              className={`flag-chip ${lvl === i ? "active" : ""}`}
              style={{ padding: "6px 13px" }}
              onClick={() => setLvl(i, family)}
            >
              {k}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
          {items.map((s) => {
            const base = s.bases[lvl] ?? 0;
            const disabled = base <= 0;
            return (
              <button
                key={s.code}
                type="button"
                className={gridBtn}
                disabled={disabled}
                style={{ ...gridStyle, padding: "12px 9px", flexDirection: "row", justifyContent: "space-between", opacity: disabled ? 0.35 : 1 }}
                onClick={() =>
                  addEl({
                    type,
                    code: `${s.code}${SPIN_LEVEL_KEYS[lvl]}`,
                    name: s.name,
                    base,
                    defCode: s.code,
                    levelIdx: lvl,
                  })
                }
              >
                <span style={{ textAlign: "left", minWidth: 0 }}>
                  <b style={{ fontSize: 13, display: "block" }}>
                    {s.code}
                    {SPIN_LEVEL_KEYS[lvl]}
                  </b>
                  <span style={{ fontSize: 10, color: "var(--mist-dim)" }}>{s.name}</span>
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--cyan)", flexShrink: 0 }}>{base.toFixed(1)}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const comboTotal = comboBase(combo.map((c) => c.base));

  return (
    <Sheet open={open} onClose={onClose} title={replaceMode ? t("replace_elem") : t("picker_title")} sub={t("picker_sub")}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {availableTabs.map((k) => {
          const label =
            k === "jump" ? t("jumps") : k === "combo" ? t("combo") : k === "lift" ? t("type_lift") : k === "spin" ? t("spins") : k === "step" ? t("steps") : t("choreo");
          return (
            <Chip key={k} active={safeTab === k} onClick={() => setTab(k)}>
              {label}
              {!replaceMode && limits[tabType(k)] > 0 && (
                <span style={{ opacity: 0.75 }}>
                  {counts[tabType(k)]}/{limits[tabType(k)]}
                </span>
              )}
            </Chip>
          );
        })}
      </div>

      {/* ---------------- jumps ---------------- */}
      {safeTab === "jump" && discipline !== "pairs" && (
        <div className="cat-group">
          {Object.entries(JUMP_GROUPS).map(([key, g]) => (
            <div key={key}>
              <div className="cat-title">{g.group}</div>
              <JumpGrid jumps={filterJumps(discipline, g.jumps)} />
            </div>
          ))}
        </div>
      )}

      {safeTab === "jump" && discipline === "pairs" && (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            <Chip active={jumpTab === "single"} onClick={() => setJumpTab("single")}>
              {t("single")}
            </Chip>
            <Chip active={jumpTab === "twist"} onClick={() => setJumpTab("twist")}>
              {t("twists")}
            </Chip>
            <Chip active={jumpTab === "throw"} onClick={() => setJumpTab("throw")}>
              {t("throws")}
            </Chip>
          </div>
          {jumpTab === "single" && (
            <div className="cat-group">
              {Object.entries(JUMP_GROUPS)
                .filter(([k]) => k !== "euler")
                .map(([key, g]) => (
                  <div key={key}>
                    <div className="cat-title">{g.group}</div>
                    <JumpGrid jumps={filterJumps(discipline, g.jumps)} />
                  </div>
                ))}
            </div>
          )}
          {jumpTab === "twist" && <LeveledGrid items={TWISTS} type="jump" family="tw" />}
          {jumpTab === "throw" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {THROWS.map((th) => (
                <button key={th.code} type="button" className={gridBtn} style={gridStyle} onClick={() => addEl({ type: "jump", code: th.code, name: th.name, base: th.base })}>
                  <b style={{ fontSize: 12.5 }}>{th.code}</b>
                  <span style={{ fontSize: 10, color: "var(--mist-dim)" }}>{th.base.toFixed(1)}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ---------------- combo builder ---------------- */}
      {safeTab === "combo" && (
        <div>
          <div style={{ fontSize: 11.5, color: "var(--mist-dim)", marginBottom: 10, lineHeight: 1.5 }}>{t("combo_hint")}</div>
          <div className="cat-group">
            {Object.entries(JUMP_GROUPS).map(([key, g]) => (
              <div key={key}>
                <div className="cat-title">{g.group}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {filterJumps(discipline, g.jumps).map((j) => {
                    const inCombo = combo.some((c) => c.code === j.code);
                    const isFull = combo.length >= 3;
                    return (
                      <button
                        key={j.code}
                        type="button"
                        className={`flag-chip ${inCombo ? "active" : ""}`}
                        disabled={isFull && !inCombo}
                        style={{ opacity: isFull && !inCombo ? 0.35 : 1, minWidth: 52 }}
                        onClick={() => {
                          setCombo((prev) => (inCombo ? prev.filter((c) => c.code !== j.code) : [...prev, j]));
                          buzz();
                        }}
                      >
                        {j.code}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="combo-preview">
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: combo.length ? 10 : 0 }}>
              <span style={{ fontSize: 11, color: "var(--mist-dim)", fontWeight: 700 }}>{t("combo_sel")}:</span>
              {combo.length === 0 && <span style={{ fontSize: 12, color: "var(--mist-dim)" }}>{t("combo_empty")}</span>}
              {combo.map((c, i) => (
                <span key={c.code} className="flag-chip active" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  {i > 0 && <span style={{ opacity: 0.6 }}>+</span>}
                  {c.code}
                  <button
                    type="button"
                    onClick={() => setCombo((prev) => prev.filter((x) => x.code !== c.code))}
                    style={{ background: "none", border: "none", color: "inherit", padding: 0, display: "flex", cursor: "pointer" }}
                    aria-label="remove"
                  >
                    <IcX size={11} />
                  </button>
                </span>
              ))}
              {combo.length > 0 && (
                <b style={{ marginLeft: "auto", fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--cyan)" }}>
                  {r2(comboTotal).toFixed(2)}
                </b>
              )}
            </div>
            <button className="btn" type="button" disabled={combo.length === 0} onClick={addCombo} style={{ width: "100%" }}>
              <IcPlus size={15} />
              {t("confirm_combo")}
            </button>
          </div>
        </div>
      )}

      {/* ---------------- lifts ---------------- */}
      {safeTab === "lift" && (
        <>
          <div className="cat-title">{discipline === "pairs" ? t("type_lift") : t("short_lifts")}</div>
          <LeveledGrid items={liftCatalog} type="lift" family={discipline === "pairs" ? "plift" : "dlift"} />
          {discipline === "dance" && (
            <>
              <div className="cat-title">{t("long_lift")}</div>
              <button type="button" className={gridBtn} style={{ ...gridStyle, flexDirection: "row", justifyContent: "space-between", padding: "12px 10px" }} onClick={() => addEl({ type: "lift", code: DANCE_LONG_LIFT.code, name: DANCE_LONG_LIFT.name, base: DANCE_LONG_LIFT.base })}>
                <span style={{ textAlign: "left" }}>
                  <b style={{ fontSize: 13, display: "block" }}>{DANCE_LONG_LIFT.code}</b>
                  <span style={{ fontSize: 10, color: "var(--mist-dim)" }}>{DANCE_LONG_LIFT.name}</span>
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--cyan)" }}>{DANCE_LONG_LIFT.base.toFixed(1)}</span>
              </button>
            </>
          )}
        </>
      )}

      {/* ---------------- spins ---------------- */}
      {safeTab === "spin" && <LeveledGrid items={spinCatalog} type="spin" family={discipline === "dance" ? "dspin" : discipline === "pairs" ? "pspin" : "spin"} />}

      {/* ---------------- steps ---------------- */}
      {safeTab === "step" && (
        <>
          <LeveledGrid items={[STSQ]} type="step" family="step" />
          {discipline === "dance" && (
            <>
              <div className="cat-title">PSt · {t("steps")}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {PST.map((p) => (
                  <button key={p.code} type="button" className={gridBtn} style={gridStyle} onClick={() => addEl({ type: "step", code: p.code, name: p.name, base: p.base })}>
                    <b style={{ fontSize: 13 }}>{p.code}</b>
                    <span style={{ fontSize: 10, color: "var(--mist-dim)" }}>{p.base.toFixed(1)}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ---------------- choreo ---------------- */}
      {safeTab === "choreo" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
          {choreoCatalog.map((c) => (
            <button key={c.code} type="button" className={gridBtn} style={{ ...gridStyle, flexDirection: "row", justifyContent: "space-between", padding: "12px 10px" }} onClick={() => addEl({ type: "choreo", code: c.code, name: c.name, base: c.base })}>
              <span style={{ textAlign: "left" }}>
                <b style={{ fontSize: 13, display: "block" }}>{c.code}</b>
                <span style={{ fontSize: 10, color: "var(--mist-dim)" }}>{c.name}</span>
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--cyan)" }}>{c.base.toFixed(1)}</span>
            </button>
          ))}
        </div>
      )}

      {!replaceMode && full(safeTab === "combo" ? "jump" : safeTab) && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 11.5, color: "var(--gold)", fontWeight: 700 }}>
          <IcX size={12} />
          {t("limit_note")} ({counts[safeTab === "combo" ? "jump" : safeTab]}/{limits[safeTab === "combo" ? "jump" : safeTab]})
        </div>
      )}

      {!replaceMode && (
        <button className="btn ghost" type="button" onClick={onClose} style={{ marginTop: 14 }}>
          <IcCheck size={15} />
          {t("done_word")}
        </button>
      )}
    </Sheet>
  );
}
