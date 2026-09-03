import { useMemo, useState } from "react";
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
import { IcPlus, IcX } from "../icons";

type JumpTab = "combo" | "single" | "twist" | "throw";
type Tab = "jump" | "lift" | "spin" | "step" | "choreo";

interface Props {
  open: boolean;
  onClose: () => void;
  discipline: Discipline;
  segment: Segment;
  category: Category;
}

export function PickerSheet({ open, onClose, discipline, segment, category }: Props) {
  const { t, lang, draft, addElement, buzz, showToast } = useApp();
  const cat = categoryOf(discipline, category);
  const limits = getLimits(discipline, segment, cat);
  const counts = useMemo(() => countByType(draft.elements), [draft.elements]);

  const [tab, setTab] = useState<Tab>("jump");
  const [combo, setCombo] = useState<ElemDef[]>([]);
  const [jumpTab, setJumpTab] = useState<JumpTab>("combo");
  const [level, setLevel] = useState(1);

  const availableTabs: Tab[] = useMemo(() => {
    const list: Tab[] = [];
    if (limits.jump > 0) list.push("jump");
    if (limits.lift > 0) list.push("lift");
    if (limits.spin > 0) list.push("spin");
    if (limits.step > 0) list.push("step");
    if (limits.choreo > 0) list.push("choreo");
    return list;
  }, [limits]);

  const safeTab = availableTabs.includes(tab) ? tab : availableTabs[0] ?? "spin";

  const spinCatalog: LeveledDef[] =
    discipline === "dance" ? DANCE_SPINS : discipline === "pairs" ? [...SINGLES_SPINS, ...PAIRS_SPINS] : SINGLES_SPINS;

  const stepCatalog: LeveledDef[] = discipline === "dance" ? [{ ...STSQ, name: lang === "ru" ? "Дорожка шагов / секция паттерна" : "Step / pattern section" }] : [STSQ];

  const choreoCatalog: ElemDef[] = discipline === "dance" ? DANCE_CHOREO : CHSQ;
  const liftCatalog: LeveledDef[] = discipline === "pairs" ? PAIRS_LIFTS : DANCE_SHORT_LIFTS;

  const addEl = (e: { type: ElemType; code: string; name: string; base: number }) => {
    if (counts[e.type] >= limits[e.type]) {
      showToast(t("limit_note"));
      buzz("error");
      return;
    }
    addElement({ id: uid(), type: e.type, code: e.code, name: e.name, base: e.base, flags: [], goe: 0 });
    buzz("medium");
  };

  const addCombo = () => {
    if (!combo.length) return;
    if (counts.jump >= limits.jump) {
      showToast(t("limit_note"));
      buzz("error");
      return;
    }
    addElement({
      id: uid(),
      type: "jump",
      code: combo.map((c) => c.code).join("+"),
      name: combo.map((c) => c.name).join(" + "),
      base: comboBase(combo.map((c) => c.base)),
      flags: [],
      goe: 0,
    });
    setCombo([]);
    buzz("medium");
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

  const LeveledGrid = ({ items, type }: { items: LeveledDef[]; type: ElemType }) => (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "2px 0 10px" }}>
        <span style={{ fontSize: 11, color: "var(--mist-dim)", fontWeight: 700 }}>{t("base_value")}:</span>
        {SPIN_LEVEL_KEYS.map((k, i) => (
          <button
            key={k}
            type="button"
            className={`flag-chip ${level === i ? "active" : ""}`}
            style={{ padding: "6px 11px" }}
            onClick={() => {
              setLevel(i);
              buzz();
            }}
          >
            {k}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
        {items.map((s) => {
          const base = s.bases[level] ?? 0;
          const disabled = base <= 0;
          return (
            <button
              key={s.code}
              type="button"
              className={gridBtn}
              disabled={disabled}
              style={{ ...gridStyle, padding: "12px 8px", flexDirection: "row", justifyContent: "space-between", opacity: disabled ? 0.35 : 1 }}
              onClick={() =>
                addEl({
                  type,
                  code: `${s.code}${SPIN_LEVEL_KEYS[level]}`,
                  name: s.name,
                  base,
                })
              }
            >
              <span style={{ textAlign: "left", minWidth: 0 }}>
                <b style={{ fontSize: 13, display: "block" }}>
                  {s.code}
                  {SPIN_LEVEL_KEYS[level]}
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

  const comboTotal = comboBase(combo.map((c) => c.base));

  return (
    <Sheet open={open} onClose={onClose} title={t("picker_title")} sub={t("picker_sub")}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {availableTabs.map((k) => {
          const label =
            k === "jump" ? t("jumps") : k === "lift" ? t("type_lift") : k === "spin" ? t("spins") : k === "step" ? t("steps") : t("choreo");
          return (
            <Chip key={k} active={safeTab === k} onClick={() => setTab(k)}>
              {label}
              <span style={{ opacity: 0.75 }}>
                {counts[k]}/{limits[k]}
              </span>
            </Chip>
          );
        })}
      </div>

      {safeTab === "jump" && discipline !== "pairs" && (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            <Chip active={jumpTab === "combo"} onClick={() => setJumpTab("combo")}>
              {t("combo")}
            </Chip>
            <Chip active={jumpTab === "single"} onClick={() => setJumpTab("single")}>
              {t("single")}
            </Chip>
          </div>
        </>
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
        </>
      )}

      {safeTab === "jump" && jumpTab === "combo" && discipline !== "pairs" && (
        <div className="glass glass-tight" style={{ padding: 14, marginBottom: 12 }}>
          <div className="slot-grid" style={{ marginBottom: 8 }}>
            {[0, 1, 2].map((i) => {
              const c = combo[i];
              return (
                <span key={i} className={`slot ${c ? "zero" : ""}`} style={{ width: 52, fontSize: 12 }}>
                  {c ? c.code : "—"}
                </span>
              );
            })}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--mist-dim)", marginBottom: 10, lineHeight: 1.5 }}>
            {t("combo_hint")} · {t("base_value")}: <b style={{ color: "var(--cyan)" }}>{r2(comboTotal).toFixed(2)}</b>
          </div>
          {Object.entries(JUMP_GROUPS).map(([key, g]) => (
            <div key={key} className="cat-group">
              <div className="cat-title">{g.group}</div>
              <div style={{ display: "flex", gap: 6 }}>
                {filterJumps(discipline, g.jumps).map((j) => {
                  const inCombo = combo.some((c) => c.code === j.code);
                  const full = combo.length >= 3;
                  return (
                    <button
                      key={j.code}
                      type="button"
                      className={`flag-chip ${inCombo ? "active" : ""}`}
                      disabled={full && !inCombo}
                      style={{ opacity: full && !inCombo ? 0.35 : 1 }}
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
          <button className="btn sm" type="button" style={{ width: "100%", marginTop: 12 }} disabled={combo.length === 0} onClick={addCombo}>
            <IcPlus size={14} />
            {t("confirm_combo")} · {r2(comboTotal).toFixed(2)}
          </button>
        </div>
      )}

      {safeTab === "jump" && jumpTab === "single" && (
        <div className="cat-group">
          {discipline === "pairs" ? (
            <>
              <div className="cat-title">{t("jumps")}</div>
              <JumpGrid jumps={filterJumps(discipline, JUMP_GROUPS.axel.jumps).concat(filterJumps(discipline, JUMP_GROUPS.toeloop.jumps), filterJumps(discipline, JUMP_GROUPS.salchow.jumps), filterJumps(discipline, JUMP_GROUPS.loop.jumps), filterJumps(discipline, JUMP_GROUPS.flip.jumps), filterJumps(discipline, JUMP_GROUPS.lutz.jumps))} />
            </>
          ) : (
            Object.entries(JUMP_GROUPS).map(([key, g]) => (
              <div key={key}>
                <div className="cat-title">{g.group}</div>
                <JumpGrid jumps={filterJumps(discipline, g.jumps)} />
              </div>
            ))
          )}
        </div>
      )}

      {safeTab === "jump" && jumpTab === "twist" && discipline === "pairs" && <LeveledGrid items={TWISTS} type="jump" />}
      {safeTab === "jump" && jumpTab === "throw" && discipline === "pairs" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {THROWS.map((th) => (
            <button key={th.code} type="button" className={gridBtn} style={gridStyle} onClick={() => addEl({ type: "jump", code: th.code, name: th.name, base: th.base })}>
              <b style={{ fontSize: 12.5 }}>{th.code}</b>
              <span style={{ fontSize: 10, color: "var(--mist-dim)" }}>{th.base.toFixed(1)}</span>
            </button>
          ))}
        </div>
      )}

      {safeTab === "lift" && (
        <>
          <div className="cat-title">{discipline === "pairs" ? t("type_lift") : t("short_lifts")}</div>
          <LeveledGrid items={liftCatalog} type="lift" />
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

      {safeTab === "spin" && <LeveledGrid items={spinCatalog} type="spin" />}
      {safeTab === "step" && <LeveledGrid items={stepCatalog} type="step" />}

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

      {counts[safeTab] >= limits[safeTab] && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 11.5, color: "var(--gold)", fontWeight: 700 }}>
          <IcX size={12} />
          {t("limit_note")} ({counts[safeTab]}/{limits[safeTab]})
        </div>
      )}
    </Sheet>
  );
}
