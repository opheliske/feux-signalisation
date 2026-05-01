import { Lampe } from "../theme";
import { useFeuStore } from "../stores/useFeuStore";

const MODE = process.env["EXPO_PUBLIC_FEU_MODE"] ?? "mock";
const HEARTBEAT_MS = 15000;

let _ipFeu: string | null = null;
let _heartbeatTimer: ReturnType<typeof setInterval> | null = null;

export function configurerIP(ip: string | null): void {
  _ipFeu = ip;
}

export async function envoyerCommandeAuFeu(
  lampes: Lampe | Lampe[]
): Promise<void> {
  const liste = Array.isArray(lampes) ? lampes : [lampes];
  const normalisees = liste.length === 0 ? (["eteint"] as Lampe[]) : liste;
  if (MODE === "wifi") {
    if (!_ipFeu) return;
    const res = await fetch(`http://${_ipFeu}/lampe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lampes: normalisees }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } else {
    console.log(`[feu mock] lampes → ${normalisees.join(", ")}`);
  }
}

export async function allumerFeu(): Promise<void> {
  if (MODE === "wifi") {
    if (!_ipFeu) return;
    await fetch(`http://${_ipFeu}/allumer`, { method: "POST" });
  } else {
    console.log("[feu mock] allumer");
  }
}

export async function eteindreFeu(): Promise<void> {
  await envoyerCommandeAuFeu("eteint").catch(() => {});
  if (MODE === "wifi" && _ipFeu) {
    await fetch(`http://${_ipFeu}/eteindre`, { method: "POST" }).catch(() => {});
  } else {
    console.log("[feu mock] éteindre");
  }
}

export async function pingFeu(): Promise<boolean> {
  if (MODE === "mock") return true;
  if (!_ipFeu) return false;
  try {
    const res = await fetch(`http://${_ipFeu}/ping`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function demarrerHeartbeat(): void {
  if (_heartbeatTimer) return;
  // Premier ping immédiat
  pingFeu().then((ok) => {
    useFeuStore.getState().setConnexionFeu(ok ? "connecte" : "deconnecte");
  });
  _heartbeatTimer = setInterval(async () => {
    const ok = await pingFeu();
    useFeuStore.getState().setConnexionFeu(ok ? "connecte" : "deconnecte");
  }, HEARTBEAT_MS);
}

export function arreterHeartbeat(): void {
  if (_heartbeatTimer) {
    clearInterval(_heartbeatTimer);
    _heartbeatTimer = null;
  }
}
