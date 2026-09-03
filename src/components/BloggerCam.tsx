import { useEffect, useRef, useState } from "react";
import { Sheet } from "./ui";
import { useApp } from "../store";
import { IcCam, IcDownload, IcMic, IcMicOff, IcShare, IcX } from "./icons";

const pad2 = (n: number) => String(n).padStart(2, "0");
const fmtTime = (s: number) => `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
const fmtSize = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

function pickMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const cands = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
  for (const m of cands) {
    try {
      if (MediaRecorder.isTypeSupported(m)) return m;
    } catch {
      /* noop */
    }
  }
  return undefined;
}

/* Telegram-style round "video note" bubble: front camera + mic, draggable, recordable */
export function BloggerCam() {
  const { t, buzz, showToast } = useApp();
  const [camOn, setCamOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [clip, setClip] = useState<{ url: string; size: number } | null>(null);
  const [preview, setPreview] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  const stopAll = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recRef.current && recRef.current.state !== "inactive") {
      try {
        recRef.current.stop();
      } catch {
        /* noop */
      }
    }
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    setRecording(false);
  };

  const enable = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 } },
        audio: true,
      });
      streamRef.current = s;
      setCamOn(true);
      setMuted(false);
      buzz("success");
    } catch {
      showToast(t("blogger_denied"));
      buzz("error");
    }
  };

  useEffect(() => {
    if (camOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [camOn]);

  useEffect(() => () => stopAll(), []);

  const toggleCam = () => {
    if (camOn) {
      stopAll();
      setCamOn(false);
      buzz();
    } else {
      void enable();
    }
  };

  const startRec = () => {
    const s = streamRef.current;
    if (!s) return;
    const mime = pickMime();
    try {
      const r = new MediaRecorder(s, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      r.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      r.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime || "video/webm" });
        if (blob.size) {
          setClip((prev) => {
            if (prev) URL.revokeObjectURL(prev.url);
            return { url: URL.createObjectURL(blob), size: blob.size };
          });
          setPreview(true);
          buzz("success");
          showToast(t("blogger_saved"));
        }
      };
      r.start(1000);
      recRef.current = r;
      setRecording(true);
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);
      buzz("medium");
    } catch {
      showToast(t("blogger_denied"));
      buzz("error");
    }
  };

  const stopRec = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recRef.current && recRef.current.state !== "inactive") {
      try {
        recRef.current.stop();
      } catch {
        /* noop */
      }
    }
    setRecording(false);
  };

  const toggleMic = () => {
    const s = streamRef.current;
    if (!s) return;
    const next = !muted;
    s.getAudioTracks().forEach((tr) => (tr.enabled = !next));
    setMuted(next);
    buzz();
  };

  const download = () => {
    if (!clip) return;
    const a = document.createElement("a");
    a.href = clip.url;
    a.download = `iceprotocol-judge-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const share = async () => {
    if (!clip) return;
    try {
      const res = await fetch(clip.url);
      const blob = await res.blob();
      const file = new File([blob], "iceprotocol-judge.webm", { type: blob.type });
      if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "IceProtocol" });
        return;
      }
    } catch {
      /* fall through */
    }
    download();
  };

  const onDown = (e: React.PointerEvent) => {
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: drag.x, oy: drag.y };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const nx = d.ox + (e.clientX - d.sx);
    const ny = d.oy + (e.clientY - d.sy);
    const maxX = window.innerWidth / 2 - 70;
    const maxY = window.innerHeight / 2 - 140;
    setDrag({
      x: Math.max(-maxX, Math.min(maxX, nx)),
      y: Math.max(-maxY, Math.min(maxY, ny)),
    });
  };
  const onUp = () => {
    dragRef.current = null;
  };

  return (
    <>
      {/* trigger row */}
      <button
        type="button"
        className="list-row glass glass-tight"
        style={{ width: "100%", textAlign: "left", marginTop: 10, borderColor: camOn ? "rgba(255,127,122,.4)" : undefined }}
        onClick={toggleCam}
      >
        <span
          className="qi"
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--glass-2)",
            color: camOn ? "var(--ember)" : "var(--violet)",
            flexShrink: 0,
          }}
        >
          <IcCam size={17} />
        </span>
        <div className="meta">
          <b>{t("blogger_title")}</b>
          <span>{camOn ? t("blogger_hint") : t("blogger_sub")}</span>
        </div>
        <span className={`toggle ${camOn ? "on" : ""}`} style={{ pointerEvents: "none", flexShrink: 0 }} />
      </button>

      {/* floating Telegram-style bubble dock */}
      {camOn && (
        <div
          className="cam-dock"
          style={{
            right: 18,
            bottom: "calc(130px + var(--safe-bottom))",
            transform: `translate(${drag.x}px, ${drag.y}px)`,
          }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <div className={`cam-bubble ${recording ? "rec" : ""}`}>
            <video ref={videoRef} playsInline muted />
            {recording && (
              <span className="cam-timer">
                <span className="cam-dot" />
                {fmtTime(elapsed)}
              </span>
            )}
          </div>
          <div className="cam-ctrl">
            <button
              className={`cam-btn ${recording ? "rec-on" : ""}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                recording ? stopRec() : startRec();
              }}
              aria-label="record"
            >
              <span
                style={{
                  width: 15,
                  height: 15,
                  borderRadius: recording ? 4 : "50%",
                  background: "currentColor",
                  display: "block",
                  transition: "border-radius .15s",
                }}
              />
            </button>
            <button
              className={`cam-btn ${muted ? "off" : ""}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMic();
              }}
              aria-label="mic"
            >
              {muted ? <IcMicOff size={17} /> : <IcMic size={17} />}
            </button>
            <button
              className="cam-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                stopAll();
                setCamOn(false);
                buzz();
              }}
              aria-label="close"
            >
              <IcX size={15} />
            </button>
          </div>
        </div>
      )}

      {/* recorded clip preview */}
      <Sheet open={preview} onClose={() => setPreview(false)} title={t("blogger_clip")} sub={`${fmtTime(elapsed)} · ${clip ? fmtSize(clip.size) : ""}`}>
        {clip && (
          <div style={{ display: "flex", justifyContent: "center", margin: "10px 0 18px" }}>
            <div
              style={{
                width: 210,
                height: 210,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2.5px solid var(--glass-border-strong)",
                boxShadow: "0 16px 44px -12px rgba(0,0,0,.5)",
                background: "#0a1120",
              }}
            >
              <video
                src={clip.url}
                controls
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
              />
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn ghost" type="button" onClick={download}>
            <IcDownload size={15} />
            {t("blogger_download")}
          </button>
          <button className="btn" type="button" onClick={share}>
            <IcShare size={15} />
            {t("share")}
          </button>
        </div>
      </Sheet>
    </>
  );
}
