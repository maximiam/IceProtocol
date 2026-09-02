import { useMemo, useState } from "react";
import { useApp } from "../store";
import type { Protocol, SkElement } from "../lib/scoring";
import { computeTotals, countByType, discKey, elementBV, elementScore, fmt, goeValue, LIMITS, PCS_FACTOR, segKey, DISCIPLINES } from "../lib/scoring";
import { Chip, Empty, Reveal, SectionLabel, Stepper, Toggle, AnimatedNumber } from "../components/ui";
import { ScoreBar } from "../components/chrome";
import { PickerSheet } from "../components/sheets/PickerSheet";
import { GoeSheet } from "../components/sheets/GoeSheet";
import { ProtocolSheet } from "../components/sheets/InfoSheets";
import { IcChevR, IcPlus, IcScale } from "../components/icons";

const PCS_PRESETS = [6, 7, 8, 9, 9.5];

export function Studio() {
  const { t, lang, draft, patchDraft, resetDraft, saveProtocol, showToast, buzz } = useApp();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [goeEl, setGoeEl] = useState<SkElement | null>(null);
  const [savedProto, setSavedProto] = useState<Protocol | null>(null);

  const totals = useMemo(
    () => computeTotals(draft.elements, draft.pcs, draft.deds, draft.discipline, draft.segment),
    [draft],
  );
  const counts = countByType(draft.elements);
  const limits = LIMITS[draft.segment];
  const factor = PCS_FACTOR[draft.discipline][draft.segment];

  const slotPills: { label: string; n: number; max: number }[] = [
    { label: t("jumps"), n: counts.jump, max: limits.jump },
    { label: t("spins"), n: counts.spin, max: limits.spin },
    { label: t("steps"), n: counts.step, max: limits.step },
    ...(limits.choreo > 0 ? [{ label: t("choreo"), n: counts.choreo, max: limits.choreo }] : []),
  ];

  const onSave = () => {
    if (draft.elements.length === 0) {
      showToast(t("need_elements"));
      buzz("error");
      return;
    }
    const p = saveProtocol();
    buzz("success");
    showToast(t("saved_toast"));
    patchDraft({
      elements: [],
      pcs: { comp: 0, pres: 0, ss: 0 },
      deds: { falls: 0, time: false, costume: false, music: false },
    });
    setSavedProto(p);
  };

  const pcsBlock = (
    key: "comp" | "pres" | "ss",
    nameKey: "pcs_comp" | "pcs_pres" | "pcs_ss",
    subKey: "pcs_comp_sub" | "pcs_pres_sub" | "pcs_ss_sub",
    delay: number,
  ) => (
    <Reveal delay={delay} key={key} className="pcs-block">
      <div className="pcs-head">
        <b>{t(nameKey)}</b>
        <span className="val">{fmt(draft.pcs[key])}</span>
      </div>
      <div className="pcs-word">{t(subKey)}</div>
      <input
        type="range"
        min={0}
        max={10}
        step={0.25}
        value={draft.pcs[key]}
        onChange={(e) => patchDraft({ pcs: { ...draft.pcs, [key]: parseFloat(e.target.value) } })}
      />
      <div className="pcs-quick">
        {PCS_PRESETS.map((v) => (
          <button
            key={v}
            type="button"
            className={draft.pcs[key] === v ? "hit" : ""}
            onClick={() => {
              patchDraft({ pcs: { ...draft.pcs, [key]: v } });
              buzz();
            }}
          >
            {v.toFixed(2)}
          </button>
        ))}
      </div>
    </Reveal>
  );

  return (
    <div>
      <Reveal>
        <h1 className="h1">
          {t("nav_studio")} · <em>{t(segKey(draft.discipline, draft.segment))}</em>
        </h1>
        <p className="sub">{t(discKey(draft.discipline))} · {t("picker_sub")}</p>
      </Reveal>

      <Reveal delay={50}>
        <div className="glass" style={{ padding: 15, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 13 }}>
            <div style={{ flex: 1 }}>
              <label className="field-label" htmlFor="skater-name">
                {t("athlete")}
              </label>
              <input
                id="skater-name"
                className="input"
                placeholder={t("athlete_ph")}
                value={draft.skater}
                onChange={(e) => patchDraft({ skater: e.target.value })}
              />
            </div>
            <button
              className="btn ghost sm"
              type="button"
              style={{ flexShrink: 0, marginBottom: 1 }}
              onClick={() => {
                resetDraft();
                showToast(t("draft_cleared"));
                buzz();
              }}
            >
              {t("reset")}
            </button>
          </div>
          <div className="chip-row" style={{ marginBottom: 11 }}>
            {DISCIPLINES.map((d) => (
              <Chip key={d} active={draft.discipline === d} onClick={() => patchDraft({ discipline: d })}>
                {t(discKey(d))}
              </Chip>
            ))}
          </div>
          <div className="seg-toggle">
            <button type="button" className={draft.segment === "sp" ? "active" : ""} onClick={() => patchDraft({ segment: "sp" })}>
              {t(segKey(draft.discipline, "sp"))}
            </button>
            <button type="button" className={draft.segment === "fs" ? "active" : ""} onClick={() => patchDraft({ segment: "fs" })}>
              {t(segKey(draft.discipline, "fs"))}
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={90}>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", margin: "0 2px 4px" }}>
          {slotPills.map((s) => (
            <span key={s.label} className={`slot-pill ${s.n >= s.max ? "full" : ""}`}>
              {s.label} {s.n}/{s.max}
            </span>
          ))}
        </div>

        <SectionLabel>{t("elements_title")}</SectionLabel>
        {draft.elements.length === 0 && (
          <div className="glass glass-tight" style={{ marginBottom: 8 }}>
            <Empty icon={<IcScale size={38} />} title={t("elems_empty")} sub={t("elems_empty_sub")} />
          </div>
        )}
        {draft.elements.map((el, i) => {
          const g = goeValue(el);
          return (
            <button key={el.id} className="elem-row glass glass-tight" type="button" onClick={() => setGoeEl(el)}>
              <span className="elem-idx">{i + 1}</span>
              <span className="elem-info">
                <b>{el.code}</b>
                <span>
                  {el.name} · BV {fmt(elementBV(el))}
                </span>
                {el.flags.length > 0 && (
                  <span className="elem-flags">
                    {el.flags.map((f) => (
                      <i key={f}>{f}</i>
                    ))}
                  </span>
                )}
              </span>
              <span className={`elem-goe ${g > 0 ? "pos" : g < 0 ? "neg" : "zero"}`}>
                {g > 0 ? "+" : ""}
                {fmt(g)}
              </span>
              <span className="elem-score">{fmt(elementScore(el))}</span>
              <IcChevR size={14} className="opacity-40" />
            </button>
          );
        })}
        <button className="add-elem-btn" type="button" onClick={() => setPickerOpen(true)}>
          <IcPlus size={16} />
          {t("add_element")}
        </button>
      </Reveal>

      <Reveal delay={130}>
        <SectionLabel>
          {t("pcs_title")} · <span style={{ color: "var(--gold)" }}>× {factor.toFixed(2)}</span>
        </SectionLabel>
        <div className="glass" style={{ padding: "16px 15px 6px" }}>
          {pcsBlock("comp", "pcs_comp", "pcs_comp_sub", 0)}
          {pcsBlock("pres", "pcs_pres", "pcs_pres_sub", 30)}
          {pcsBlock("ss", "pcs_ss", "pcs_ss_sub", 60)}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "4px 1px 14px", borderTop: "1px solid var(--glass-border)" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--mist)" }}>{t("pcs_sum")}</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, color: "var(--gold)" }}>
              <AnimatedNumber value={totals.pcsScore} />
            </span>
          </div>
        </div>
      </Reveal>

      <Reveal delay={170}>
        <SectionLabel>{t("ded_title")}</SectionLabel>
        <div className="glass" style={{ padding: "4px 15px 6px" }}>
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
          ).map(([key, nameK, subK]) => (
            <div className="ded-row" key={key}>
              <div>
                <div className="dname">{t(nameK)}</div>
                <div className="dsub">{t(subK)}</div>
              </div>
              <Toggle
                on={draft.deds[key]}
                onChange={(v) => {
                  patchDraft({ deds: { ...draft.deds, [key]: v } });
                  buzz();
                }}
              />
            </div>
          ))}
        </div>
        <p style={{ fontSize: 10.5, color: "var(--mist-dim)", margin: "10px 4px 0", lineHeight: 1.5 }}>{t("rules_note")}</p>
      </Reveal>

      <ScoreBar tes={totals.tes} pcs={totals.pcsScore} ded={totals.deductions} total={totals.total} onSave={onSave} canSave={draft.elements.length > 0} />

      <PickerSheet open={pickerOpen} onClose={() => setPickerOpen(false)} />
      <GoeSheet el={goeEl ? draft.elements.find((e) => e.id === goeEl.id) ?? null : null} onClose={() => setGoeEl(null)} />
      <ProtocolSheet protocol={savedProto} onClose={() => setSavedProto(null)} />
    </div>
  );
}
