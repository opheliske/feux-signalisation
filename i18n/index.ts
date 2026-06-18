import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Light } from "../theme";
import {
  Lang,
  TranslationKey,
  TranslationParams,
  translate,
} from "./translations";

export type { Lang, TranslationKey } from "./translations";

// ─── Language store (persisted) ──────────────────────────────────────────────
// Default language is French; the user can switch in the Settings screen.

type LanguageStore = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      lang: "fr",
      setLang: (lang) => set({ lang }),
    }),
    {
      name: "language",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ─── Translation helpers ─────────────────────────────────────────────────────

// Non-reactive: reads the current language at call time. Use in helpers / code
// that isn't a React component.
export function t(key: TranslationKey, params?: TranslationParams): string {
  return translate(useLanguageStore.getState().lang, key, params);
}

// Reactive hook: components call `const t = useT()` to re-render when the
// language changes.
export function useT(): (
  key: TranslationKey,
  params?: TranslationParams
) => string {
  const lang = useLanguageStore((s) => s.lang);
  return (key, params) => translate(lang, key, params);
}

// ─── Displayed light labels (moved out of theme.ts) ──────────────────────────

const LIGHT_LABEL_KEY: Record<Light, TranslationKey> = {
  green: "light_green",
  orange: "light_orange",
  red: "light_red",
  off: "light_off",
};

export function lightLabel(light: Light): string {
  return t(LIGHT_LABEL_KEY[light]);
}

export function lightsLabel(lights: Light[]): string {
  if (lights.length === 0) return lightLabel("off");
  return lights.map((l) => lightLabel(l)).join(" + ");
}
