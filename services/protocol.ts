// ─── Protocole binaire du feu ──────────────────────────────────────────────
//
// Encodage/décodage des paquets binaires échangés avec le firmware ESP32-C3.
// Tout est en little-endian. La source de vérité est le code C du firmware
// (main/modes/mode_decoder.c, mode_manager.c), PAS description.md qui est en
// partie erroné (voir le plan).
//
// Cadre POST /command : [ command_id : uint8 ] [ payload ]
//   set    = 1 : [ name_len u16 ] [ name ]
//   add    = 2 : [ name_len u16 ] [ name ] [ loop u8 ] [ nb_steps u16 ] [[ mask u8 ][ duration u32 ] ...]
//   custom = 3 : (non utilisé ici)
//   delete = 4 : [ name_len u16 ] [ name ]
//   edit   = 5 : [ name_len u16 ] [ name ] [ loop u8 ] [ nb_steps u16 ] [[ mask u8 ][ duration u32 ] ...]
//
// GET /get_modes : [ count u16 ] [[ name_len u16 ][ name ][ loop u8 ][ nb_steps u16 ][[ mask u8 ][ duration u32 ] ...] ...]
// GET /version   : [ version_len u16 ] [ version ]

import { Etape, Lampe } from "../theme";

// ─── Constantes (doivent refléter le firmware) ─────────────────────────────

export const CMD = {
  GET_MODES: 0,
  SET_MODE: 1,
  ADD_MODE: 2,
  CUSTOM_MODE: 3,
  DELETE_MODE: 4,
  EDIT_MODE: 5,
} as const;

export const MAX_NAME_LEN = 100; // octets, pas caractères
export const MAX_STEPS = 10;

// Bits du masque LED (led.h) : green=bit0, orange=bit1, red=bit2.
const MASK_VERT = 0x01;
const MASK_ORANGE = 0x02;
const MASK_ROUGE = 0x04;

export type ModeAppareil = {
  name: string;
  loop: boolean;
  etapes: Etape[];
};

// ─── UTF-8 (sans dépendre de TextEncoder/TextDecoder, absents sous Hermes) ──

export function encoderUtf8(s: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) {
    let code = s.charCodeAt(i);
    // Paires de substitution (surrogate pairs)
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

export function decoderUtf8(bytes: Uint8Array, debut: number, len: number): string {
  let s = "";
  let i = debut;
  const fin = debut + len;
  while (i < fin) {
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

// ─── Masque ↔ lampes ────────────────────────────────────────────────────────

export function masqueDepuisLampes(lampes: Lampe[]): number {
  let masque = 0;
  for (const l of lampes) {
    if (l === "vert") masque |= MASK_VERT;
    else if (l === "orange") masque |= MASK_ORANGE;
    else if (l === "rouge") masque |= MASK_ROUGE;
    // "eteint" => aucun bit
  }
  return masque & 0xff;
}

export function lampesDepuisMasque(masque: number): Lampe[] {
  const lampes: Lampe[] = [];
  if (masque & MASK_VERT) lampes.push("vert");
  if (masque & MASK_ORANGE) lampes.push("orange");
  if (masque & MASK_ROUGE) lampes.push("rouge");
  return lampes.length === 0 ? ["eteint"] : lampes;
}

// ─── Durée ↔ ms ─────────────────────────────────────────────────────────────

export function msDepuisSecondes(secondes: number): number {
  return Math.max(0, Math.round(secondes * 1000));
}

export function secondesDepuisMs(ms: number): number {
  return ms / 1000;
}

// ─── Validation ─────────────────────────────────────────────────────────────

export class ErreurProtocole extends Error {}

function valideNom(nom: string): number[] {
  const octets = encoderUtf8(nom);
  if (octets.length === 0) {
    throw new ErreurProtocole("Le nom ne peut pas être vide.");
  }
  if (octets.length > MAX_NAME_LEN) {
    throw new ErreurProtocole(
      `Le nom est trop long (max ${MAX_NAME_LEN} caractères).`
    );
  }
  return octets;
}

function valideEtapes(etapes: Etape[]): void {
  if (etapes.length === 0) {
    throw new ErreurProtocole("Il faut au moins une étape.");
  }
  if (etapes.length > MAX_STEPS) {
    throw new ErreurProtocole(`Trop d'étapes (max ${MAX_STEPS}).`);
  }
}

// ─── Écriture binaire ───────────────────────────────────────────────────────

class Ecrivain {
  private octets: number[] = [];

  u8(v: number): this {
    this.octets.push(v & 0xff);
    return this;
  }

  u16(v: number): this {
    this.octets.push(v & 0xff, (v >> 8) & 0xff);
    return this;
  }

  u32(v: number): this {
    this.octets.push(
      v & 0xff,
      (v >> 8) & 0xff,
      (v >> 16) & 0xff,
      (v >> 24) & 0xff
    );
    return this;
  }

  octetsBruts(bs: number[]): this {
    for (const b of bs) this.octets.push(b & 0xff);
    return this;
  }

  // Champ chaîne longueur-préfixée : [ len u16 ] [ bytes ]
  chaine(octets: number[]): this {
    return this.u16(octets.length).octetsBruts(octets);
  }

  // Corps commun add/edit : [ loop u8 ] [ nb_steps u16 ] [[ mask u8 ][ duration u32 ] ...]
  corpsEtapes(loop: boolean, etapes: Etape[]): this {
    this.u8(loop ? 1 : 0).u16(etapes.length);
    for (const e of etapes) {
      this.u8(masqueDepuisLampes(e.lampes)).u32(msDepuisSecondes(e.dureeSecondes));
    }
    return this;
  }

  finir(): Uint8Array {
    return Uint8Array.from(this.octets);
  }
}

export function encoderSet(nom: string): Uint8Array {
  const octets = valideNom(nom);
  return new Ecrivain().u8(CMD.SET_MODE).chaine(octets).finir();
}

export function encoderDelete(nom: string): Uint8Array {
  const octets = valideNom(nom);
  return new Ecrivain().u8(CMD.DELETE_MODE).chaine(octets).finir();
}

export function encoderAdd(mode: ModeAppareil): Uint8Array {
  const octets = valideNom(mode.name);
  valideEtapes(mode.etapes);
  return new Ecrivain()
    .u8(CMD.ADD_MODE)
    .chaine(octets)
    .corpsEtapes(mode.loop, mode.etapes)
    .finir();
}

export function encoderEdit(mode: ModeAppareil): Uint8Array {
  const octets = valideNom(mode.name);
  valideEtapes(mode.etapes);
  return new Ecrivain()
    .u8(CMD.EDIT_MODE)
    .chaine(octets)
    .corpsEtapes(mode.loop, mode.etapes)
    .finir();
}

// ─── Lecture binaire ────────────────────────────────────────────────────────

class Lecteur {
  private vue: DataView;
  private octets: Uint8Array;
  private pos = 0;

  constructor(buf: ArrayBuffer) {
    this.vue = new DataView(buf);
    this.octets = new Uint8Array(buf);
  }

  get reste(): number {
    return this.octets.length - this.pos;
  }

  u8(): number {
    const v = this.vue.getUint8(this.pos);
    this.pos += 1;
    return v;
  }

  u16(): number {
    const v = this.vue.getUint16(this.pos, true);
    this.pos += 2;
    return v;
  }

  u32(): number {
    const v = this.vue.getUint32(this.pos, true);
    this.pos += 4;
    return v;
  }

  chaine(len: number): string {
    const s = decoderUtf8(this.octets, this.pos, len);
    this.pos += len;
    return s;
  }
}

export function decoderModes(buf: ArrayBuffer): ModeAppareil[] {
  const r = new Lecteur(buf);
  if (r.reste < 2) return [];
  const count = r.u16();
  const modes: ModeAppareil[] = [];
  for (let i = 0; i < count; i++) {
    const nameLen = r.u16();
    const name = r.chaine(nameLen);
    const loop = r.u8() !== 0;
    const nbSteps = r.u16();
    const etapes: Etape[] = [];
    for (let s = 0; s < nbSteps; s++) {
      const mask = r.u8();
      const dureeMs = r.u32();
      etapes.push({
        id: `${name}-${s}`,
        lampes: lampesDepuisMasque(mask),
        dureeSecondes: secondesDepuisMs(dureeMs),
      });
    }
    modes.push({ name, loop, etapes });
  }
  return modes;
}

export function decoderVersion(buf: ArrayBuffer): string {
  const r = new Lecteur(buf);
  if (r.reste < 2) return "";
  const len = r.u16();
  return r.chaine(len);
}

// GET /get_mode : [ name_len u16 ][ name ]. name_len 0 => aucun mode actif.
export function decoderModeActif(buf: ArrayBuffer): string | null {
  const nom = decoderVersion(buf); // même encodage [ len u16 ][ bytes ]
  return nom.length > 0 ? nom : null;
}
