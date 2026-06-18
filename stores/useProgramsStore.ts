import { create } from "zustand";
import { Program } from "../theme";
import {
  DeviceMode,
  encodeUtf8,
  MAX_NAME_LEN,
} from "../services/protocol";
import {
  addMode,
  deleteMode,
  editMode,
  getActiveMode,
  getModes,
  getVersion,
  setMode,
  MODE_OFF,
} from "../services/light";

// Run counters, local and ephemeral (the firmware does not store them).
// Kept between refreshes, indexed by mode name.
const _runCounts = new Map<string, number>();
// Recency rank: each run is assigned an increasing number, which lets us sort
// from most recently run to oldest.
const _lastRun = new Map<string, number>();
let _runRank = 0;

function toProgram(m: DeviceMode): Program {
  return {
    id: m.name,
    name: m.name,
    steps: m.steps,
    pinned: false,
    runCount: _runCounts.get(m.name) ?? 0,
    lastRun: _lastRun.get(m.name) ?? 0,
    createdAt: 0,
    updatedAt: 0,
  };
}

function byteCount(s: string): number {
  return encodeUtf8(s).length;
}

// Builds a unique copy name that fits within MAX_NAME_LEN bytes.
function copyName(base: string, existing: Set<string>): string {
  for (let i = 2; i < 1000; i++) {
    const suffix = `_${i}`;
    let root = base;
    // Shrink the root until root+suffix fits within the limit.
    while (byteCount(root + suffix) > MAX_NAME_LEN && root.length > 0) {
      root = root.slice(0, -1);
    }
    const candidate = root + suffix;
    if (!existing.has(candidate)) return candidate;
  }
  return base.slice(0, MAX_NAME_LEN);
}

type ProgramsStore = {
  programs: Program[];
  loading: boolean;
  error: string | null;
  version: string | null;
  activeMode: string | null;

  load: () => Promise<void>;
  loadVersion: () => Promise<void>;
  loadActiveMode: () => Promise<void>;
  setActiveMode: (name: string | null) => void;
  launch: (name: string) => Promise<void>;
  create: (mode: DeviceMode) => Promise<void>;
  update: (oldName: string, mode: DeviceMode) => Promise<void>;
  remove: (name: string) => Promise<void>;
  duplicate: (name: string) => Promise<void>;
  incrementRunCount: (name: string) => void;
};

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return "I can't reach the light.";
}

export const useProgramsStore = create<ProgramsStore>()((set, get) => ({
  programs: [],
  loading: false,
  error: null,
  version: null,
  activeMode: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const modes = await getModes();
      // The OFF mode is a technical mode (stop): we don't display it.
      set({
        programs: modes
          .filter((m) => m.name !== MODE_OFF)
          .map(toProgram),
        loading: false,
      });
      await get().loadActiveMode();
    } catch (e) {
      set({ loading: false, error: errorMessage(e) });
    }
  },

  loadVersion: async () => {
    try {
      const v = await getVersion();
      set({ version: v });
    } catch {
      set({ version: null });
    }
  },

  loadActiveMode: async () => {
    try {
      set({ activeMode: await getActiveMode() });
    } catch {
      set({ activeMode: null });
    }
  },

  setActiveMode: (name) => set({ activeMode: name }),

  launch: async (name) => {
    try {
      await setMode(name);
      set({ error: null, activeMode: name });
    } catch (e) {
      set({ error: errorMessage(e) });
    }
  },

  create: async (mode) => {
    await addMode(mode);
    await get().load();
  },

  update: async (oldName, mode) => {
    if (mode.name === oldName) {
      await editMode(mode);
    } else {
      // The firmware identifies a mode by its name: a rename = delete + add.
      await addMode(mode);
      await deleteMode(oldName);
    }
    await get().load();
  },

  remove: async (name) => {
    try {
      await deleteMode(name);
      _runCounts.delete(name);
      await get().load();
    } catch (e) {
      set({ error: errorMessage(e) });
    }
  },

  duplicate: async (name) => {
    const source = get().programs.find((p) => p.name === name);
    if (!source) return;
    const existing = new Set(get().programs.map((p) => p.name));
    const copy: DeviceMode = {
      name: copyName(source.name, existing),
      loop: true,
      steps: source.steps.map((s) => ({ ...s })),
    };
    try {
      await addMode(copy);
      await get().load();
    } catch (e) {
      set({ error: errorMessage(e) });
    }
  },

  incrementRunCount: (name) => {
    _runCounts.set(name, (_runCounts.get(name) ?? 0) + 1);
    _lastRun.set(name, ++_runRank);
    set((s) => ({
      programs: s.programs.map((p) =>
        p.name === name
          ? {
              ...p,
              runCount: _runCounts.get(name) ?? 0,
              lastRun: _lastRun.get(name) ?? 0,
            }
          : p
      ),
    }));
  },
}));
