import {
  CMD,
  encoderSet,
  encoderDelete,
  encoderAdd,
  encoderEdit,
  decoderModes,
  decoderVersion,
  masqueDepuisLampes,
  lampesDepuisMasque,
  msDepuisSecondes,
  secondesDepuisMs,
  encoderUtf8,
  ErreurProtocole,
  ModeAppareil,
  MAX_NAME_LEN,
} from "../services/protocol";
import { Etape, Lampe } from "../theme";

// Petits helpers de test
function hex(...bytes: number[]): Uint8Array {
  return Uint8Array.from(bytes);
}
function toArray(u8: Uint8Array): number[] {
  return Array.from(u8);
}
function bufDepuis(bytes: number[]): ArrayBuffer {
  return Uint8Array.from(bytes).buffer;
}
function ascii(s: string): number[] {
  return Array.from(s).map((c) => c.charCodeAt(0));
}

function etape(lampes: Lampe[], dureeSecondes: number): Etape {
  return { id: "x", lampes, dureeSecondes };
}

describe("masque <-> lampes", () => {
  it("mappe les bits du firmware (vert=1, orange=2, rouge=4)", () => {
    expect(masqueDepuisLampes(["vert"])).toBe(0x01);
    expect(masqueDepuisLampes(["orange"])).toBe(0x02);
    expect(masqueDepuisLampes(["rouge"])).toBe(0x04);
    expect(masqueDepuisLampes(["eteint"])).toBe(0x00);
    expect(masqueDepuisLampes(["rouge", "orange"])).toBe(0x06);
    expect(masqueDepuisLampes(["vert", "orange", "rouge"])).toBe(0x07);
  });

  it("décode un masque en lampes (0 => eteint)", () => {
    expect(lampesDepuisMasque(0x00)).toEqual(["eteint"]);
    expect(lampesDepuisMasque(0x01)).toEqual(["vert"]);
    expect(lampesDepuisMasque(0x06)).toEqual(["orange", "rouge"]);
    expect(lampesDepuisMasque(0x07)).toEqual(["vert", "orange", "rouge"]);
  });
});

describe("durée <-> ms", () => {
  it("convertit secondes <-> ms", () => {
    expect(msDepuisSecondes(30)).toBe(30000);
    expect(msDepuisSecondes(3)).toBe(3000);
    expect(msDepuisSecondes(0.5)).toBe(500);
    expect(secondesDepuisMs(30000)).toBe(30);
    expect(secondesDepuisMs(500)).toBe(0.5);
  });
});

describe("encoderSet / encoderDelete", () => {
  // description.md montre set avec command_id 00, MAIS l'enum réel du firmware
  // est SET=1 (GET_MODES=0 a été préfixé). On encode donc 0x01.
  it("encode 'standard' avec le bon command_id (1, pas 0)", () => {
    const u8 = encoderSet("standard");
    expect(toArray(u8)).toEqual([
      CMD.SET_MODE, // 0x01 — corrigé vs description.md
      0x08,
      0x00,
      ...ascii("standard"),
    ]);
  });

  it("encode delete avec command_id 4", () => {
    const u8 = encoderDelete("standard");
    expect(toArray(u8)).toEqual([0x04, 0x08, 0x00, ...ascii("standard")]);
  });
});

describe("encoderAdd / encoderEdit", () => {
  // Corps identique à l'exemple add de description.md ("english", loop=1, 3 étapes),
  // mais command_id corrigé à 2 (ADD), 5 (EDIT).
  const mode: ModeAppareil = {
    name: "english",
    loop: true,
    etapes: [
      etape(["vert"], 30), // 30000 ms = 30 75 00 00
      etape(["orange"], 3), // 3000 ms  = b8 0b 00 00
      etape(["rouge"], 30), // 30000 ms = 30 75 00 00
    ],
  };

  const corpsAttendu = [
    0x07, 0x00, // name_len = 7
    ...ascii("english"),
    0x01, // loop
    0x03, 0x00, // nb_steps = 3
    0x01, 0x30, 0x75, 0x00, 0x00,
    0x02, 0xb8, 0x0b, 0x00, 0x00,
    0x04, 0x30, 0x75, 0x00, 0x00,
  ];

  it("encode add (command_id 2)", () => {
    expect(toArray(encoderAdd(mode))).toEqual([CMD.ADD_MODE, ...corpsAttendu]);
  });

  it("encode edit (command_id 5, même corps qu'add)", () => {
    expect(toArray(encoderEdit(mode))).toEqual([CMD.EDIT_MODE, ...corpsAttendu]);
  });
});

describe("decoderModes", () => {
  it("décode l'exemple à deux modes de description.md", () => {
    const octets = [
      0x02, 0x00, // count = 2
      // standard
      0x08, 0x00,
      ...ascii("standard"),
      0x01, // loop
      0x03, 0x00, // 3 étapes
      0x01, 0x30, 0x75, 0x00, 0x00, // vert 30000ms
      0x02, 0xb8, 0x0b, 0x00, 0x00, // orange 3000ms
      0x04, 0x30, 0x75, 0x00, 0x00, // rouge 30000ms
      // blinking_orange
      0x0f, 0x00,
      ...ascii("blinking_orange"),
      0x01,
      0x02, 0x00, // 2 étapes
      0x02, 0xf4, 0x01, 0x00, 0x00, // orange 500ms
      0x00, 0xf4, 0x01, 0x00, 0x00, // eteint 500ms
    ];

    const modes = decoderModes(bufDepuis(octets));
    expect(modes).toHaveLength(2);

    expect(modes[0].name).toBe("standard");
    expect(modes[0].loop).toBe(true);
    expect(modes[0].etapes.map((e) => e.lampes)).toEqual([
      ["vert"],
      ["orange"],
      ["rouge"],
    ]);
    expect(modes[0].etapes.map((e) => e.dureeSecondes)).toEqual([30, 3, 30]);

    expect(modes[1].name).toBe("blinking_orange");
    expect(modes[1].etapes.map((e) => e.lampes)).toEqual([
      ["orange"],
      ["eteint"],
    ]);
    expect(modes[1].etapes.map((e) => e.dureeSecondes)).toEqual([0.5, 0.5]);
  });

  it("gère un payload vide / zéro mode", () => {
    expect(decoderModes(bufDepuis([0x00, 0x00]))).toEqual([]);
    expect(decoderModes(bufDepuis([]))).toEqual([]);
  });

  it("round-trip add -> decode pour une étape multi-lampes", () => {
    const mode: ModeAppareil = {
      name: "mix",
      loop: false,
      etapes: [etape(["rouge", "orange"], 3), etape(["vert"], 3)],
    };
    const encode = encoderAdd(mode);
    // Retire le command_id (1er octet) et préfixe un count=1 pour réutiliser decoderModes.
    const corps = Array.from(encode).slice(1);
    const modes = decoderModes(bufDepuis([0x01, 0x00, ...corps]));
    expect(modes[0].name).toBe("mix");
    expect(modes[0].loop).toBe(false);
    expect(modes[0].etapes[0].lampes).toEqual(["orange", "rouge"]);
    expect(modes[0].etapes[1].lampes).toEqual(["vert"]);
  });
});

describe("decoderVersion", () => {
  it("décode [len u16][bytes]", () => {
    const v = "1.0.0 (5c5c56)";
    const octets = [v.length & 0xff, (v.length >> 8) & 0xff, ...ascii(v)];
    expect(decoderVersion(bufDepuis(octets))).toBe(v);
  });
});

describe("validation", () => {
  it("rejette un nom trop long", () => {
    expect(() => encoderSet("a".repeat(MAX_NAME_LEN + 1))).toThrow(
      ErreurProtocole
    );
  });

  it("rejette un nom vide", () => {
    expect(() => encoderSet("")).toThrow(ErreurProtocole);
  });

  it("compte les octets UTF-8, pas les caractères (accents)", () => {
    // "é" = 2 octets. On prend moins de MAX_NAME_LEN caractères mais assez
    // pour dépasser MAX_NAME_LEN octets : la validation doit compter les octets.
    const nbAccents = Math.floor(MAX_NAME_LEN / 2) + 1;
    expect(encoderUtf8("é")).toHaveLength(2);
    expect(nbAccents).toBeLessThanOrEqual(MAX_NAME_LEN);
    expect(() => encoderSet("é".repeat(nbAccents))).toThrow(ErreurProtocole);
  });

  it("rejette 0 ou > 10 étapes", () => {
    const base = (n: number): ModeAppareil => ({
      name: "x",
      loop: true,
      etapes: Array.from({ length: n }, () => etape(["vert"], 1)),
    });
    expect(() => encoderAdd(base(0))).toThrow(ErreurProtocole);
    expect(() => encoderAdd(base(11))).toThrow(ErreurProtocole);
    expect(() => encoderAdd(base(10))).not.toThrow();
  });
});
