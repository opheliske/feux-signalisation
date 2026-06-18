import { Light } from "../theme";
import { useLightStore } from "../stores/useLightStore";
import { useProgramsStore } from "../stores/useProgramsStore";
import {
  DeviceMode,
  decodeActiveMode,
  decodeModes,
  decodeVersion,
  encodeAdd,
  encodeDelete,
  encodeEdit,
  encodeSet,
} from "./protocol";

const HEARTBEAT_MS = 5000;
const TIMEOUT_MS = 4000;

// The "off" mode is always present in the firmware. Triggered when the user
// stops a mode (stop button). Adjust this name if it differs on the firmware side.
export const MODE_OFF = "OFF";

let _lightIp: string | null = null;
let _heartbeatTimer: ReturnType<typeof setInterval> | null = null;

export function configureIp(ip: string | null): void {
  _lightIp = ip;
}

// ─── Binary transport (XHR: the most reliable for binary under RN) ──────────

function xhrBinary(
  method: "GET" | "POST",
  url: string,
  body?: Uint8Array
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.responseType = "arraybuffer";
    xhr.timeout = TIMEOUT_MS;
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as ArrayBuffer);
      } else {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.ontimeout = () => reject(new Error("Request timed out"));
    if (body) {
      xhr.setRequestHeader("Content-Type", "application/octet-stream");
      // Uint8Array from Uint8Array.from(...): .buffer is exactly sized.
      xhr.send(body.buffer);
    } else {
      xhr.send();
    }
  });
}

function requireIp(): string {
  if (!_lightIp) throw new Error("No IP address configured for the light.");
  return _lightIp;
}

// ─── Device API ───────────────────────────────────────────────────────────

export async function getModes(): Promise<DeviceMode[]> {
  const buf = await xhrBinary("GET", `http://${requireIp()}/get_modes`);
  return decodeModes(buf);
}

export async function getVersion(): Promise<string> {
  const buf = await xhrBinary("GET", `http://${requireIp()}/version`);
  return decodeVersion(buf);
}

export async function setMode(name: string): Promise<void> {
  await xhrBinary("POST", `http://${requireIp()}/command`, encodeSet(name));
}

export async function getActiveMode(): Promise<string | null> {
  const buf = await xhrBinary("GET", `http://${requireIp()}/get_mode`);
  return decodeActiveMode(buf);
}

export async function addMode(mode: DeviceMode): Promise<void> {
  await xhrBinary("POST", `http://${requireIp()}/command`, encodeAdd(mode));
}

export async function editMode(mode: DeviceMode): Promise<void> {
  await xhrBinary("POST", `http://${requireIp()}/command`, encodeEdit(mode));
}

export async function deleteMode(name: string): Promise<void> {
  await xhrBinary("POST", `http://${requireIp()}/command`, encodeDelete(name));
}

// ─── Direct light commands (legacy — endpoints outside current scope) ───────

export async function sendLightCommand(
  lights: Light | Light[]
): Promise<void> {
  if (!_lightIp) return;
  const list = Array.isArray(lights) ? lights : [lights];
  const normalized = list.length === 0 ? (["off"] as Light[]) : list;
  const res = await fetch(`http://${_lightIp}/lampe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lampes: normalized }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function turnOnLight(): Promise<void> {
  if (!_lightIp) return;
  await fetch(`http://${_lightIp}/allumer`, { method: "POST" });
}

export async function turnOffLight(): Promise<void> {
  await sendLightCommand("off").catch(() => {});
  if (_lightIp) {
    await fetch(`http://${_lightIp}/eteindre`, { method: "POST" }).catch(() => {});
  }
}

// ─── Heartbeat: polls the active mode (also serves as a connection indicator) ──

// Queries /get_mode: updates the displayed active mode (it can change on the
// light side, e.g. via the physical button) and infers the connection state.
async function pollActiveMode(): Promise<void> {
  if (!_lightIp) {
    useLightStore.getState().setConnection("disconnected");
    return;
  }
  try {
    const mode = await getActiveMode();
    useProgramsStore.getState().setActiveMode(mode);
    useLightStore.getState().setConnection("connected");
  } catch {
    useLightStore.getState().setConnection("disconnected");
  }
}

export function startHeartbeat(): void {
  if (_heartbeatTimer) return;
  // First poll immediately
  pollActiveMode();
  _heartbeatTimer = setInterval(pollActiveMode, HEARTBEAT_MS);
}

export function stopHeartbeat(): void {
  if (_heartbeatTimer) {
    clearInterval(_heartbeatTimer);
    _heartbeatTimer = null;
  }
}
