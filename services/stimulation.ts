import { Light, Settings } from "../theme";
import { useLightStore } from "../stores/useLightStore";

// To enable sounds, drop audio files into assets/sons/:
//   assets/sons/green.mp3, orange.mp3, red.mp3, off.mp3
// then uncomment the require() lines below.

// const SOUNDS: Partial<Record<Light, number>> = {
//   green:  require("../assets/sons/green.mp3"),
//   orange: require("../assets/sons/orange.mp3"),
//   red:    require("../assets/sons/red.mp3"),
//   off:    require("../assets/sons/off.mp3"),
// };

export async function onStepChange(
  lights: Light[],
  settings: Settings
): Promise<void> {
  const mainLight: Light = lights.find((l) => l !== "off") ?? "off";

  if (settings.ledFlash) {
    // torchOn is read by the hidden CameraView in the mirror
    useLightStore.getState().setTorchOn(mainLight !== "off");
  }

  if (settings.sounds) {
    await _playSound(mainLight);
  }
}

export async function onStop(settings: Settings): Promise<void> {
  if (settings.ledFlash) {
    useLightStore.getState().setTorchOn(false);
  }
  if (settings.sounds) {
    await _playSound("off");
  }
}

async function _playSound(light: Light): Promise<void> {
  // const source = SOUNDS[light];
  // if (!source) return;
  // try {
  //   const { Audio } = await import("expo-av");
  //   const { sound } = await Audio.Sound.createAsync(source);
  //   await sound.playAsync();
  //   sound.setOnPlaybackStatusUpdate((s) => {
  //     if (s.isLoaded && s.didJustFinish) sound.unloadAsync();
  //   });
  // } catch (e) {
  //   console.warn("[stimulation] sound:", e);
  // }
  console.log(`[stimulation mock] sound → ${light}`);
}
