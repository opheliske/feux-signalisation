import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeclencheurPlanifie } from "../theme";

type PlanningStore = {
  declencheurs: DeclencheurPlanifie[];
  ajouter: (d: DeclencheurPlanifie) => void;
  mettreAJour: (id: string, updates: Partial<DeclencheurPlanifie>) => void;
  supprimer: (id: string) => void;
  setActif: (id: string, actif: boolean) => void;
};

export const usePlanningStore = create<PlanningStore>()(
  persist(
    (set) => ({
      declencheurs: [],
      ajouter: (d) =>
        set((s) => ({ declencheurs: [...s.declencheurs, d] })),
      mettreAJour: (id, updates) =>
        set((s) => ({
          declencheurs: s.declencheurs.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        })),
      supprimer: (id) =>
        set((s) => ({
          declencheurs: s.declencheurs.filter((d) => d.id !== id),
        })),
      setActif: (id, actif) =>
        set((s) => ({
          declencheurs: s.declencheurs.map((d) =>
            d.id === id ? { ...d, actif } : d
          ),
        })),
    }),
    {
      name: "planning_benoit",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
