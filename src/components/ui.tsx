import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IcChevR, IcMinus, IcPlus, IcX } from "./icons";

/** Visual frame that every icon lives in */
export function IconFrame({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={`icon-frame ${className}`} style={style}>
      {children}
    </span>
  );
}

/** Framed chevron used across list rows */
export function Chev() {
  return (
    <span className="icon-frame sm chev-f">
      <IcChevR size={12} />
    </span>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="section-label">
      <span className="dash" />
      {children}
    </div>
  );
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`fade-up ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  sub,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  sub?: React.ReactNode;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-x icon-frame" type="button" onClick={onClose} aria-label="close">
          <IcX size={14} />
        </button>
        <div className="sheet-handle" />
        {title && <h3 className="sheet-title">{title}</h3>}
        {sub && <p className="sheet-sub">{sub}</p>}
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button className={`chip ${active ? "active" : ""}`} onClick={onClick} type="button">
      {children}
    </button>
  );
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return <button type="button" className={`toggle ${on ? "on" : ""}`} onClick={() => onChange(!on)} aria-pressed={on} />;
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 9,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="stepper">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
        <IcMinus size={13} />
      </button>
      <b key={value} className="pop">
        {value}
      </b>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
        <IcPlus size={13} />
      </button>
    </div>
  );
}

/** Number that eases toward its target — the app's heartbeat */
export function AnimatedNumber({
  value,
  decimals = 2,
  className = "",
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const [disp, setDisp] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    if (from === value) return;
    prevRef.current = value;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 380);
      const e = 1 - Math.pow(1 - k, 3);
      setDisp(from + (value - from) * e);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span className={className}>{disp.toFixed(decimals)}</span>;
}

export function Empty({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="empty">
      <span className="icon-frame lg">{icon}</span>
      <b>{title}</b>
      {sub && <span>{sub}</span>}
    </div>
  );
}
