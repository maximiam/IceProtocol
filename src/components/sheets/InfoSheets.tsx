import { Sheet } from "../ui";
import { useApp } from "../../store";
import type { Protocol } from "../../lib/scoring";
import { catKey, discKey, elementBV, elementScore, factorGroup, fmt, goeValue, PCS_FACTOR, segKey } from "../../lib/scoring";
import type { Skater } from "../../data/skaters";
import { IcCheck, IcCopy, IcShare } from "../icons";

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
    <Sheet open={open} onClose={onClose} title={t("rules_title")} sub={t("picker_sub")}>
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

/* ================= protocol document ================= */
export function protocolToText(p: Protocol, lang: "ru" | "en", discLabel: string, segLabel: string, catLabel: string): string {
  const date = new Date(p.createdAt).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB");
  const lines = [
    `FS JUDGE — ${p.skater || (lang === "ru" ? "без имени" : "unnamed")}`,
    `${discLabel} · ${catLabel} · ${segLabel} · ${date}`,
    "—".repeat(28),
    ...p.elements.map((el, i) => {
      const flags = el.flags.length ? ` [${el.flags.join(" ")}]` : "";
      const g = goeValue(el);
      return `${String(i + 1).padStart(2, "0")} ${el.code}${flags}  BV ${fmt(elementBV(el))}  GOE ${g >= 0 ? "+" : ""}${fmt(g)}  →  ${fmt(elementScore(el))}`;
    }),
    "—".repeat(28),
    `PCS: ${fmt(p.pcs.comp)} / ${fmt(p.pcs.pres)} / ${fmt(p.pcs.ss)}  →  ${fmt(p.pcsScore)}`,
    `TES ${fmt(p.tes)} · PCS ${fmt(p.pcsScore)} · DED −${fmt(p.deductions)}`,
    `TOTAL: ${fmt(p.total)}`,
  ];
  return lines.join("\n");
}

export function ProtocolSheet({ protocol, onClose }: { protocol: Protocol | null; onClose: () => void }) {
  const { t, lang, showToast } = useApp();
  if (!protocol) return null;

  const discLabel = t(discKey(protocol.discipline));
  const segLabel = t(segKey(protocol.discipline, protocol.segment));
  const catLabel = t(catKey(protocol.category ?? "senior"));
  const date = new Date(protocol.createdAt).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const copy = async () => {
    const text = protocolToText(protocol, lang, discLabel, segLabel, catLabel);
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
    const text = protocolToText(protocol, lang, discLabel, segLabel, catLabel);
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
    <Sheet open={!!protocol} onClose={onClose} title={t("protocol_doc")} sub={`${protocol.skater || "—"} · ${discLabel} · ${segLabel}`}>
      <div className="doc">
        <div className="doc-head">
          <span>FS JUDGE · {t("doc_training")}</span>
          <span>{date}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th style={{ textAlign: "left" }}>{t("elements_title")}</th>
              <th>BV</th>
              <th>GOE</th>
              <th>Pts</th>
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
                    {el.flags.length > 0 && <span style={{ color: "#a06a00", fontWeight: 700 }}> {el.flags.join(" ")}</span>}
                  </td>
                  <td>{fmt(elementBV(el))}</td>
                  <td style={{ color: g > 0 ? "#0c7a4d" : g < 0 ? "#b3271e" : undefined }}>
                    {g > 0 ? "+" : ""}
                    {fmt(g)}
                  </td>
                  <td style={{ fontWeight: 700 }}>{fmt(elementScore(el))}</td>
                </tr>
              );
            })}
            {protocol.elements.length === 0 && (
              <tr>
                <td colSpan={5}>—</td>
              </tr>
            )}
          </tbody>
        </table>
        <table style={{ marginTop: 8 }}>
          <tbody>
            <tr>
              <td className="left">{t("pcs_comp")}</td>
              <td>{fmt(protocol.pcs.comp)}</td>
              <td className="left">{t("pcs_pres")}</td>
              <td>{fmt(protocol.pcs.pres)}</td>
              <td className="left">{t("pcs_ss")}</td>
              <td>{fmt(protocol.pcs.ss)}</td>
            </tr>
            <tr>
              <td className="left" colSpan={4}>
                {t("pcs_factor")} × {PCS_FACTOR[factorGroup(protocol.discipline)][protocol.segment].toFixed(2)}
              </td>
              <td className="left">{t("pcs_score")}</td>
              <td style={{ fontWeight: 800 }}>{fmt(protocol.pcsScore)}</td>
            </tr>
            <tr>
              <td className="left" colSpan={4}>
                TES
              </td>
              <td className="left">{t("ded")}</td>
              <td style={{ fontWeight: 800 }}>−{fmt(protocol.deductions)}</td>
            </tr>
          </tbody>
        </table>
        <div className="doc-total">
          {t("total")}: {fmt(protocol.total)}
        </div>
        <div className="doc-note">FS Judge · ISU SOV 2025/26</div>
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
