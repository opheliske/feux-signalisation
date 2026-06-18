import { create } from "zustand";
import { LightState } from "../theme";

const initialState: LightState = {
  on: false,
  currentProgram: null,
  stepIndex: 0,
  paused: false,
  connection: "unknown",
  lastLaunchedProgramId: null,
  timerEnd: null,
  error: null,
};

type LightStore = {
  state: LightState;
  torchOn: boolean;
  setOn: (on: boolean) => void;
  setCurrentProgram: (id: string | null) => void;
  setStepIndex: (index: number) => void;
  setPaused: (paused: boolean) => void;
  setConnection: (connection: LightState["connection"]) => void;
  setLastLaunchedProgramId: (id: string | null) => void;
  setTimerEnd: (ts: number | null) => void;
  setError: (msg: string | null) => void;
  setTorchOn: (on: boolean) => void;
  reset: () => void;
};

export const useLightStore = create<LightStore>()((set) => ({
  state: initialState,
  torchOn: false,
  setOn: (on) =>
    set((s) => ({ state: { ...s.state, on } })),
  setCurrentProgram: (currentProgram) =>
    set((s) => ({ state: { ...s.state, currentProgram } })),
  setStepIndex: (stepIndex) =>
    set((s) => ({ state: { ...s.state, stepIndex } })),
  setPaused: (paused) =>
    set((s) => ({ state: { ...s.state, paused } })),
  setConnection: (connection) =>
    set((s) => ({ state: { ...s.state, connection } })),
  setLastLaunchedProgramId: (lastLaunchedProgramId) =>
    set((s) => ({ state: { ...s.state, lastLaunchedProgramId } })),
  setTimerEnd: (timerEnd) =>
    set((s) => ({ state: { ...s.state, timerEnd } })),
  setError: (error) =>
    set((s) => ({ state: { ...s.state, error } })),
  setTorchOn: (torchOn) => set({ torchOn }),
  reset: () => set((s) => ({ state: { ...initialState, connection: s.state.connection, lastLaunchedProgramId: s.state.lastLaunchedProgramId }, torchOn: false })),
}));
