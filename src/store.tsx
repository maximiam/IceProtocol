import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Lang, StrKey } from "./lib/i18n";
import { tr } from "./lib/i18n";
import type { Category, Discipline, Deds, Pcs, Protocol, Segment, SkElement } from "./lib/scoring";
import { categoryOf, computeTotals, uid } from "./lib/scoring";
import { Telegram } from "./lib/telegram";

export type View = "home" | "studio" | "skaters" | "season" | "profile";

export interface Draft {
  skater: string;
  discipline: Discipline;
  segment: Segment;
  category: Category;
  elements: SkElement[];
  pcs: Pcs;
  deds: Deds;
}

const EMPTY_DRAFT: Draft = {
  skater: "",
  discipline: "men",
  segment: "sp",
  category: "senior",
  elements: [],
  pcs: { comp: 0, pres: 0, ss: 0 },
  deds: { falls: 0, time: false, costume: false, music: false },
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

interface Store {
  theme: "dark" | "light";
  setTheme: (t: "dark" | "light") => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  haptics: boolean;
  setHaptics: (v: boolean) => void;
  t: (k: StrKey) => string;
  buzz: (kind?: "light" | "medium" | "success" | "error") => void;
  view: View;
  setView: (v: View) => void;
  draft: Draft;
  patchDraft: (p: Partial<Draft>) => void;
  addElement: (el: SkElement) => void;
  updateElement: (el: SkElement) => void;
  removeElement: (id: string) => void;
  resetDraft: () => void;
  protocols: Protocol[];
  saveProtocol: () => Protocol;
  deleteProtocol: (id: string) => void;
  clearProtocols: () => void;
  toast: { id: number; msg: string } | null;
  showToast: (msg: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<"dark" | "light">(() =>
    load<"dark" | "light">("fsj:theme", document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark"),
  );
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = load<Lang | null>("fsj:lang", null);
    if (stored) return stored;
    const tgLang = Telegram.user?.language_code;
    return tgLang === "ru" ? "ru" : tgLang && tgLang !== "ru" ? "en" : "ru";
  });
  const [haptics, setHapticsState] = useState<boolean>(() => load("fsj:haptics", true));
  const [view, setViewState] = useState<View>("home");
  const [protocols, setProtocols] = useState<Protocol[]>(() => load<Protocol[]>("fsj:protocols", []));
  const [draft, setDraft] = useState<Draft>(() => {
    const d = load<Draft>("fsj:draft", EMPTY_DRAFT);
    return { ...EMPTY_DRAFT, ...d, pcs: { ...EMPTY_DRAFT.pcs, ...d.pcs }, deds: { ...EMPTY_DRAFT.deds, ...d.deds } };
  });
  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("fsj:theme", JSON.stringify(theme));
    Telegram.setColors(theme === "dark");
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("fsj:lang", JSON.stringify(lang));
  }, [lang]);
  useEffect(() => {
    localStorage.setItem("fsj:haptics", JSON.stringify(haptics));
  }, [haptics]);
  useEffect(() => {
    localStorage.setItem("fsj:protocols", JSON.stringify(protocols));
  }, [protocols]);
  useEffect(() => {
    localStorage.setItem("fsj:draft", JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    Telegram.ready();
  }, []);

  const t = useCallback((k: StrKey) => tr(lang, k), [lang]);

  const buzz = useCallback(
    (kind: "light" | "medium" | "success" | "error" = "light") => {
      if (haptics) Telegram.haptic(kind);
    },
    [haptics],
  );

  const showToast = useCallback((msg: string) => {
    setToast({ id: Date.now(), msg });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const setView = useCallback(
    (v: View) => {
      setViewState(v);
      window.scrollTo({ top: 0 });
      if (haptics) Telegram.haptic("light");
    },
    [haptics],
  );

  const patchDraft = useCallback((p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p })), []);
  const addElement = useCallback(
    (el: SkElement) => setDraft((d) => ({ ...d, elements: [...d.elements, el] })),
    [],
  );
  const updateElement = useCallback(
    (el: SkElement) =>
      setDraft((d) => ({ ...d, elements: d.elements.map((e) => (e.id === el.id ? el : e)) })),
    [],
  );
  const removeElement = useCallback(
    (id: string) => setDraft((d) => ({ ...d, elements: d.elements.filter((e) => e.id !== id) })),
    [],
  );
  const resetDraft = useCallback(
    () => setDraft((d) => ({ ...EMPTY_DRAFT, discipline: d.discipline, segment: d.segment, category: d.category })),
    [],
  );

  const saveProtocol = useCallback((): Protocol => {
    const totals = computeTotals(draft.elements, draft.pcs, draft.deds, draft.discipline, draft.segment);
    const p: Protocol = {
      id: uid(),
      createdAt: Date.now(),
      skater: draft.skater.trim(),
      discipline: draft.discipline,
      segment: draft.segment,
      category: categoryOf(draft.discipline, draft.category),
      elements: draft.elements,
      pcs: draft.pcs,
      deds: draft.deds,
      ...totals,
    };
    setProtocols((ps) => [p, ...ps]);
    return p;
  }, [draft]);

  const deleteProtocol = useCallback((id: string) => setProtocols((ps) => ps.filter((p) => p.id !== id)), []);
  const clearProtocols = useCallback(() => setProtocols([]), []);

  const value = useMemo<Store>(
    () => ({
      theme,
      setTheme: setThemeState,
      lang,
      setLang: setLangState,
      haptics,
      setHaptics: setHapticsState,
      t,
      buzz,
      view,
      setView,
      draft,
      patchDraft,
      addElement,
      updateElement,
      removeElement,
      resetDraft,
      protocols,
      saveProtocol,
      deleteProtocol,
      clearProtocols,
      toast,
      showToast,
    }),
    [theme, lang, haptics, t, buzz, view, draft, protocols, toast, setView, patchDraft, addElement, updateElement, removeElement, resetDraft, saveProtocol, deleteProtocol, clearProtocols, showToast],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useApp outside provider");
  return s;
}

/* live ticking clock */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}
