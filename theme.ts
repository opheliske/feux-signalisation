// ─── Types ────────────────────────────────────────────────────────────────────

export type Light = "green" | "orange" | "red" | "off";

export type Step = {
  id: string;
  lights: Light[]; // one or more lights lit at the same time
  durationSeconds: number; // 1..60
};

export type Program = {
  id: string;
  name: string;
  steps: Step[];
  pinned: boolean;
  runCount: number;
  lastRun?: number; // recency rank (ascending), 0 if never run
  createdAt: number;
  updatedAt: number;
};

export type LightState = {
  on: boolean;
  currentProgram: string | null;
  stepIndex: number;
  paused: boolean;
  connection: "connected" | "disconnected" | "unknown";
  lastLaunchedProgramId: string | null;
  timerEnd: number | null; // timestamp ms
  error: string | null;
};

export type Settings = {
  lightIp: string | null;
  vibrations: boolean;
  logoAnimation: boolean;
  sounds: boolean;
  ledFlash: boolean;
  autoFullscreen: boolean;
};

// ─── Colors ─────────────────────────────────────────────────────────────────

export const colors = {
  screenBg: "#FFD60A",
  secondarySurface: "#FFEA5A",
  card: "#FFFFFF",
  border: "#F2B600",
  borderStrong: "#C99200",
  textPrimary: "#1F1400",
  textSecondary: "#6B3D00",
  textSoft: "#8B5A10",
  buttonBg: "#1F1400",
  buttonText: "#FFD60A",
  stop: "#A32D2D",
  stopText: "#FFFFFF",
  gold: "#E8A814",
  highlight: "#FFF7D6",
  green: { on: "#7ACB2B", off: "#0E3A04" },
  orange: { on: "#FF9500", off: "#3D2A03" },
  red: { on: "#E24B4A", off: "#4A0E0E" },
  off: { on: "#888888", off: "#2A2A2A" },
  destructive: "#A32D2D",
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
  greenDot: "#2BA84A",
} as const;

// ─── Light helpers ────────────────────────────────────────────────────────────
// Displayed light labels (lightLabel/lightsLabel) live in i18n/, since they
// produce translated text.

export function lightColor(light: Light, active: boolean): string {
  return active ? colors[light].on : colors[light].off;
}

export function dotColor(light: Light): string {
  return colors[light].on;
}

export function mirrorBgColor(light: Light): string {
  const map: Record<Light, string> = {
    green: "#0A2E00",
    orange: "#3D1A00",
    red: "#3D0000",
    off: "#0A0A0A",
  };
  return map[light];
}

// Formats a duration (in seconds, possibly fractional) in s or min.
// Durations come from the light in milliseconds; we show them in seconds
// (e.g. 0.5 s) or in minutes beyond 60 s (e.g. 1 min 30 s).
export function formatDuration(seconds: number): string {
  if (seconds >= 60) {
    const min = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return s === 0 ? `${min} min` : `${min} min ${s} s`;
  }
  const rounded = Math.round(seconds * 10) / 10;
  return `${rounded} s`;
}

export function cycleTotalDuration(steps: Step[]): number {
  return steps.reduce((acc, s) => acc + s.durationSeconds, 0);
}

// ─── Radii ───────────────────────────────────────────────────────────────────

export const radii = {
  card: 12,
  cardLarge: 14,
  container: 28,
  playButton: 9999,
  standardButton: 10,
  dot: 9999,
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const typo = {
  titleLarge: { fontSize: 24, fontWeight: "500" as const, color: colors.textPrimary },
  title: { fontSize: 20, fontWeight: "500" as const, color: colors.textPrimary },
  titleMedium: { fontSize: 17, fontWeight: "500" as const, color: colors.textPrimary },
  body: { fontSize: 16, fontWeight: "400" as const, color: colors.textPrimary },
  bodySecondary: { fontSize: 14, fontWeight: "400" as const, color: colors.textSecondary },
  button: { fontSize: 16, fontWeight: "500" as const },
  small: { fontSize: 12, fontWeight: "400" as const, color: colors.textSecondary },
} as const;

// ─── Touch & animation ─────────────────────────────────────────────────────

export const touch = {
  min: 56,
  playButton: 64,
  logoSize: 54,
} as const;

export const animation = {
  discoBallRotation: 20000,
  programBallRotation: 4000,
  explosionRotation: 1500,
} as const;
