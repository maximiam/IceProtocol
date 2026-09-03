import { useMemo, useState } from "react";
import { useApp } from "../store";
import type { ElemType, SkElement } from "../lib/scoring";
import {
  catKey,
  categoryOf,
  computeTotals,
  discKey,
  elementBV,
  elementScore,
  getLimits,
  goeValue,
  segKey,
  SLOT_ORDER,
} from "../lib/scoring";
import { AnimatedNumber, Empty, Reveal, SectionLabel, Stepper, Toggle } from "../components/ui";

function PcsSlider({
  label,
  sub,
  value,
  onChange,
  onChangeCommitted,
}: {
  label: string;
  sub: string;
  value: number;
  onChange: (v: number) => void;
  onChangeCommitted: () => void;
}) {
  const set = (v: number) => onChange(Math.round(v * 4) / 4);
  return (
    <div className="pcs-item">
      <div className="pcs-head">
        <b>{label}</b>
        <span className="val">{value.toFixed(2)}</span>
      </div>
      <div className="pcs-word">{sub}</div>
      <input
        type="range"
        min={0}
        max={10}
        step={0.25}
        value={value}
        onChange={(e) => set(parseFloat(e.target.value))}
        onPointerUp={onChangeCommitted}
        onKeyUp={onChangeCommitted}
      />
      <div className="pcs-quick">
        {[5, 6.5, 7.5, 8.5].map((v) => (
          <button key={v} type="button" onClick={() => { set(v); onChangeCommitted(); }}>
            {v.toFixed(2)}
          </button>
        ))}
      </div>
    </div>
  );
}
import { ScoreBar } from "../components/chrome";
import { VideoFrame } from "../components/VideoFrame";
import { PickerSheet } from "../components/sheets/PickerSheet";
import { GoeSheet } from "../components/sheets/GoeSheet";
import { ProtocolSheet } from "../components/sheets/InfoSheets";
import { IcPlus, IcScale, IcTrash } from "../components/icons";
import { findLeveled, LEVEL_KEYS } from "../data/elements";

const TYPE_KEY: Record<ElemType, "jumps" | "type_lift" | "spins" | "steps" | "choreo"> = {
  jump: "jumps",
  lift: "type_lift",
  spin: "spins",
  step: "steps",
  choreo: "choreo",
};

export function Studio() {
  const { t, draft, patchDraft, updateElement, resetDraft, saveProtocol, buzz, showToast } = useApp();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editEl, setEditEl] = useState<SkElement | null>(null);
  const [saved, setSaved] = useState<ReturnType<typeof saveProtocol> | null>(null);

  const cat = categoryOf(draft.discipline, draft.category);
  const limits = getLimits(draft.discipline, draft.segment, cat);

  const totals = useMemo(
    () => computeTotals(draft.elements, draft.pcs, draft.deds, draft.discipline, draft.segment),
    [draft],
  );

  const counts = useMemo(() => {
    const c: Record<ElemType, number> = { jump: 0, lift: 0, spin: 0, step: 0, choreo: 0 };
    for (const el of draft.elements) c[el.type]++;
    return c;
  }, [draft.elements]);

  const live = draft.elements.filter((e) => e.id === editEl?.id)[0] ?? editEl;

  const onSaved = () => {
    const p = saveProtocol();
    buzz("success");
    showToast(t("saved_toast"));
    setSaved(p);
  };

  return (
    <div>
      <Reveal>
        <h1 className="h1">
          {t("nav_studio")} <em>ISU</em>
        </h1>
        <p className="sub" style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span className="badge violet">{t(discKey(draft.discipline))}</span>
          <span className="badge cyan">{t(catKey(cat))}</span>
          <span className="badge gold">{t(segKey(draft.discipline, draft.segment))}</span>
        </p>
      </Reveal>

      <VideoFrame />

      <SectionLabel>{t("elements_title")}</SectionLabel>

      <Reveal delay={60}>
        <div className="glass" style={{ padding: "13px 14px 6px", marginBottom: 8 }}>
          {SLOT_ORDER.filter((tp) => limits[tp] > 0).map((tp) => (
            <div key={tp} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
              <span style={{ width: 82, flexShrink: 0, fontSize: 11, fontWeight: 800, color: "var(--mist)" }}>{t(TYPE_KEY[tp])}</span>
              <div className="slot-grid" style={{ flex: 1, marginBottom: 0 }}>
                {Array.from({ length: limits[tp] }, (_, i) => {
                  const filled = i < counts[tp];
                  return <span key={i} className={`slot ${filled ? (tp === "lift" ? "zero" : "pos") : ""}`} />;
                })}
              </div>
              <span style={{ fontSize: 11, color: counts[tp] >= limits[tp] ? "var(--gold)" : "var(--mist-dim)", fontWeight: 800, flexShrink: 0 }}>
                {counts[tp]}/{limits[tp]}
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      {draft.elements.length === 0 && (
        <div className="glass glass-tight" style={{ marginBottom: 8 }}>
          <Empty icon={<IcScale size={38} />} title={t("elems_empty")} sub={t("elems_empty_sub")} />
        </div>
      )}

      {draft.elements.map((el, i) => {
        const score = elementScore(el);
        const bv = elementBV(el);
        const gv = goeValue(el);
        const def = el.defCode ? findLeveled(el.defCode) : null;
        const lvl = el.levelIdx ?? -1;

        const bumpGoe = (d: number) => {
          const g = Math.max(-5, Math.min(5, el.goe + d));
          updateElement({ ...el, goe: g });
          buzz();
        };
        const bumpLevel = (d: number) => {
          if (!def || lvl < 0) return;
          let n = lvl + d;
          while (n >= 0 && n <= 4 && (!def.bases[n] || def.bases[n] <= 0)) n += d;
          if (n < 0 || n > 4 || !def.bases[n] || def.bases[n] <= 0) return;
          updateElement({ ...el, levelIdx: n, base: def.bases[n], code: `${def.code}${LEVEL_KEYS[n]}` });
          buzz();
        };
        const flagCls = (f: string) =>
          f === "x" ? "flag-chip-mini bonus" : ["<", "<<", "REP"].includes(f) ? "flag-chip-mini bad" : f === "V" ? "flag-chip-mini bad" : "flag-chip-mini";

        return (
          <div key={el.id} className="elem-row glass glass-tight" style={{ cursor: "pointer" }} onClick={() => { setEditEl(el); buzz(); }}>
            <span className="elem-idx">{i + 1}</span>
            <div className="elem-info">
              <b style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                {el.code}
                {el.fall && <i className="flag-chip-mini fall-chip">{t("fall_mark")}</i>}
                {el.flags.map((f) => (
                  <i key={f} className={flagCls(f)}>{f}</i>
                ))}
                {def && (
                  <span className="lvl-nav" onClick={(e) => e.stopPropagation()}>
                    <button className="lvl-btn" type="button" onClick={() => bumpLevel(-1)} aria-label="level down">‹</button>
                    <button className="lvl-btn" type="button" onClick={() => bumpLevel(1)} aria-label="level up">›</button>
                  </span>
                )}
              </b>
              <span>
                BV {bv.toFixed(2)}
                {gv !== 0 && <span style={{ color: gv > 0 ? "var(--mint)" : "var(--ember)" }}> · GOE {gv > 0 ? "+" : ""}{gv.toFixed(2)}</span>}
              </span>
            </div>
            <span className="goe-step" onClick={(e) => e.stopPropagation()}>
              <button className="goe-btn-mini" type="button" onClick={() => bumpGoe(-1)} aria-label="goe minus">−</button>
              <span className={`goe-val ${el.goe > 0 ? "pos" : el.goe < 0 ? "neg" : "zero"}`}>{el.goe > 0 ? `+${el.goe}` : el.goe}</span>
              <button className="goe-btn-mini" type="button" onClick={() => bumpGoe(1)} aria-label="goe plus">+</button>
            </span>
            <b style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, minWidth: 50, textAlign: "right" }}>{score.toFixed(2)}</b>
          </div>
        );
      })}

      <button className="add-elem-btn" type="button" onClick={() => setPickerOpen(true)}>
        <IcPlus size={15} />
        {t("add_element")}
      </button>
      {draft.elements.length > 0 && (
        <div style={{ fontSize: 10.5, color: "var(--mist-dim)", textAlign: "center", margin: "8px 0 0" }}>{t("tap_hint")}</div>
      )}

      <SectionLabel>{t("pcs_title")}</SectionLabel>
      <Reveal delay={80}>
        <div className="glass" style={{ padding: "16px 15px 8px" }}>
          <PcsSlider label={t("pcs_comp")} sub={t("pcs_comp_sub")} value={draft.pcs.comp} onChange={(v) => patchDraft({ pcs: { ...draft.pcs, comp: v } })} onChangeCommitted={() => buzz()} />
          <PcsSlider label={t("pcs_pres")} sub={t("pcs_pres_sub")} value={draft.pcs.pres} onChange={(v) => patchDraft({ pcs: { ...draft.pcs, pres: v } })} onChangeCommitted={() => buzz()} />
          <PcsSlider label={t("pcs_ss")} sub={t("pcs_ss_sub")} value={draft.pcs.ss} onChange={(v) => patchDraft({ pcs: { ...draft.pcs, ss: v } })} onChangeCommitted={() => buzz()} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 2px 8px", borderTop: "1px solid var(--glass-border)" }}>
            <span style={{ fontSize: 12, color: "var(--mist)", fontWeight: 700 }}>
              {t("pcs_factor")}: ×{(draft.discipline === "men" || draft.discipline === "jmen" ? (draft.segment === "sp" ? 1.67 : 3.33) : draft.discipline === "dance" ? (draft.segment === "sp" ? 1.33 : 2.0) : draft.segment === "sp" ? 1.33 : 2.67).toFixed(2)}
            </span>
            <b style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--gold)" }}>
              <AnimatedNumber value={totals.pcsScore} />
            </b>
          </div>
        </div>
      </Reveal>

      <SectionLabel>{t("ded_title")}</SectionLabel>
      <Reveal delay={100}>
        <div className="glass" style={{ padding: "2px 15px 6px" }}>
          <div className="ded-row">
            <div>
              <div className="dname">{t("ded_falls")}</div>
              <div className="dsub">{t("ded_falls_sub")}</div>
            </div>
            <Stepper
              value={draft.deds.falls}
              onChange={(v) => {
                patchDraft({ deds: { ...draft.deds, falls: v } });
                buzz();
              }}
            />
          </div>
          {(
            [
              ["time", "ded_time", "ded_time_sub"],
              ["costume", "ded_costume", "ded_costume_sub"],
              ["music", "ded_music", "ded_music_sub"],
            ] as const
          ).map(([k, nk, sk]) => (
            <div className="ded-row" key={k}>
              <div>
                <div className="dname">{t(nk)}</div>
                <div className="dsub">{t(sk)}</div>
              </div>
              <Toggle
                on={draft.deds[k]}
                onChange={(v) => {
                  patchDraft({ deds: { ...draft.deds, [k]: v } });
                  buzz();
                }}
              />
            </div>
          ))}
        </div>
      </Reveal>

      <div style={{ height: 8 }} />
      <button
        className="btn ghost sm"
        type="button"
        style={{ margin: "0 auto" }}
        onClick={() => {
          resetDraft();
          showToast(t("draft_cleared"));
          buzz();
        }}
      >
        <IcTrash size={14} />
        {t("reset")}
      </button>

      <ScoreBar tes={totals.tes} pcs={totals.pcsScore} ded={totals.deductions} total={totals.total} onSave={onSaved} canSave={draft.elements.length > 0} />

      <PickerSheet open={pickerOpen} onClose={() => setPickerOpen(false)} discipline={draft.discipline} segment={draft.segment} category={cat} />
      <GoeSheet el={live} onClose={() => setEditEl(null)} />
      <ProtocolSheet protocol={saved} onClose={() => setSaved(null)} />
    </div>
  );
}
