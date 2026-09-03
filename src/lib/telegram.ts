/* Thin safe wrapper around the Telegram MiniApp SDK */

export interface TgUser {
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

function tg(): any {
  return typeof window !== "undefined" ? (window as any).Telegram?.WebApp ?? null : null;
}

export const Telegram = {
  get available(): boolean {
    return !!tg();
  },
  get user(): TgUser | null {
    try {
      return tg()?.initDataUnsafe?.user ?? null;
    } catch {
      return null;
    }
  },
  get colorScheme(): "dark" | "light" | null {
    try {
      return tg()?.colorScheme ?? null;
    } catch {
      return null;
    }
  },
  ready() {
    try {
      const w = tg();
      w?.ready();
      w?.expand();
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      const base = dark ? "#070b18" : "#edf4fc";
      w?.setHeaderColor?.(base);
      w?.setBackgroundColor?.(base);
    } catch {
      /* outside Telegram */
    }
  },
  setColors(dark: boolean) {
    try {
      const w = tg();
      w?.setHeaderColor?.(dark ? "#070b18" : "#edf4fc");
      w?.setBackgroundColor?.(dark ? "#070b18" : "#edf4fc");
    } catch {
      /* noop */
    }
  },
  haptic(kind: "light" | "medium" | "success" | "error") {
    try {
      const h = tg()?.HapticFeedback;
      if (!h) return;
      if (kind === "success" || kind === "error") h.notificationOccurred(kind);
      else h.impactOccurred(kind);
    } catch {
      /* noop */
    }
  },
};
