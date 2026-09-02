import React from "react";
import { Sheet } from "../ui";
import { useApp } from "../../store";
import type { SkElement } from "../../lib/scoring";
import { elementBV, fmt, goeValue, r2 } from "../../lib/scoring";
import { IcTrash } from "../icons";
import { AnimatedNumber } from "../ui";

const JUMP_FLAGS = ["x", "<", "<<", "q", "!", "e"];

export function GoeSheet({
  el,
  onClose,
}: {
  el: SkElement | null;
  onClose: () => void;
}) {
  const { t, updateElement, removeElement, buzz, showToast } = useApp();
  if (!el) return null;

  const setGoe = (g: number) => updateElement({ ...el, goe: g });

  const toggleFlag = (f: string) => {
    let flags = el.flags.includes(f) ? el.flags.filter((x) => x !== f) : [...el.flags, f];
    if (f === "<" && flags.includes("<<")) flags = flags.filter((x) => x !== "<<");
    if (f === "<<" && flags.includes("<")) flags = flags.filter((x) => x !== "<");
    updateElement({ ...el, flags });
    buzz();
  };

  const del = () => {
    removeElement(el.id);
    buzz("medium");
    showToast(t("deleted_toast"));
    onClose();
  };

  const gv = goeValue(el);

  return (
    <Sheet open={!!el} onClose={onClose} title={`${el.code}`} sub={el.name}>
      <div className="glass glass-tight" style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 10.5, color: "var(--mist-dim)", textTransform: "uppercase", letterSpacing: 0.4 }}>
            {t("base_value")}
          </div>
          <b style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600 }}>{fmt(el.base)}</b>
          {el.flags.some((f) => ["x", "<", "<<"].includes(f)) && (
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

      {el.type === "jump" && (
        <>
          <div className="cat-title">{t("flags")}</div>
          <div className="flag-scale">
            {JUMP_FLAGS.map((f) => (
              <button key={f} type="button" className={`flag-chip ${el.flags.includes(f) ? "active" : ""}`} onClick={() => toggleFlag(f)}>
                {f}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "var(--mist-dim)", lineHeight: 1.6, margin: "0 2px 12px" }}>{t("flag_hint")}</p>
        </>
      )}

      <button className="btn ghost" type="button" onClick={del} style={{ color: "var(--ember)", borderColor: "rgba(255,127,122,.4)", marginTop: 6 }}>
        <IcTrash size={15} />
        {t("delete_elem")}
      </button>
    </Sheet>
  );
}
