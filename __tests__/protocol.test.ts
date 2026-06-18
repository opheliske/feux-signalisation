import {
  CMD,
  encodeSet,
  encodeDelete,
  encodeAdd,
  encodeEdit,
  decodeModes,
  decodeVersion,
  maskFromLights,
  lightsFromMask,
  msFromSeconds,
  secondsFromMs,
  encodeUtf8,
  ProtocolError,
  DeviceMode,
  MAX_NAME_LEN,
} from "../services/protocol";
import { Step, Light } from "../theme";

// Small test helpers
function hex(...bytes: number[]): Uint8Array {
  return Uint8Array.from(bytes);
}
function toArray(u8: Uint8Array): number[] {
  return Array.from(u8);
}
function bufFrom(bytes: number[]): ArrayBuffer {
  return Uint8Array.from(bytes).buffer;
}
function ascii(s: string): number[] {
  return Array.from(s).map((c) => c.charCodeAt(0));
}

function step(lights: Light[], durationSeconds: number): Step {
  return { id: "x", lights, durationSeconds };
}

describe("mask <-> lights", () => {
  it("maps the firmware bits (green=1, orange=2, red=4)", () => {
    expect(maskFromLights(["green"])).toBe(0x01);
    expect(maskFromLights(["orange"])).toBe(0x02);
    expect(maskFromLights(["red"])).toBe(0x04);
    expect(maskFromLights(["off"])).toBe(0x00);
    expect(maskFromLights(["red", "orange"])).toBe(0x06);
    expect(maskFromLights(["green", "orange", "red"])).toBe(0x07);
  });

  it("decodes a mask into lights (0 => off)", () => {
    expect(lightsFromMask(0x00)).toEqual(["off"]);
    expect(lightsFromMask(0x01)).toEqual(["green"]);
    expect(lightsFromMask(0x06)).toEqual(["orange", "red"]);
    expect(lightsFromMask(0x07)).toEqual(["green", "orange", "red"]);
  });
});

describe("duration <-> ms", () => {
  it("converts seconds <-> ms", () => {
    expect(msFromSeconds(30)).toBe(30000);
    expect(msFromSeconds(3)).toBe(3000);
    expect(msFromSeconds(0.5)).toBe(500);
    expect(secondsFromMs(30000)).toBe(30);
    expect(secondsFromMs(500)).toBe(0.5);
  });
});

describe("encodeSet / encodeDelete", () => {
  // description.md shows set with command_id 00, BUT the real firmware enum
  // is SET=1 (GET_MODES=0 was prefixed). So we encode 0x01.
  it("encodes 'standard' with the right command_id (1, not 0)", () => {
    const u8 = encodeSet("standard");
    expect(toArray(u8)).toEqual([
      CMD.SET_MODE, // 0x01 — corrected vs description.md
      0x08,
      0x00,
      ...ascii("standard"),
    ]);
  });

  it("encodes delete with command_id 4", () => {
    const u8 = encodeDelete("standard");
    expect(toArray(u8)).toEqual([0x04, 0x08, 0x00, ...ascii("standard")]);
  });
});

describe("encodeAdd / encodeEdit", () => {
  // Body identical to description.md's add example ("english", loop=1, 3 steps),
  // but command_id corrected to 2 (ADD), 5 (EDIT).
  const mode: DeviceMode = {
    name: "english",
    loop: true,
    steps: [
      step(["green"], 30), // 30000 ms = 30 75 00 00
      step(["orange"], 3), // 3000 ms  = b8 0b 00 00
      step(["red"], 30), // 30000 ms = 30 75 00 00
    ],
  };

  const expectedBody = [
    0x07, 0x00, // name_len = 7
    ...ascii("english"),
    0x01, // loop
    0x03, 0x00, // nb_steps = 3
    0x01, 0x30, 0x75, 0x00, 0x00,
    0x02, 0xb8, 0x0b, 0x00, 0x00,
    0x04, 0x30, 0x75, 0x00, 0x00,
  ];

  it("encodes add (command_id 2)", () => {
    expect(toArray(encodeAdd(mode))).toEqual([CMD.ADD_MODE, ...expectedBody]);
  });

  it("encodes edit (command_id 5, same body as add)", () => {
    expect(toArray(encodeEdit(mode))).toEqual([CMD.EDIT_MODE, ...expectedBody]);
  });
});

describe("decodeModes", () => {
  it("decodes description.md's two-mode example", () => {
    const bytes = [
      0x02, 0x00, // count = 2
      // standard
      0x08, 0x00,
      ...ascii("standard"),
      0x01, // loop
      0x03, 0x00, // 3 steps
      0x01, 0x30, 0x75, 0x00, 0x00, // green 30000ms
      0x02, 0xb8, 0x0b, 0x00, 0x00, // orange 3000ms
      0x04, 0x30, 0x75, 0x00, 0x00, // red 30000ms
      // blinking_orange
      0x0f, 0x00,
      ...ascii("blinking_orange"),
      0x01,
      0x02, 0x00, // 2 steps
      0x02, 0xf4, 0x01, 0x00, 0x00, // orange 500ms
      0x00, 0xf4, 0x01, 0x00, 0x00, // off 500ms
    ];

    const modes = decodeModes(bufFrom(bytes));
    expect(modes).toHaveLength(2);

    expect(modes[0].name).toBe("standard");
    expect(modes[0].loop).toBe(true);
    expect(modes[0].steps.map((s) => s.lights)).toEqual([
      ["green"],
      ["orange"],
      ["red"],
    ]);
    expect(modes[0].steps.map((s) => s.durationSeconds)).toEqual([30, 3, 30]);

    expect(modes[1].name).toBe("blinking_orange");
    expect(modes[1].steps.map((s) => s.lights)).toEqual([
      ["orange"],
      ["off"],
    ]);
    expect(modes[1].steps.map((s) => s.durationSeconds)).toEqual([0.5, 0.5]);
  });

  it("handles an empty payload / zero modes", () => {
    expect(decodeModes(bufFrom([0x00, 0x00]))).toEqual([]);
    expect(decodeModes(bufFrom([]))).toEqual([]);
  });

  it("round-trips add -> decode for a multi-light step", () => {
    const mode: DeviceMode = {
      name: "mix",
      loop: false,
      steps: [step(["red", "orange"], 3), step(["green"], 3)],
    };
    const encoded = encodeAdd(mode);
    // Drop the command_id (1st byte) and prefix a count=1 to reuse decodeModes.
    const body = Array.from(encoded).slice(1);
    const modes = decodeModes(bufFrom([0x01, 0x00, ...body]));
    expect(modes[0].name).toBe("mix");
    expect(modes[0].loop).toBe(false);
    expect(modes[0].steps[0].lights).toEqual(["orange", "red"]);
    expect(modes[0].steps[1].lights).toEqual(["green"]);
  });
});

describe("decodeVersion", () => {
  it("decodes [len u16][bytes]", () => {
    const v = "1.0.0 (5c5c56)";
    const bytes = [v.length & 0xff, (v.length >> 8) & 0xff, ...ascii(v)];
    expect(decodeVersion(bufFrom(bytes))).toBe(v);
  });
});

describe("validation", () => {
  it("rejects a name that is too long", () => {
    expect(() => encodeSet("a".repeat(MAX_NAME_LEN + 1))).toThrow(
      ProtocolError
    );
  });

  it("rejects an empty name", () => {
    expect(() => encodeSet("")).toThrow(ProtocolError);
  });

  it("counts UTF-8 bytes, not characters (accents)", () => {
    // "é" = 2 bytes. We take fewer than MAX_NAME_LEN characters but enough
    // to exceed MAX_NAME_LEN bytes: validation must count bytes.
    const accentCount = Math.floor(MAX_NAME_LEN / 2) + 1;
    expect(encodeUtf8("é")).toHaveLength(2);
    expect(accentCount).toBeLessThanOrEqual(MAX_NAME_LEN);
    expect(() => encodeSet("é".repeat(accentCount))).toThrow(ProtocolError);
  });

  it("rejects 0 or > 10 steps", () => {
    const base = (n: number): DeviceMode => ({
      name: "x",
      loop: true,
      steps: Array.from({ length: n }, () => step(["green"], 1)),
    });
    expect(() => encodeAdd(base(0))).toThrow(ProtocolError);
    expect(() => encodeAdd(base(11))).toThrow(ProtocolError);
    expect(() => encodeAdd(base(10))).not.toThrow();
  });
});
