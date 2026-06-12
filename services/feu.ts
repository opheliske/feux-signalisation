import { Lampe } from "../theme";
import { useFeuStore } from "../stores/useFeuStore";
import { useProgrammesStore } from "../stores/useProgrammesStore";
import {
  ModeAppareil,
  decoderModeActif,
  decoderModes,
  decoderVersion,
  encoderAdd,
  encoderDelete,
  encoderEdit,
  encoderSet,
} from "./protocol";

const HEARTBEAT_MS = 5000;
const TIMEOUT_MS = 4000;

// Mode « éteint » toujours présent dans le firmware. Lancé quand l'utilisateur
// arrête un mode (bouton stop). Adapter ce nom s'il diffère côté firmware.
export const MODE_OFF = "OFF";

let _ipFeu: string | null = null;
let _heartbeatTimer: ReturnType<typeof setInterval> | null = null;

export function configurerIP(ip: string | null): void {
  _ipFeu = ip;
}

// ─── Transport binaire (XHR : le plus fiable pour le binaire sous RN) ───────

function xhrBinaire(
  methode: "GET" | "POST",
  url: string,
  corps?: Uint8Array
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(methode, url);
    xhr.responseType = "arraybuffer";
    xhr.timeout = TIMEOUT_MS;
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as ArrayBuffer);
      } else {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Erreur réseau"));
    xhr.ontimeout = () => reject(new Error("Délai dépassé"));
    if (corps) {
      xhr.setRequestHeader("Content-Type", "application/octet-stream");
      // Uint8Array issu de Uint8Array.from(...) : .buffer est exactement dimensionné.
      xhr.send(corps.buffer);
    } else {
      xhr.send();
    }
  });
}

function exigeIp(): string {
  if (!_ipFeu) throw new Error("Aucune adresse IP configurée pour le feu.");
  return _ipFeu;
}

// ─── API appareil ───────────────────────────────────────────────────────────

export async function getModes(): Promise<ModeAppareil[]> {
  const buf = await xhrBinaire("GET", `http://${exigeIp()}/get_modes`);
  return decoderModes(buf);
}

export async function getVersion(): Promise<string> {
  const buf = await xhrBinaire("GET", `http://${exigeIp()}/version`);
  return decoderVersion(buf);
}

export async function setMode(nom: string): Promise<void> {
  await xhrBinaire("POST", `http://${exigeIp()}/command`, encoderSet(nom));
}

export async function getModeActif(): Promise<string | null> {
  const buf = await xhrBinaire("GET", `http://${exigeIp()}/get_mode`);
  return decoderModeActif(buf);
}

export async function addMode(mode: ModeAppareil): Promise<void> {
  await xhrBinaire("POST", `http://${exigeIp()}/command`, encoderAdd(mode));
}

export async function editMode(mode: ModeAppareil): Promise<void> {
  await xhrBinaire("POST", `http://${exigeIp()}/command`, encoderEdit(mode));
}

export async function deleteMode(nom: string): Promise<void> {
  await xhrBinaire("POST", `http://${exigeIp()}/command`, encoderDelete(nom));
}

// ─── Commandes lampe directes (héritées — endpoints hors périmètre actuel) ──

export async function envoyerCommandeAuFeu(
  lampes: Lampe | Lampe[]
): Promise<void> {
  if (!_ipFeu) return;
  const liste = Array.isArray(lampes) ? lampes : [lampes];
  const normalisees = liste.length === 0 ? (["eteint"] as Lampe[]) : liste;
  const res = await fetch(`http://${_ipFeu}/lampe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lampes: normalisees }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function allumerFeu(): Promise<void> {
  if (!_ipFeu) return;
  await fetch(`http://${_ipFeu}/allumer`, { method: "POST" });
}

export async function eteindreFeu(): Promise<void> {
  await envoyerCommandeAuFeu("eteint").catch(() => {});
  if (_ipFeu) {
    await fetch(`http://${_ipFeu}/eteindre`, { method: "POST" }).catch(() => {});
  }
}

// ─── Heartbeat : sonde le mode actif (sert aussi d'indicateur de connexion) ──

// Interroge /get_mode : met à jour le mode actif affiché (il peut changer côté
// feu, ex. via le bouton physique) et en déduit l'état de connexion.
async function sonderModeActif(): Promise<void> {
  if (!_ipFeu) {
    useFeuStore.getState().setConnexionFeu("deconnecte");
    return;
  }
  try {
    const mode = await getModeActif();
    useProgrammesStore.getState().setModeActif(mode);
    useFeuStore.getState().setConnexionFeu("connecte");
  } catch {
    useFeuStore.getState().setConnexionFeu("deconnecte");
  }
}

export function demarrerHeartbeat(): void {
  if (_heartbeatTimer) return;
  // Première sonde immédiate
  sonderModeActif();
  _heartbeatTimer = setInterval(sonderModeActif, HEARTBEAT_MS);
}

export function arreterHeartbeat(): void {
  if (_heartbeatTimer) {
    clearInterval(_heartbeatTimer);
    _heartbeatTimer = null;
  }
}
