import { useState } from "react";
import { Sheet } from "../ui";
import { useApp } from "../../store";
import type { SkElement } from "../../lib/scoring";
import { elementBV, fmt, goeValue, JUMP_FLAGS, r2, SPIN_FLAGS } from "../../lib/scoring";
import { findLeveled, LEVEL_KEYS } from "../../data/elements";
import { PickerSheet, type NewElement } from "./PickerSheet";
import { IcTrash } from "../icons";
import { AnimatedNumber } from "../ui";

export function GoeSheet({
  el,
  onClose,
}: {
  el: SkElement | null;
  onClose: () => void;
}) {
  const { t, updateElement, removeElement, patchDraft, draft, buzz, showToast } = useApp();
  const [replaceOpen, setReplaceOpen] = useState(false);
  if (!el) return null;

  const def = el.defCode ? findLeveled(el.defCode) : null;

  const setGoe = (g: number) => updateElement({ ...el, goe: g });

  const setLevel = (idx: number) => {
    if (!def) return;
    const base = def.bases[idx];
    if (!base || base <= 0) return;
    updateElement({ ...el, levelIdx: idx, base, code: `${def.code}${LEVEL_KEYS[idx]}` });
    buzz();
  };

  const toggleFlag = (f: string) => {
    let flags = el.flags.includes(f) ? el.flags.filter((x) => x !== f) : [...el.flags, f];
    if (f === "<" && flags.includes("<<")) flags = flags.filter((x) => x !== "<<");
    if (f === "<<" && flags.includes("<")) flags = flags.filter((x) => x !== "<");
    updateElement({ ...el, flags });
    buzz();
  };

  const toggleFall = () => {
    const on = !el.fall;
    updateElement({ ...el, fall: on });
    patchDraft({ deds: { ...draft.deds, falls: Math.max(0, draft.deds.falls + (on ? 1 : -1)) } });
    buzz(on ? "error" : "light");
  };

  const del = () => {
    if (el.fall) patchDraft({ deds: { ...draft.deds, falls: Math.max(0, draft.deds.falls - 1) } });
    removeElement(el.id);
    buzz("medium");
    showToast(t("deleted_toast"));
    onClose();
  };

  const onReplace = (n: NewElement) => {
    updateElement({
      id: el.id,
      type: n.type,
      code: n.code,
      name: n.name,
      base: n.base,
      defCode: n.defCode,
      levelIdx: n.levelIdx,
      flags: [],
      goe: 0,
      fall: el.fall,
    });
    buzz("success");
    showToast(t("saved_toast"));
  };

  const gv = goeValue(el);
  const flagSet = el.type === "jump" ? JUMP_FLAGS : el.type === "spin" ? SPIN_FLAGS : [];

  return (
    <Sheet open={!!el} onClose={onClose} title={el.code} sub={el.name}>
      {/* level switcher */}
      {def && (
        <>
          <div className="cat-title">{t("lvl")}</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            {LEVEL_KEYS.map((k, i) => {
              const base = def.bases[i];
              const disabled = !base || base <= 0;
              return (
                <button
                  key={k}
                  type="button"
                  className={`flag-chip ${el.levelIdx === i ? "active" : ""}`}
                  disabled={disabled}
                  style={{ flex: 1, textAlign: "center", opacity: disabled ? 0.3 : 1 }}
                  onClick={() => setLevel(i)}
                >
                  {k}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="glass glass-tight" style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", gap: 10, margin: "8px 0 6px" }}>
        <div>
          <div style={{ fontSize: 10.5, color: "var(--mist-dim)", textTransform: "uppercase", letterSpacing: 0.4 }}>
            {t("base_value")}
          </div>
          <b style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600 }}>{fmt(el.base)}</b>
          {el.flags.some((f) => ["x", "<", "<<", "REP"].includes(f)) && (
            <div style={{ fontSize: 10.5, color: "var(--mist-dim)", marginTop: 2 }}>
              {t("eff_bv")}: <span style={{ color: "var(--frost)", fontWeight: 800 }}>{fmt(elementBV(el))}</span>
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10.5, color: "var(--mist-dim)", textTransform: "uppercase", letterSpacing: 0.4 }}>
            {t("elem_total")}
          </div>
          <b style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--cyan)" }}>
            <AnimatedNumber value={r2(elementBV(el) + gv)} />
          </b>
        </div>
      </div>

      {/* fall */}
      <button
        type="button"
        className="glass glass-tight"
        onClick={toggleFall}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", marginBottom: 6, cursor: "pointer", borderColor: el.fall ? "rgba(255,127,122,.5)" : undefined }}
      >
        <span style={{ textAlign: "left" }}>
          <b style={{ fontSize: 13.5, display: "block", color: el.fall ? "var(--ember)" : "var(--frost)" }}>{t("fall_mark")}</b>
          <span style={{ fontSize: 10.5, color: "var(--mist-dim)" }}>{t("fall_sub")}</span>
        </span>
        <span
          className="toggle"
          style={{ background: el.fall ? "linear-gradient(135deg,var(--ember),#ffb3af)" : undefined, position: "relative", width: 44, height: 26, borderRadius: 100, flexShrink: 0 }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: el.fall ? 21 : 3,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: el.fall ? "#3a0d0a" : "var(--frost)",
              transition: "left .2s",
            }}
          />
        </span>
      </button>

      <div className="cat-title">{t("goe_val")}</div>
      <div className="goe-scale">
        {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((g) => (
          <button
            key={g}
            type="button"
            className={`goe-btn ${el.goe === g ? `active ${g > 0 ? "pos" : g < 0 ? "neg" : "zero"}` : ""}`}
            onClick={() => {
              setGoe(g);
              buzz();
            }}
          >
            {g > 0 ? `+${g}` : g}
          </button>
        ))}
      </div>
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <span
          className="badge"
          style={{
            fontSize: 12,
            color: gv > 0 ? "var(--mint)" : gv < 0 ? "var(--ember)" : "var(--mist)",
            fontWeight: 800,
          }}
        >
          GOE {gv > 0 ? "+" : ""}
          <AnimatedNumber value={gv} />
        </span>
      </div>

      {flagSet.length > 0 && (
        <>
          <div className="cat-title">{t("flags")}</div>
          <div className="flag-scale">
            {flagSet.map((f) => (
              <button key={f} type="button" className={`flag-chip ${el.flags.includes(f) ? "active" : ""}`} onClick={() => toggleFlag(f)}>
                {f}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "var(--mist-dim)", lineHeight: 1.6, margin: "0 2px 12px" }}>{t("flag_hint")}</p>
        </>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn ghost" type="button" onClick={() => setReplaceOpen(true)} style={{ flex: 1 }}>
          {t("replace_elem")}
        </button>
        <button className="btn ghost" type="button" onClick={del} style={{ color: "var(--ember)", borderColor: "rgba(255,127,122,.4)", flex: 1 }}>
          <IcTrash size={15} />
          {t("delete_elem")}
        </button>
      </div>

      <PickerSheet
        open={replaceOpen}
        onClose={() => setReplaceOpen(false)}
        discipline={draft.discipline}
        segment={draft.segment}
        category={draft.category}
        onPick={onReplace}
      />
    </Sheet>
  );
}
