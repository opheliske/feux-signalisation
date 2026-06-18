import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Settings } from "../theme";

const defaultSettings: Settings = {
  lightIp: null,
  vibrations: true,
  logoAnimation: true,
  sounds: false,
  ledFlash: false,
  autoFullscreen: false,
};

type SettingsStore = {
  settings: Settings;
  update: (updates: Partial<Settings>) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      update: (updates) =>
        set((s) => ({ settings: { ...s.settings, ...updates } })),
    }),
    {
      // Storage key kept as-is to preserve settings on existing installs.
      name: "reglages_benoit",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
