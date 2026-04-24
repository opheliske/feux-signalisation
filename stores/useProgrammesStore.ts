import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Programme } from "../theme";

function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const programmesExemple: Programme[] = [
  {
    id: "exemple-1",
    nom: "Vert qui reste",
    etapes: [{ id: "e1-1", lampe: "vert", dureeSecondes: 5 }],
    epingle: false,
    nbLancements: 0,
    creeA: 1700000000000,
    modifieA: 1700000000000,
  },
  {
    id: "exemple-2",
    nom: "Vert puis Orange",
    etapes: [
      { id: "e2-1", lampe: "vert", dureeSecondes: 3 },
      { id: "e2-2", lampe: "orange", dureeSecondes: 2 },
    ],
    epingle: false,
    nbLancements: 0,
    creeA: 1700000000000,
    modifieA: 1700000000000,
  },
  {
    id: "exemple-3",
    nom: "Orange qui clignote",
    etapes: [
      { id: "e3-1", lampe: "orange", dureeSecondes: 1 },
      { id: "e3-2", lampe: "eteint", dureeSecondes: 1 },
    ],
    epingle: false,
    nbLancements: 0,
    creeA: 1700000000000,
    modifieA: 1700000000000,
  },
];

type ProgrammesStore = {
  programmes: Programme[];
  creer: (programme: Programme) => void;
  mettreAJour: (
    id: string,
    updates: Partial<Omit<Programme, "id" | "creeA">>
  ) => void;
  supprimer: (id: string) => void;
  dupliquer: (id: string) => void;
  incrementerLancements: (id: string) => void;
  reinitialiserExemples: () => void;
};

function migrerProgramme(p: unknown): Programme {
  const prog = p as Record<string, unknown>;
  return {
    id: prog.id as string,
    nom: prog.nom as string,
    etapes: prog.etapes as Programme["etapes"],
    epingle: (prog.epingle as boolean) ?? false,
    nbLancements: (prog.nbLancements as number) ?? 0,
    creeA: prog.creeA as number,
    modifieA: prog.modifieA as number,
  };
}

export const useProgrammesStore = create<ProgrammesStore>()(
  persist(
    (set, get) => ({
      programmes: programmesExemple,
      creer: (programme) =>
        set((s) => ({ programmes: [...s.programmes, programme] })),
      mettreAJour: (id, updates) =>
        set((s) => ({
          programmes: s.programmes.map((p) =>
            p.id === id ? { ...p, ...updates, modifieA: Date.now() } : p
          ),
        })),
      supprimer: (id) =>
        set((s) => ({
          programmes: s.programmes.filter((p) => p.id !== id),
        })),
      dupliquer: (id) => {
        const source = get().programmes.find((p) => p.id === id);
        if (!source) return;
        const copie: Programme = {
          ...source,
          id: genId(),
          nom: `Copie de ${source.nom}`,
          epingle: false,
          nbLancements: 0,
          creeA: Date.now(),
          modifieA: Date.now(),
          etapes: source.etapes.map((e) => ({ ...e, id: genId() })),
        };
        set((s) => ({ programmes: [...s.programmes, copie] }));
      },
      incrementerLancements: (id) =>
        set((s) => ({
          programmes: s.programmes.map((p) =>
            p.id === id ? { ...p, nbLancements: p.nbLancements + 1 } : p
          ),
        })),
      reinitialiserExemples: () => set({ programmes: programmesExemple }),
    }),
    {
      name: "programmes_benoit",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persistedState: unknown) => {
        const state = persistedState as { programmes?: unknown[] };
        if (Array.isArray(state.programmes)) {
          state.programmes = state.programmes.map(migrerProgramme);
        }
        return state as { programmes: Programme[] };
      },
    }
  )
);
