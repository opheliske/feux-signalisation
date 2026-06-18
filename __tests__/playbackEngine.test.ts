import {
  startProgram,
  pauseEngine,
  resumeEngine,
  stopEngine,
  isPaused,
  isActive,
} from "../services/playbackEngine";
import { Program, Light } from "../theme";

// The engine is a display engine: it no longer talks to the light (the hardware
// runs the sequence itself) and notifies the screen ONLY on a step change (no
// progress). We check the timing, the loop and the pause.

function createProgram(
  steps: Array<{ light?: Light; lights?: Light[]; duration: number }>
): Program {
  return {
    id: "test",
    name: "Test",
    pinned: false,
    runCount: 0,
    steps: steps.map((e, i) => ({
      id: `e${i}`,
      lights: e.lights ?? (e.light ? [e.light] : ["off"]),
      durationSeconds: e.duration,
    })),
    createdAt: 0,
    updatedAt: 0,
  };
}

describe("playbackEngine", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    stopEngine();
  });

  afterEach(() => {
    stopEngine();
    jest.useRealTimers();
  });

  test("starts at step 0 and notifies the preview", () => {
    const prog = createProgram([{ light: "green", duration: 2 }]);
    const onTick = jest.fn();
    startProgram(prog, onTick, jest.fn());

    expect(onTick).toHaveBeenCalledWith(0);
    expect(isActive()).toBe(true);
  });

  test("does not notify while the step does not change", () => {
    const prog = createProgram([{ light: "green", duration: 5 }]);
    const onTick = jest.fn();
    startProgram(prog, onTick, jest.fn());

    onTick.mockClear();
    jest.advanceTimersByTime(2000); // still in step 0
    expect(onTick).not.toHaveBeenCalled();
  });

  test("moves to the next step when the duration is reached", () => {
    const prog = createProgram([
      { light: "green", duration: 1 },
      { light: "red", duration: 1 },
    ]);
    const indices: number[] = [];
    startProgram(prog, (i) => indices.push(i), jest.fn());

    jest.advanceTimersByTime(1100);

    expect(indices).toContain(1);
  });

  test("loop: returns to step 0 after the last step", () => {
    const prog = createProgram([
      { light: "green", duration: 1 },
      { light: "orange", duration: 1 },
    ]);
    const indices: number[] = [];
    startProgram(prog, (i) => indices.push(i), jest.fn());

    jest.advanceTimersByTime(2500);

    const passes0 = indices.filter((i) => i === 0);
    expect(passes0.length).toBeGreaterThan(1);
  });

  test("pause freezes step progression", () => {
    const prog = createProgram([
      { light: "green", duration: 1 },
      { light: "red", duration: 1 },
    ]);
    const indices: number[] = [];
    startProgram(prog, (i) => indices.push(i), jest.fn());

    jest.advanceTimersByTime(500); // middle of step 0
    pauseEngine();
    expect(isPaused()).toBe(true);

    jest.advanceTimersByTime(3000); // would have changed step without the pause
    expect(indices).not.toContain(1);
  });

  test("resuming after pause continues the progression", () => {
    const prog = createProgram([
      { light: "green", duration: 1 },
      { light: "red", duration: 1 },
    ]);
    const indices: number[] = [];
    startProgram(prog, (i) => indices.push(i), jest.fn());

    jest.advanceTimersByTime(500);
    pauseEngine();
    jest.advanceTimersByTime(2000);
    expect(indices).not.toContain(1);

    resumeEngine();
    jest.advanceTimersByTime(600); // 500ms already elapsed → crosses the second
    expect(indices).toContain(1);
  });

  test("stop: disables the engine and resets isActive to false", () => {
    const prog = createProgram([{ light: "green", duration: 5 }]);
    startProgram(prog, jest.fn(), jest.fn());

    jest.advanceTimersByTime(500);
    stopEngine();

    expect(isActive()).toBe(false);
    expect(isPaused()).toBe(false);
  });

  test("stop: the timer does not continue after stop", () => {
    const prog = createProgram([
      { light: "green", duration: 1 },
      { light: "red", duration: 1 },
    ]);
    const onTick = jest.fn();
    startProgram(prog, onTick, jest.fn());

    stopEngine();
    const callsBefore = onTick.mock.calls.length;
    jest.advanceTimersByTime(3000);

    expect(onTick.mock.calls.length).toBe(callsBefore);
  });

  test("a program with no step does not start", () => {
    const prog = createProgram([]);
    startProgram(prog, jest.fn(), jest.fn());

    expect(isActive()).toBe(false);
  });
});
