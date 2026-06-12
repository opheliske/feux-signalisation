import { Programme } from "../theme";
import { surChangementEtape, surArret } from "./stimulation";
import { useFeuStore } from "../stores/useFeuStore";
import { useReglagesStore } from "../stores/useReglagesStore";

// Moteur d'affichage uniquement : le feu exécute lui-même la séquence du mode
// actif (commande `set`). Ce moteur ne fait QUE suivre l'étape en cours pour
// piloter la couleur de la boule disco / le miroir et les retours locaux. Il
// notifie l'écran UNIQUEMENT au changement d'étape (pas de progression : aucune
// barre de progression n'existe, et un re-render à 100 ms ralentit l'app).

const INTERVALLE_MS = 100;

type OnTick = (etapeIndex: number) => void;
type OnStop = () => void;

type MoteurState = {
  programme: Programme;
  etapeIndex: number;
  progressionMs: number;
  enPause: boolean;
  intervalle: ReturnType<typeof setInterval> | null;
  onTick: OnTick;
  onStop: OnStop;
};

let _state: MoteurState | null = null;

export function lancerProgramme(
  programme: Programme,
  onTick: OnTick,
  onStop: OnStop
): void {
  arreterMoteur();
  if (programme.etapes.length === 0) return;

  _state = {
    programme,
    etapeIndex: 0,
    progressionMs: 0,
    enPause: false,
    intervalle: null,
    onTick,
    onStop,
  };

  const reglages = useReglagesStore.getState().reglages;
  surChangementEtape(programme.etapes[0].lampes, reglages);
  onTick(0);
  _state.intervalle = setInterval(_tick, INTERVALLE_MS);
}

function _tick(): void {
  if (!_state || _state.enPause) return;

  // Vérifier la minuterie
  const { finMinuterie } = useFeuStore.getState().etat;
  if (finMinuterie !== null && Date.now() >= finMinuterie) {
    arreterMoteur();
    useFeuStore.getState().setFinMinuterie(null);
    useFeuStore.getState().setProgrammeEnCours(null);
    return;
  }

  _state.progressionMs += INTERVALLE_MS;
  const etape = _state.programme.etapes[_state.etapeIndex];
  const dureeTotaleMs = etape.dureeSecondes * 1000;

  // On ne notifie qu'au passage d'une étape à la suivante.
  if (_state.progressionMs >= dureeTotaleMs) {
    _state.etapeIndex =
      (_state.etapeIndex + 1) % _state.programme.etapes.length;
    _state.progressionMs = 0;
    const nouvelleEtape = _state.programme.etapes[_state.etapeIndex];
    const reglages = useReglagesStore.getState().reglages;
    surChangementEtape(nouvelleEtape.lampes, reglages);
    _state.onTick(_state.etapeIndex);
  }
}

export function pauseMoteur(): void {
  if (_state) _state.enPause = true;
}

export function reprendreMoteur(): void {
  if (_state) _state.enPause = false;
}

export function arreterMoteur(): void {
  if (_state?.intervalle) clearInterval(_state.intervalle);
  const reglages = useReglagesStore.getState()?.reglages;
  if (reglages) surArret(reglages).catch(() => {});
  _state = null;
}

export function estEnPause(): boolean {
  return _state?.enPause ?? false;
}

export function estActif(): boolean {
  return _state !== null;
}
