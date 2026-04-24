import { create } from "zustand";
import { EtatFeu } from "../theme";

const etatInitial: EtatFeu = {
  allume: false,
  programmeEnCours: null,
  etapeIndex: 0,
  progression: 0,
  enPause: false,
  connexionFeu: "inconnu",
  dernierProgrammeLanceId: null,
  finMinuterie: null,
  erreur: null,
};

type FeuStore = {
  etat: EtatFeu;
  torchAllume: boolean;
  setAllume: (allume: boolean) => void;
  setProgrammeEnCours: (id: string | null) => void;
  setEtapeIndex: (index: number) => void;
  setProgression: (progression: number) => void;
  setEnPause: (enPause: boolean) => void;
  setConnexionFeu: (connexion: EtatFeu["connexionFeu"]) => void;
  setDernierProgrammeLanceId: (id: string | null) => void;
  setFinMinuterie: (ts: number | null) => void;
  setErreur: (msg: string | null) => void;
  setTorchAllume: (allume: boolean) => void;
  reset: () => void;
};

export const useFeuStore = create<FeuStore>()((set) => ({
  etat: etatInitial,
  torchAllume: false,
  setAllume: (allume) =>
    set((s) => ({ etat: { ...s.etat, allume } })),
  setProgrammeEnCours: (programmeEnCours) =>
    set((s) => ({ etat: { ...s.etat, programmeEnCours } })),
  setEtapeIndex: (etapeIndex) =>
    set((s) => ({ etat: { ...s.etat, etapeIndex } })),
  setProgression: (progression) =>
    set((s) => ({ etat: { ...s.etat, progression } })),
  setEnPause: (enPause) =>
    set((s) => ({ etat: { ...s.etat, enPause } })),
  setConnexionFeu: (connexionFeu) =>
    set((s) => ({ etat: { ...s.etat, connexionFeu } })),
  setDernierProgrammeLanceId: (dernierProgrammeLanceId) =>
    set((s) => ({ etat: { ...s.etat, dernierProgrammeLanceId } })),
  setFinMinuterie: (finMinuterie) =>
    set((s) => ({ etat: { ...s.etat, finMinuterie } })),
  setErreur: (erreur) =>
    set((s) => ({ etat: { ...s.etat, erreur } })),
  setTorchAllume: (torchAllume) => set({ torchAllume }),
  reset: () => set((s) => ({ etat: { ...etatInitial, connexionFeu: s.etat.connexionFeu, dernierProgrammeLanceId: s.etat.dernierProgrammeLanceId }, torchAllume: false })),
}));
