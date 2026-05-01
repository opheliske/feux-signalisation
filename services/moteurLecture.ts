import { Lampe, Programme } from "../theme";
import { envoyerCommandeAuFeu } from "./feu";
import { surChangementEtape, surArret } from "./stimulation";
import { useFeuStore } from "../stores/useFeuStore";
import { useReglagesStore } from "../stores/useReglagesStore";

const INTERVALLE_MS = 100;
const MAX_RETRIES = 2;
const DELAI_RETRY_MS = 500;

type OnTick = (etapeIndex: number, progression: number) => void;
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

function _sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function _envoyerAvecRetry(
  lampes: Lampe[],
  tentative = 0
): Promise<void> {
  try {
    await envoyerCommandeAuFeu(lampes);
    useFeuStore.getState().setConnexionFeu("connecte");
    useFeuStore.getState().setErreur(null);
  } catch {
    if (tentative < MAX_RETRIES) {
      await _sleep(DELAI_RETRY_MS);
      return _envoyerAvecRetry(lampes, tentative + 1);
    }
    useFeuStore.getState().setConnexionFeu("deconnecte");
    useFeuStore.getState().setErreur(
      "Je n'arrive pas à parler au feu. Veux-tu réessayer ?"
    );
  }
}

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
  _envoyerAvecRetry(programme.etapes[0].lampes);
  surChangementEtape(programme.etapes[0].lampes, reglages);
  onTick(0, 0);
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

  if (_state.progressionMs >= dureeTotaleMs) {
    _state.etapeIndex =
      (_state.etapeIndex + 1) % _state.programme.etapes.length;
    _state.progressionMs = 0;
    const nouvelleEtape = _state.programme.etapes[_state.etapeIndex];
    const reglages = useReglagesStore.getState().reglages;
    _envoyerAvecRetry(nouvelleEtape.lampes);
    surChangementEtape(nouvelleEtape.lampes, reglages);
    _state.onTick(_state.etapeIndex, 0);
  } else {
    _state.onTick(_state.etapeIndex, _state.progressionMs / dureeTotaleMs);
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
