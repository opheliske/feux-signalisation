// ─── Binary protocol of the light ──────────────────────────────────────────
//
// Encoding/decoding of the binary packets exchanged with the ESP32-C3 firmware.
// Everything is little-endian. The source of truth is the firmware C code
// (main/modes/mode_decoder.c, mode_manager.c), NOT description.md which is
// partly wrong (see the plan).
//
// POST /command frame: [ command_id : uint8 ] [ payload ]
//   set    = 1 : [ name_len u16 ] [ name ]
//   add    = 2 : [ name_len u16 ] [ name ] [ loop u8 ] [ nb_steps u16 ] [[ mask u8 ][ duration u32 ] ...]
//   custom = 3 : (unused here)
//   delete = 4 : [ name_len u16 ] [ name ]
//   edit   = 5 : [ name_len u16 ] [ name ] [ loop u8 ] [ nb_steps u16 ] [[ mask u8 ][ duration u32 ] ...]
//
// GET /get_modes : [ count u16 ] [[ name_len u16 ][ name ][ loop u8 ][ nb_steps u16 ][[ mask u8 ][ duration u32 ] ...] ...]
// GET /version   : [ version_len u16 ] [ version ]

import { Step, Light } from "../theme";

// ─── Constants (must mirror the firmware) ──────────────────────────────────

export const CMD = {
  GET_MODES: 0,
  SET_MODE: 1,
  ADD_MODE: 2,
  CUSTOM_MODE: 3,
  DELETE_MODE: 4,
  EDIT_MODE: 5,
} as const;

export const MAX_NAME_LEN = 100; // bytes, not characters
export const MAX_STEPS = 10;

// LED mask bits (led.h): green=bit0, orange=bit1, red=bit2.
const MASK_GREEN = 0x01;
const MASK_ORANGE = 0x02;
const MASK_RED = 0x04;

export type DeviceMode = {
  name: string;
  loop: boolean;
  steps: Step[];
};

// ─── UTF-8 (without relying on TextEncoder/TextDecoder, absent under Hermes) ──

export function encodeUtf8(s: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) {
    let code = s.charCodeAt(i);
    // Surrogate pairs
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < s.length) {
      const next = s.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
        i++;
      }
    }
    if (code < 0x80) {
      out.push(code);
    } else if (code < 0x800) {
      out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      out.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    } else {
      out.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    }
  }
  return out;
}

export function decodeUtf8(bytes: Uint8Array, start: number, len: number): string {
  let s = "";
  let i = start;
  const end = start + len;
  while (i < end) {
    const b0 = bytes[i++];
    let code: number;
    if (b0 < 0x80) {
      code = b0;
    } else if (b0 < 0xe0) {
      code = ((b0 & 0x1f) << 6) | (bytes[i++] & 0x3f);
    } else if (b0 < 0xf0) {
      code =
        ((b0 & 0x0f) << 12) |
        ((bytes[i++] & 0x3f) << 6) |
        (bytes[i++] & 0x3f);
    } else {
      code =
        ((b0 & 0x07) << 18) |
        ((bytes[i++] & 0x3f) << 12) |
        ((bytes[i++] & 0x3f) << 6) |
        (bytes[i++] & 0x3f);
    }
    if (code > 0xffff) {
      code -= 0x10000;
      s += String.fromCharCode(0xd800 + (code >> 10), 0xdc00 + (code & 0x3ff));
    } else {
      s += String.fromCharCode(code);
    }
  }
  return s;
}

// ─── Mask ↔ lights ────────────────────────────────────────────────────────

export function maskFromLights(lights: Light[]): number {
  let mask = 0;
  for (const l of lights) {
    if (l === "green") mask |= MASK_GREEN;
    else if (l === "orange") mask |= MASK_ORANGE;
    else if (l === "red") mask |= MASK_RED;
    // "off" => no bit
  }
  return mask & 0xff;
}

export function lightsFromMask(mask: number): Light[] {
  const lights: Light[] = [];
  if (mask & MASK_GREEN) lights.push("green");
  if (mask & MASK_ORANGE) lights.push("orange");
  if (mask & MASK_RED) lights.push("red");
  return lights.length === 0 ? ["off"] : lights;
}

// ─── Duration ↔ ms ─────────────────────────────────────────────────────────

export function msFromSeconds(seconds: number): number {
  return Math.max(0, Math.round(seconds * 1000));
}

export function secondsFromMs(ms: number): number {
  return ms / 1000;
}

// ─── Validation ─────────────────────────────────────────────────────────────

export class ProtocolError extends Error {}

function validateName(name: string): number[] {
  const bytes = encodeUtf8(name);
  if (bytes.length === 0) {
    throw new ProtocolError("The name cannot be empty.");
  }
  if (bytes.length > MAX_NAME_LEN) {
    throw new ProtocolError(
      `The name is too long (max ${MAX_NAME_LEN} characters).`
    );
  }
  return bytes;
}

function validateSteps(steps: Step[]): void {
  if (steps.length === 0) {
    throw new ProtocolError("At least one step is required.");
  }
  if (steps.length > MAX_STEPS) {
    throw new ProtocolError(`Too many steps (max ${MAX_STEPS}).`);
  }
}

// ─── Binary writing ───────────────────────────────────────────────────────────

class Writer {
  private bytes: number[] = [];

  u8(v: number): this {
    this.bytes.push(v & 0xff);
    return this;
  }

  u16(v: number): this {
    this.bytes.push(v & 0xff, (v >> 8) & 0xff);
    return this;
  }

  u32(v: number): this {
    this.bytes.push(
      v & 0xff,
      (v >> 8) & 0xff,
      (v >> 16) & 0xff,
      (v >> 24) & 0xff
    );
    return this;
  }

  rawBytes(bs: number[]): this {
    for (const b of bs) this.bytes.push(b & 0xff);
    return this;
  }

  // Length-prefixed string field: [ len u16 ] [ bytes ]
  string(bytes: number[]): this {
    return this.u16(bytes.length).rawBytes(bytes);
  }

  // Common add/edit body: [ loop u8 ] [ nb_steps u16 ] [[ mask u8 ][ duration u32 ] ...]
  stepsBody(loop: boolean, steps: Step[]): this {
    this.u8(loop ? 1 : 0).u16(steps.length);
    for (const s of steps) {
      this.u8(maskFromLights(s.lights)).u32(msFromSeconds(s.durationSeconds));
    }
    return this;
  }

  finish(): Uint8Array {
    return Uint8Array.from(this.bytes);
  }
}

export function encodeSet(name: string): Uint8Array {
  const bytes = validateName(name);
  return new Writer().u8(CMD.SET_MODE).string(bytes).finish();
}

export function encodeDelete(name: string): Uint8Array {
  const bytes = validateName(name);
  return new Writer().u8(CMD.DELETE_MODE).string(bytes).finish();
}

export function encodeAdd(mode: DeviceMode): Uint8Array {
  const bytes = validateName(mode.name);
  validateSteps(mode.steps);
  return new Writer()
    .u8(CMD.ADD_MODE)
    .string(bytes)
    .stepsBody(mode.loop, mode.steps)
    .finish();
}

export function encodeEdit(mode: DeviceMode): Uint8Array {
  const bytes = validateName(mode.name);
  validateSteps(mode.steps);
  return new Writer()
    .u8(CMD.EDIT_MODE)
    .string(bytes)
    .stepsBody(mode.loop, mode.steps)
    .finish();
}

// ─── Binary reading ────────────────────────────────────────────────────────

class Reader {
  private view: DataView;
  private bytes: Uint8Array;
  private pos = 0;

  constructor(buf: ArrayBuffer) {
    this.view = new DataView(buf);
    this.bytes = new Uint8Array(buf);
  }

  get remaining(): number {
    return this.bytes.length - this.pos;
  }

  u8(): number {
    const v = this.view.getUint8(this.pos);
    this.pos += 1;
    return v;
  }

  u16(): number {
    const v = this.view.getUint16(this.pos, true);
    this.pos += 2;
    return v;
  }

  u32(): number {
    const v = this.view.getUint32(this.pos, true);
    this.pos += 4;
    return v;
  }

  string(len: number): string {
    const s = decodeUtf8(this.bytes, this.pos, len);
    this.pos += len;
    return s;
  }
}

export function decodeModes(buf: ArrayBuffer): DeviceMode[] {
  const r = new Reader(buf);
  if (r.remaining < 2) return [];
  const count = r.u16();
  const modes: DeviceMode[] = [];
  for (let i = 0; i < count; i++) {
    const nameLen = r.u16();
    const name = r.string(nameLen);
    const loop = r.u8() !== 0;
    const nbSteps = r.u16();
    const steps: Step[] = [];
    for (let s = 0; s < nbSteps; s++) {
      const mask = r.u8();
      const durationMs = r.u32();
      steps.push({
        id: `${name}-${s}`,
        lights: lightsFromMask(mask),
        durationSeconds: secondsFromMs(durationMs),
      });
    }
    modes.push({ name, loop, steps });
  }
  return modes;
}

export function decodeVersion(buf: ArrayBuffer): string {
  const r = new Reader(buf);
  if (r.remaining < 2) return "";
  const len = r.u16();
  return r.string(len);
}

// GET /get_mode : [ name_len u16 ][ name ]. name_len 0 => no active mode.
export function decodeActiveMode(buf: ArrayBuffer): string | null {
  const name = decodeVersion(buf); // same encoding [ len u16 ][ bytes ]
  return name.length > 0 ? name : null;
}
