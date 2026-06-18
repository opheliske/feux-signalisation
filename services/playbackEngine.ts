import { Program } from "../theme";
import { onStepChange, onStop as stimulateStop } from "./stimulation";
import { useLightStore } from "../stores/useLightStore";
import { useSettingsStore } from "../stores/useSettingsStore";

// Display engine only: the light executes the active mode's sequence itself
// (`set` command). This engine ONLY tracks the current step to drive the disco
// ball color / mirror and local feedback. It notifies the screen ONLY on a step
// change (no progress: there is no progress bar, and re-rendering every 100 ms
// slows the app down).

const INTERVAL_MS = 100;

type OnTick = (stepIndex: number) => void;
type OnStop = () => void;

type EngineState = {
  program: Program;
  stepIndex: number;
  progressMs: number;
  paused: boolean;
  interval: ReturnType<typeof setInterval> | null;
  onTick: OnTick;
  onStop: OnStop;
};

let _state: EngineState | null = null;

export function startProgram(
  program: Program,
  onTick: OnTick,
  onStop: OnStop
): void {
  stopEngine();
  if (program.steps.length === 0) return;

  _state = {
    program,
    stepIndex: 0,
    progressMs: 0,
    paused: false,
    interval: null,
    onTick,
    onStop,
  };

  const settings = useSettingsStore.getState().settings;
  onStepChange(program.steps[0].lights, settings);
  onTick(0);
  _state.interval = setInterval(_tick, INTERVAL_MS);
}

function _tick(): void {
  if (!_state || _state.paused) return;

  // Check the timer
  const { timerEnd } = useLightStore.getState().state;
  if (timerEnd !== null && Date.now() >= timerEnd) {
    stopEngine();
    useLightStore.getState().setTimerEnd(null);
    useLightStore.getState().setCurrentProgram(null);
    return;
  }

  _state.progressMs += INTERVAL_MS;
  const step = _state.program.steps[_state.stepIndex];
  const totalDurationMs = step.durationSeconds * 1000;

  // We only notify when moving from one step to the next.
  if (_state.progressMs >= totalDurationMs) {
    _state.stepIndex =
      (_state.stepIndex + 1) % _state.program.steps.length;
    _state.progressMs = 0;
    const newStep = _state.program.steps[_state.stepIndex];
    const settings = useSettingsStore.getState().settings;
    onStepChange(newStep.lights, settings);
    _state.onTick(_state.stepIndex);
  }
}

export function pauseEngine(): void {
  if (_state) _state.paused = true;
}

export function resumeEngine(): void {
  if (_state) _state.paused = false;
}

export function stopEngine(): void {
  if (_state?.interval) clearInterval(_state.interval);
  const settings = useSettingsStore.getState()?.settings;
  if (settings) stimulateStop(settings).catch(() => {});
  _state = null;
}

export function isPaused(): boolean {
  return _state?.paused ?? false;
}

export function isActive(): boolean {
  return _state !== null;
}
