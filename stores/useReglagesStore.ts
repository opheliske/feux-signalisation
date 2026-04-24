import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Reglages } from "../theme";

const reglagesDefaut: Reglages = {
  ipFeu: null,
  vibrations: true,
  animationLogo: true,
  sons: false,
  ledFlash: false,
  pleinEcranAuto: false,
};

type ReglagesStore = {
  reglages: Reglages;
  mettreAJour: (updates: Partial<Reglages>) => void;
};

export const useReglagesStore = create<ReglagesStore>()(
  persist(
    (set) => ({
      reglages: reglagesDefaut,
      mettreAJour: (updates) =>
        set((s) => ({ reglages: { ...s.reglages, ...updates } })),
    }),
    {
      name: "reglages_benoit",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
