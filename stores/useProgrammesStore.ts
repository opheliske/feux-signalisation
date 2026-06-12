import { create } from "zustand";
import { Programme } from "../theme";
import {
  ModeAppareil,
  encoderUtf8,
  MAX_NAME_LEN,
} from "../services/protocol";
import {
  addMode,
  deleteMode,
  editMode,
  getModeActif,
  getModes,
  getVersion,
  setMode,
  MODE_OFF,
} from "../services/feu";

// Compteurs de lancements, locaux et éphémères (le firmware ne les stocke pas).
// Conservés entre deux rafraîchissements, indexés par nom de mode.
const _lancements = new Map<string, number>();
// Rang de récence : à chaque lancement on attribue un numéro croissant, ce qui
// permet de trier du plus récemment lancé au plus ancien.
const _derniereExecution = new Map<string, number>();
let _rangExecution = 0;

function versProgramme(m: ModeAppareil): Programme {
  return {
    id: m.name,
    nom: m.name,
    etapes: m.etapes,
    epingle: false,
    nbLancements: _lancements.get(m.name) ?? 0,
    derniereExecution: _derniereExecution.get(m.name) ?? 0,
    creeA: 0,
    modifieA: 0,
  };
}

function nbOctets(s: string): number {
  return encoderUtf8(s).length;
}

// Construit un nom de copie unique qui tient dans MAX_NAME_LEN octets.
function nomCopie(base: string, existants: Set<string>): string {
  for (let i = 2; i < 1000; i++) {
    const suffixe = `_${i}`;
    let racine = base;
    // Réduit la racine jusqu'à ce que racine+suffixe tienne dans la limite.
    while (nbOctets(racine + suffixe) > MAX_NAME_LEN && racine.length > 0) {
      racine = racine.slice(0, -1);
    }
    const candidat = racine + suffixe;
    if (!existants.has(candidat)) return candidat;
  }
  return base.slice(0, MAX_NAME_LEN);
}

type ProgrammesStore = {
  programmes: Programme[];
  chargement: boolean;
  erreur: string | null;
  version: string | null;
  modeActif: string | null;

  charger: () => Promise<void>;
  chargerVersion: () => Promise<void>;
  chargerModeActif: () => Promise<void>;
  setModeActif: (nom: string | null) => void;
  lancer: (nom: string) => Promise<void>;
  creer: (mode: ModeAppareil) => Promise<void>;
  mettreAJour: (ancienNom: string, mode: ModeAppareil) => Promise<void>;
  supprimer: (nom: string) => Promise<void>;
  dupliquer: (nom: string) => Promise<void>;
  incrementerLancements: (nom: string) => void;
};

function messageErreur(e: unknown): string {
  if (e instanceof Error) return e.message;
  return "Je n'arrive pas à parler au feu.";
}

export const useProgrammesStore = create<ProgrammesStore>()((set, get) => ({
  programmes: [],
  chargement: false,
  erreur: null,
  version: null,
  modeActif: null,

  charger: async () => {
    set({ chargement: true, erreur: null });
    try {
      const modes = await getModes();
      // Le mode OFF est un mode technique (stop) : on ne l'affiche pas.
      set({
        programmes: modes
          .filter((m) => m.name !== MODE_OFF)
          .map(versProgramme),
        chargement: false,
      });
      await get().chargerModeActif();
    } catch (e) {
      set({ chargement: false, erreur: messageErreur(e) });
    }
  },

  chargerVersion: async () => {
    try {
      const v = await getVersion();
      set({ version: v });
    } catch {
      set({ version: null });
    }
  },

  chargerModeActif: async () => {
    try {
      set({ modeActif: await getModeActif() });
    } catch {
      set({ modeActif: null });
    }
  },

  setModeActif: (nom) => set({ modeActif: nom }),

  lancer: async (nom) => {
    try {
      await setMode(nom);
      set({ erreur: null, modeActif: nom });
    } catch (e) {
      set({ erreur: messageErreur(e) });
    }
  },

  creer: async (mode) => {
    await addMode(mode);
    await get().charger();
  },

  mettreAJour: async (ancienNom, mode) => {
    if (mode.name === ancienNom) {
      await editMode(mode);
    } else {
      // Le firmware identifie un mode par son nom : un renommage = supprimer + ajouter.
      await addMode(mode);
      await deleteMode(ancienNom);
    }
    await get().charger();
  },

  supprimer: async (nom) => {
    try {
      await deleteMode(nom);
      _lancements.delete(nom);
      await get().charger();
    } catch (e) {
      set({ erreur: messageErreur(e) });
    }
  },

  dupliquer: async (nom) => {
    const source = get().programmes.find((p) => p.nom === nom);
    if (!source) return;
    const existants = new Set(get().programmes.map((p) => p.nom));
    const copie: ModeAppareil = {
      name: nomCopie(source.nom, existants),
      loop: true,
      etapes: source.etapes.map((e) => ({ ...e })),
    };
    try {
      await addMode(copie);
      await get().charger();
    } catch (e) {
      set({ erreur: messageErreur(e) });
    }
  },

  incrementerLancements: (nom) => {
    _lancements.set(nom, (_lancements.get(nom) ?? 0) + 1);
    _derniereExecution.set(nom, ++_rangExecution);
    set((s) => ({
      programmes: s.programmes.map((p) =>
        p.nom === nom
          ? {
              ...p,
              nbLancements: _lancements.get(nom) ?? 0,
              derniereExecution: _derniereExecution.get(nom) ?? 0,
            }
          : p
      ),
    }));
  },
}));
