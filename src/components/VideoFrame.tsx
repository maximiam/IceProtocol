import { useEffect, useRef, useState } from "react";
import { useApp } from "../store";
import { Reveal } from "./ui";
import { IcFilm, IcLink, IcPlay, IcUpload, IcX } from "./icons";

type SrcKind = "youtube" | "video" | "file";

interface Source {
  kind: SrcKind;
  url: string; // for youtube: embed id; else: playable url
  label: string;
}

function parseLink(raw: string): Source | null {
  const v = raw.trim();
  if (!v) return null;
  const yt =
    v.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/) ||
    (v.includes("youtube.com") && v.match(/([\w-]{11})/));
  if (yt) return { kind: "youtube", url: yt[1], label: "YouTube" };
  if (/^https?:\/\//i.test(v)) return { kind: "video", url: v, label: v.replace(/^https?:\/\//i, "").split("/")[0] };
  return null;
}

export function VideoFrame() {
  const { t, draft, buzz } = useApp();
  const [src, setSrc] = useState<Source | null>(null);
  const [linkMode, setLinkMode] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [playing, setPlaying] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const skater = draft.athlete;

  const applyLink = () => {
    const parsed = parseLink(linkValue);
    if (!parsed) return;
    setSrc(parsed);
    setLinkMode(false);
    setLinkValue("");
    buzz("success");
  };

  const onFile = (f: File | null) => {
    if (!f) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(f);
    objectUrlRef.current = url;
    setSrc({ kind: "file", url, label: f.name });
    setLinkMode(false);
    buzz("success");
  };

  const clear = () => {
    setSrc(null);
    setPlaying(false);
    setLinkMode(false);
    buzz();
  };

  return (
    <Reveal delay={40}>
      <div className="vframe glass">
        <div className="vframe-head">
          <span className="icon-frame" style={{ color: "var(--cyan)" }}>
            <IcFilm size={15} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontSize: 13.5, display: "block" }}>{t("video_title")}</b>
            <span style={{ fontSize: 10.5, color: "var(--mist-dim)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {src ? src.label : t("video_sub")}
            </span>
          </div>
          {src && (
            <button className="icon-btn" type="button" onClick={clear} aria-label={t("video_change")} style={{ width: 32, height: 32, borderRadius: 10 }}>
              <IcX size={15} />
            </button>
          )}
        </div>

        <div className="vframe-stage">
          {!src && !linkMode && (
            <div className="vframe-empty">
              <span className="icon-frame lg" style={{ color: "var(--mist-dim)" }}>
                <IcFilm size={26} />
              </span>
              <b>{t("video_none")}</b>
              <span>{t("video_sub")}</span>
              <div className="vframe-btns">
                <button className="btn ghost sm" type="button" onClick={() => setLinkMode(true)}>
                  <IcLink size={14} />
                  {t("video_add_link")}
                </button>
                <button className="btn ghost sm" type="button" onClick={() => fileRef.current?.click()}>
                  <IcUpload size={14} />
                  {t("video_upload")}
                </button>
              </div>
            </div>
          )}

          {!src && linkMode && (
            <div className="vframe-empty">
              <span className="icon-frame lg" style={{ color: "var(--cyan)" }}>
                <IcLink size={26} />
              </span>
              <b>{t("video_add_link")}</b>
              <input
                className="input"
                style={{ width: "100%", marginTop: 8, fontSize: 13.5 }}
                placeholder={t("video_link_ph")}
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyLink()}
                autoFocus
                inputMode="url"
              />
              <div className="vframe-btns">
                <button className="btn ghost sm" type="button" onClick={() => setLinkMode(false)}>
                  {t("video_cancel")}
                </button>
                <button className="btn sm" type="button" onClick={applyLink} disabled={!parseLink(linkValue)}>
                  <IcPlay size={14} />
                  {t("video_apply")}
                </button>
              </div>
            </div>
          )}

          {src && src.kind === "youtube" && (
            <iframe
              className="vframe-media"
              src={`https://www.youtube.com/embed/${src.url}?autoplay=0&rel=0&playsinline=1`}
              title="stream"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
          {src && src.kind !== "youtube" && (
            <video
              className="vframe-media"
              src={src.url}
              controls
              playsInline
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
          )}

          {src && (
            <>
              <div className={`vframe-live ${src.kind === "file" ? "" : playing ? "on" : ""}`}>
                <span className="rec-dot" />
                {src.kind === "file" ? t("video_file") : t("video_live")}
              </div>
              {skater && (
                <div className="vframe-caption">
                  <span className="flag" style={{ fontSize: 15 }}>{skater.flag}</span>
                  <span style={{ fontWeight: 800 }}>{skater.name}</span>
                  {draft.competition && <span className="vframe-comp">{draft.competition}</span>}
                </div>
              )}
            </>
          )}
        </div>

        <input ref={fileRef} type="file" accept="video/*" style={{ display: "none" }} onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      </div>
    </Reveal>
  );
}
