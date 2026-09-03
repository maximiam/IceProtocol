import { Sheet } from "../ui";
import { useApp } from "../../store";
import type { Protocol } from "../../lib/scoring";
import { catKey, discKey, elementBV, elementScore, factorGroup, fmt, goeValue, officialSegmentLabel, PCS_FACTOR, segKey } from "../../lib/scoring";
import type { Skater } from "../../data/skaters";
import { IcCheck, IcCopy, IcShare } from "../icons";

/* ---- program structure reference (ISU rules, seniors & juniors) ---- */
type L2 = { ru: string; en: string };
const STRUCT: { title: L2; color: string; rows: { seg: L2; items: L2[] }[] }[] = [
  {
    title: { ru: "Мужчины · Юноши", en: "Men · Junior Men" },
    color: "var(--cyan)",
    rows: [
      {
        seg: { ru: "Короткая · 2:40", en: "Short · 2:40" },
        items: [
          { ru: "Соло-аксель: 2A–4A (юниоры: 2A–3A)", en: "Solo Axel: 2A–4A (juniors: 2A–3A)" },
          { ru: "Соло: 3F или 3Lz (взрослые — также 4F/4Lz)", en: "Solo: 3F or 3Lz (seniors also 4F/4Lz)" },
          { ru: "Каскад: 3+3 / 3+2 (взрослые — 4+2, 4+3)", en: "Combo: 3+3 / 3+2 (seniors 4+2, 4+3)" },
          { ru: "FSSp — прыжковое вращение сидя", en: "FSSp — flying sit spin" },
          { ru: "CCoSp (юниоры — также CSSp)", en: "CCoSp (juniors also CSSp)" },
          { ru: "StSq — дорожка шагов", en: "StSq — step sequence" },
        ],
      },
      {
        seg: { ru: "Произвольная · 4:00 (юниоры 3:30)", en: "Free · 4:00 (juniors 3:30)" },
        items: [
          { ru: "До 7 прыжковых элементов, минимум один — аксель", en: "Up to 7 jump elements, at least one Axel type" },
          { ru: "3 вращения: FSSp, CCoSp + одно на выбор", en: "3 spins: FSSp, CCoSp + one of choice" },
          { ru: "StSq — дорожка шагов", en: "StSq — step sequence" },
          { ru: "ChSq1 — хореографическая последовательность", en: "ChSq1 — choreo sequence" },
        ],
      },
    ],
  },
  {
    title: { ru: "Женщины · Девушки", en: "Ladies · Junior Ladies" },
    color: "var(--violet)",
    rows: [
      {
        seg: { ru: "Короткая · 2:40", en: "Short · 2:40" },
        items: [
          { ru: "Соло-аксель: 2A (юниоры) / 2A–3A (взрослые)", en: "Solo Axel: 2A (juniors) / 2A–3A (seniors)" },
          { ru: "Соло: 3Lz или 3F", en: "Solo: 3Lz or 3F" },
          { ru: "Каскад: 3+3 / 3+2 (взрослые — также 4+2/4+3)", en: "Combo: 3+3 / 3+2 (seniors also 4+2/4+3)" },
          { ru: "LSp или USp — вращение стоя", en: "LSp or USp — layback / upright spin" },
          { ru: "FSSp или FCSSp — прыжковое вращение", en: "FSSp or FCSSp — flying spin" },
          { ru: "CCoSp — комбинированное вращение", en: "CCoSp — combination spin" },
          { ru: "StSq — дорожка шагов", en: "StSq — step sequence" },
        ],
      },
      {
        seg: { ru: "Произвольная · 4:00 (юниоры 3:30)", en: "Free · 4:00 (juniors 3:30)" },
        items: [
          { ru: "До 7 прыжковых элементов", en: "Up to 7 jump elements" },
          { ru: "3 вращения: прыжковое, LSp/USp, CCoSp", en: "3 spins: flying, LSp/USp, CCoSp" },
          { ru: "StSq — дорожка шагов", en: "StSq — step sequence" },
          { ru: "ChSq1 — хореографическая последовательность", en: "ChSq1 — choreo sequence" },
        ],
      },
    ],
  },
  {
    title: { ru: "Пары", en: "Pairs" },
    color: "var(--gold)",
    rows: [
      {
        seg: { ru: "Короткая · 2:40", en: "Short · 2:40" },
        items: [
          { ru: "Поддержка: группа ≤3 (юниоры) / любая (взрослые)", en: "Lift: group ≤3 (juniors) / any group (seniors)" },
          { ru: "Твист: 2Tw–3Tw", en: "Twist: 2Tw–3Tw" },
          { ru: "Выброс: двойной или тройной", en: "Throw: double or triple" },
          { ru: "Соло-прыжок: 2A (юниоры) / 2A–3A (взрослые)", en: "Solo jump: 2A (juniors) / 2A–3A (seniors)" },
          { ru: "Тодес — спираль смерти", en: "Death spiral" },
          { ru: "PCoSp — парное комбинированное вращение", en: "PCoSp — pair combination spin" },
          { ru: "StSq — дорожка шагов", en: "StSq — step sequence" },
        ],
      },
      {
        seg: { ru: "Произвольная · 4:00 (юниоры 3:30)", en: "Free · 4:00 (juniors 3:30)" },
        items: [
          { ru: "До 3 поддержек", en: "Up to 3 lifts" },
          { ru: "1 твист", en: "1 twist" },
          { ru: "До 2 выбросов", en: "Up to 2 throws" },
          { ru: "Соло-прыжок + каскад или последовательность", en: "Solo jump + combination or sequence" },
          { ru: "Тодес, PCoSp, StSq, ChSq1", en: "Death spiral, PCoSp, StSq, ChSq1" },
        ],
      },
    ],
  },
  {
    title: { ru: "Танцы на льду", en: "Ice Dance" },
    color: "var(--mint)",
    rows: [
      {
        seg: { ru: "Ритм-танец · 2:50 (юниоры 2:40)", en: "Rhythm · 2:50 (juniors 2:40)" },
        items: [
          { ru: "1–2 секции паттерна", en: "1–2 pattern sections" },
          { ru: "Короткая поддержка (StaLi/CuLi/SlLi/RoLi/SeLi)", en: "Short lift (StaLi/CuLi/SlLi/RoLi/SeLi)" },
          { ru: "CoSp — танцевальное вращение", en: "CoSp — dance spin" },
          { ru: "StSq — дорожка шагов", en: "StSq — step sequence" },
          { ru: "seqTw — твизлы (только взрослые)", en: "seqTw — twizzles (seniors only)" },
        ],
      },
      {
        seg: { ru: "Произвольный · 4:00 (юниоры 3:30)", en: "Free · 4:00 (juniors 3:30)" },
        items: [
          { ru: "ChLi1 + до 3 коротких поддержек (юниоры — до 2)", en: "ChLi1 + up to 3 short lifts (juniors — up to 2)" },
          { ru: "CoSp — танцевальное вращение", en: "CoSp — dance spin" },
          { ru: "StSq — дорожка шагов", en: "StSq — step sequence" },
          { ru: "Одно хорео-движение: ChSl1 / ChSp1 / ChTw1", en: "One choreo movement: ChSl1 / ChSp1 / ChTw1" },
        ],
      },
    ],
  },
];

/* ================= ISU reference ================= */
export function RulesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useApp();
  const goeRow = [5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5];
  const marks = ["m_x", "m_lt", "m_dg", "m_q", "m_att", "m_e"] as const;
  const factorRows: { label: string; d: "men" | "ladies" | "dance" }[] = [
    { label: `${t("disc_men")} · ${t("disc_jmen")}`, d: "men" },
    { label: `${t("disc_ladies")} · ${t("disc_jladies")} · ${t("disc_pairs")}`, d: "ladies" },
    { label: t("disc_dance"), d: "dance" },
  ];

  return (
    <Sheet open={open} onClose={onClose} title={t("rules_title")} sub={t("rules_structure_sub")}>
      <div className="cat-title" style={{ marginTop: 2 }}>{t("rules_structure")}</div>
      {STRUCT.map((s) => (
        <div key={s.title.en} className="glass glass-tight" style={{ padding: "12px 14px", marginBottom: 10 }}>
          <b style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: s.color }}>{lang === "ru" ? s.title.ru : s.title.en}</b>
          {s.rows.map((r) => (
            <div key={r.seg.en} style={{ marginTop: 10 }}>
              <span className="badge" style={{ fontSize: 10, marginBottom: 6, display: "inline-block" }}>
                {lang === "ru" ? r.seg.ru : r.seg.en}
              </span>
              <ul style={{ margin: "4px 0 0", padding: 0, listStyle: "none" }}>
                {r.items.map((it) => (
                  <li key={it.en} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "var(--mist)", lineHeight: 1.5, padding: "2.5px 0" }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: s.color, marginTop: 6.5, flexShrink: 0 }} />
                    {lang === "ru" ? it.ru : it.en}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}

      <div className="cat-title">{t("rules_goe")}</div>
      <p className="sheet-sub">{t("rules_goe_sub")}</p>
      <div className="goe-scale" style={{ margin: "4px 0 8px" }}>
        {goeRow.map((g) => (
          <div
            key={g}
            className={`goe-btn ${g > 0 ? "active pos" : g < 0 ? "active neg" : "active zero"}`}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, aspectRatio: "auto", padding: "8px 0" }}
          >
            <span style={{ fontSize: 12 }}>{g > 0 ? `+${g}` : g}</span>
            <span style={{ fontSize: 9, opacity: 0.75 }}>{g > 0 ? `+${g * 10}%` : `${g * 10}%`}</span>
          </div>
        ))}
      </div>

      <div className="cat-title">{t("rules_marks")}</div>
      <div className="glass glass-tight" style={{ padding: "6px 14px", marginBottom: 4 }}>
        {marks.map((m, i) => (
          <div key={m} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 0", borderTop: i > 0 ? "1px solid var(--glass-border)" : "none", fontSize: 12.5, color: "var(--mist)", lineHeight: 1.45 }}>
            {t(m)}
          </div>
        ))}
      </div>

      <div className="cat-title">{t("rules_pcs")}</div>
      <p className="sheet-sub">{t("rules_pcs_sub")}</p>
      <div className="doc" style={{ marginBottom: 4 }}>
        <table>
          <thead>
            <tr>
              <th>{lang === "ru" ? "Дисциплина" : "Discipline"}</th>
              <th>{lang === "ru" ? "Короткая" : "Short"}</th>
              <th>{lang === "ru" ? "Произвольная" : "Free"}</th>
            </tr>
          </thead>
          <tbody>
            {factorRows.map(({ d }) => (
              <tr key={d}>
                <td className="left">{t(discKey(d))}</td>
                <td>× {PCS_FACTOR[d].sp.toFixed(2)}</td>
                <td>× {PCS_FACTOR[d].fs.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="cat-title">{t("rules_ded")}</div>
      <div className="glass glass-tight" style={{ padding: "6px 14px" }}>
        {[t("ded_falls_sub") + " · " + t("ded_falls"), "−1.00 · " + t("ded_time"), "−1.00 · " + t("ded_costume"), "−1.00 · " + t("ded_music")].map((row, i) => (
          <div key={i} style={{ padding: "9px 0", borderTop: i > 0 ? "1px solid var(--glass-border)" : "none", fontSize: 12.5, color: "var(--mist)" }}>
            {row}
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: "var(--mist-dim)", lineHeight: 1.6, margin: "16px 4px 4px" }}>{t("rules_note")}</p>
    </Sheet>
  );
}

/* ================= protocol document (official ISU layout) ================= */
export function protocolToText(p: Protocol): string {
  const event = (p.competition || "ICEPROTOCOL").toUpperCase();
  const seg = officialSegmentLabel(p.discipline, p.segment);
  const name = p.skater || "—";
  const nation = p.skaterCountry ? ` (${p.skaterCountry})` : "";
  const sgn = (n: number) => (n > 0 ? `+${fmt(n)}` : fmt(n));
  const totalBV = p.elements.reduce((s, el) => s + elementBV(el), 0);
  const factor = PCS_FACTOR[factorGroup(p.discipline)][p.segment];
  const lines: string[] = [
    event,
    "JUDGES DETAILS PER SKATER",
    seg,
    "",
    `${p.skaterFlag ? p.skaterFlag + " " : ""}${name}${nation}`,
    "".padEnd(64, "—"),
    "#  Executed Elements      Base Value   GOE    J1   Score of Panel",
    ...p.elements.map((el, i) => {
      const code = el.code + (el.flags.length ? " " + el.flags.join(" ") : "");
      return `${String(i + 1).padStart(2)} ${code.padEnd(22)} ${fmt(elementBV(el)).padStart(8)} ${sgn(goeValue(el)).padStart(7)} ${String(el.goe).padStart(3)}   ${fmt(elementScore(el)).padStart(8)}`;
    }),
    "".padEnd(64, "—"),
    `   ${"Total Element Score".padEnd(22)} ${fmt(totalBV).padStart(8)} ${"".padStart(7)} ${"".padStart(3)}   ${fmt(p.tes).padStart(8)}`,
    "",
    "Program Components       Factor    J1   Score of Panel",
    `   ${"Composition".padEnd(22)} ${factor.toFixed(2).padStart(6)} ${fmt(p.pcs.comp).padStart(5)}   ${fmt(p.pcs.comp).padStart(8)}`,
    `   ${"Presentation".padEnd(22)} ${factor.toFixed(2).padStart(6)} ${fmt(p.pcs.pres).padStart(5)}   ${fmt(p.pcs.pres).padStart(8)}`,
    `   ${"Skating Skills".padEnd(22)} ${factor.toFixed(2).padStart(6)} ${fmt(p.pcs.ss).padStart(5)}   ${fmt(p.pcs.ss).padStart(8)}`,
    "".padEnd(64, "—"),
    `   Total Program Component Score (Factored)${"".padStart(11)} ${fmt(p.pcsScore).padStart(8)}`,
    "",
    `   Total Deduction${"".padStart(38)} ${fmt(p.deductions).padStart(8)}`,
    "".padEnd(64, "—"),
    `   TOTAL SEGMENT SCORE${"".padStart(34)} ${fmt(p.total).padStart(8)}`,
  ];
  return lines.join("\n");
}

export function ProtocolSheet({ protocol, onClose }: { protocol: Protocol | null; onClose: () => void }) {
  const { t, lang, showToast } = useApp();
  if (!protocol) return null;

  const discLabel = t(discKey(protocol.discipline));
  const segLabel = t(segKey(protocol.discipline, protocol.segment));
  const catLabel = t(catKey(protocol.category ?? "senior"));
  const factor = PCS_FACTOR[factorGroup(protocol.discipline)][protocol.segment];
  const date = new Date(protocol.createdAt).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const copy = async () => {
    const text = protocolToText(protocol);
    try {
      await navigator.clipboard.writeText(text);
      showToast(t("copied"));
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      showToast(t("copied"));
    }
  };

  const share = async () => {
    const text = protocolToText(protocol);
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch {
      /* fall through to copy */
    }
    await copy();
  };

  return (
    <Sheet
      open={!!protocol}
      onClose={onClose}
      title={t("protocol_doc")}
      sub={`${protocol.skaterFlag ? protocol.skaterFlag + " " : ""}${protocol.skater || "—"} · ${catLabel} · ${discLabel} · ${segLabel}`}
    >
      <div className="isu">
        {/* official header */}
        <div className="isu-event">{protocol.competition || "ICEPROTOCOL"}</div>
        <div className="isu-section">Judges Details Per Skater</div>
        <div className="isu-disc">{officialSegmentLabel(protocol.discipline, protocol.segment)}</div>
        <hr className="isu-rule" />
        <hr className="isu-rule thin" />

        {/* skater identity + segment totals */}
        <div className="isu-skater">
          <div style={{ minWidth: 0 }}>
            <div className="isu-name">
              {protocol.skaterFlag && <span style={{ marginRight: 5 }}>{protocol.skaterFlag}</span>}
              {protocol.skater || "—"}
            </div>
            <div className="isu-nation">{protocol.skaterCountry || ""}</div>
            <div className="isu-meta">{date}</div>
          </div>
          <div className="isu-totals">
            <div>
              <span>Total Segment Score</span>
              <b>{fmt(protocol.total)}</b>
            </div>
            <div>
              <span>Total Element Score</span>
              <b>{fmt(protocol.tes)}</b>
            </div>
            <div>
              <span>Total Program Component Score (Factored)</span>
              <b>{fmt(protocol.pcsScore)}</b>
            </div>
            <div>
              <span>Total Deduction</span>
              <b>{fmt(protocol.deductions)}</b>
            </div>
          </div>
        </div>

        {/* executed elements */}
        <table className="isu-table">
          <thead>
            <tr>
              <th style={{ width: 24 }}>#</th>
              <th className="left">Executed Elements</th>
              <th className="num">Base Value</th>
              <th className="num">GOE</th>
              <th>J1</th>
              <th className="num">Score of Panel</th>
            </tr>
          </thead>
          <tbody>
            {protocol.elements.map((el, i) => {
              const g = goeValue(el);
              return (
                <tr key={el.id}>
                  <td>{i + 1}</td>
                  <td className="left">
                    {el.code}
                    {el.flags.length > 0 && <span style={{ color: "#8a5a00", fontWeight: 700 }}> {el.flags.join(" ")}</span>}
                  </td>
                  <td className="num">{fmt(elementBV(el))}</td>
                  <td className="num">{g > 0 ? `+${fmt(g)}` : fmt(g)}</td>
                  <td>{el.goe > 0 ? `+${el.goe}` : el.goe}</td>
                  <td className="num" style={{ fontWeight: 700 }}>{fmt(elementScore(el))}</td>
                </tr>
              );
            })}
            {protocol.elements.length === 0 && (
              <tr>
                <td colSpan={6} className="left" style={{ color: "#666" }}>—</td>
              </tr>
            )}
            <tr className="total-row">
              <td colSpan={2} className="left">{t("tes")} · Total Element Score</td>
              <td className="num">{fmt(protocol.elements.reduce((s, el) => s + elementBV(el), 0))}</td>
              <td colSpan={2}></td>
              <td className="num">{fmt(protocol.tes)}</td>
            </tr>
          </tbody>
        </table>

        {/* program components */}
        <div className="isu-cap">Program Components</div>
        <table className="isu-table" style={{ marginTop: 2 }}>
          <thead>
            <tr>
              <th className="left">Component</th>
              <th>Factor</th>
              <th>J1</th>
              <th className="num">Score of Panel</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="left">Composition</td>
              <td>{factor.toFixed(2)}</td>
              <td>{fmt(protocol.pcs.comp)}</td>
              <td className="num">{fmt(protocol.pcs.comp)}</td>
            </tr>
            <tr>
              <td className="left">Presentation</td>
              <td>{factor.toFixed(2)}</td>
              <td>{fmt(protocol.pcs.pres)}</td>
              <td className="num">{fmt(protocol.pcs.pres)}</td>
            </tr>
            <tr>
              <td className="left">Skating Skills</td>
              <td>{factor.toFixed(2)}</td>
              <td>{fmt(protocol.pcs.ss)}</td>
              <td className="num">{fmt(protocol.pcs.ss)}</td>
            </tr>
            <tr className="total-row">
              <td colSpan={3} className="left">Total Program Component Score (Factored)</td>
              <td className="num">{fmt(protocol.pcsScore)}</td>
            </tr>
          </tbody>
        </table>

        {/* deductions + grand total */}
        <div className="isu-grand">
          <span>Total Deduction</span>
          <b>−{fmt(protocol.deductions)}</b>
        </div>
        <div className="isu-grand" style={{ marginTop: 4 }}>
          <span>Total Segment Score</span>
          <b>{fmt(protocol.total)}</b>
        </div>

        <div className="isu-foot">IceProtocol · Training document · ISU Scale of Values 2025/26 · 1 judge (J1)</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button className="btn ghost" type="button" onClick={copy}>
          <IcCopy size={15} />
          {t("copy")}
        </button>
        <button className="btn" type="button" onClick={share}>
          <IcShare size={15} />
          {t("share")}
        </button>
      </div>
    </Sheet>
  );
}

/* ================= skater detail ================= */
export function SkaterSheet({ skater, onClose }: { skater: Skater | null; onClose: () => void }) {
  const { t, lang } = useApp();
  if (!skater) return null;
  const name = lang === "ru" ? skater.ru : skater.name;
  const country = lang === "ru" ? skater.countryRu : skater.country;
  const maxSeg = Math.max(skater.sp ?? 0, skater.fs ?? 0);

  return (
    <Sheet open={!!skater} onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
        <div className="avatar" style={{ width: 56, height: 56, fontSize: 26, borderRadius: 18, background: "var(--glass-2)", border: "1px solid var(--glass-border)" }}>
          <span className="flag" style={{ fontSize: 28 }}>
            {skater.flag}
          </span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, lineHeight: 1.15 }}>{name}</div>
          <div style={{ fontSize: 12, color: "var(--mist-dim)", marginTop: 2 }}>
            {country} · <span className="badge" style={{ marginLeft: 2 }}>{t(discKey(skater.disc))}</span>
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: "16px 16px 14px", marginTop: 12 }}>
        <div style={{ fontSize: 10.5, color: "var(--mist-dim)", textTransform: "uppercase", letterSpacing: 0.5 }}>{t("pb_total")}</div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 34, color: "var(--cyan)", lineHeight: 1.1, margin: "4px 0 2px" }}>
          {fmt(skater.total)}
        </div>

        {skater.sp != null && skater.fs != null && maxSeg > 0 && (
          <div style={{ marginTop: 14 }}>
            {(
              [
                { label: t("pb_sp"), v: skater.sp, color: "var(--violet)" },
                { label: t("pb_fs"), v: skater.fs, color: "var(--gold)" },
              ] as const
            ).map((row) => (
              <div key={row.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
                  <span style={{ color: "var(--mist)" }}>{row.label}</span>
                  <b>{fmt(row.v)}</b>
                </div>
                <div style={{ height: 6, borderRadius: 10, background: "var(--glass-3)", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${(row.v / maxSeg) * 100}%`,
                      height: "100%",
                      borderRadius: 10,
                      background: row.color,
                      transition: "width .6s cubic-bezier(.2,.7,.2,1)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p style={{ fontSize: 11, color: "var(--mist-dim)", margin: "12px 4px 0", display: "flex", alignItems: "center", gap: 6 }}>
        <IcCheck size={13} />
        {t("pb_isu")}
      </p>
    </Sheet>
  );
}
