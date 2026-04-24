import { Lampe, Reglages } from "../theme";
import { useFeuStore } from "../stores/useFeuStore";

// Pour activer les sons, place des fichiers audio dans assets/sons/ :
//   assets/sons/vert.mp3, orange.mp3, rouge.mp3, eteint.mp3
// puis décommente les lignes require() ci-dessous.

// const SONS: Partial<Record<Lampe, number>> = {
//   vert:   require("../assets/sons/vert.mp3"),
//   orange: require("../assets/sons/orange.mp3"),
//   rouge:  require("../assets/sons/rouge.mp3"),
//   eteint: require("../assets/sons/eteint.mp3"),
// };

export async function surChangementEtape(
  lampe: Lampe,
  reglages: Reglages
): Promise<void> {
  if (reglages.ledFlash) {
    // torchAllume est lu par le CameraView caché dans le miroir
    useFeuStore.getState().setTorchAllume(lampe !== "eteint");
  }

  if (reglages.sons) {
    await _jouerSon(lampe);
  }
}

export async function surArret(reglages: Reglages): Promise<void> {
  if (reglages.ledFlash) {
    useFeuStore.getState().setTorchAllume(false);
  }
  if (reglages.sons) {
    await _jouerSon("eteint");
  }
}

async function _jouerSon(lampe: Lampe): Promise<void> {
  // const source = SONS[lampe];
  // if (!source) return;
  // try {
  //   const { Audio } = await import("expo-av");
  //   const { sound } = await Audio.Sound.createAsync(source);
  //   await sound.playAsync();
  //   sound.setOnPlaybackStatusUpdate((s) => {
  //     if (s.isLoaded && s.didJustFinish) sound.unloadAsync();
  //   });
  // } catch (e) {
  //   console.warn("[stimulation] son:", e);
  // }
  console.log(`[stimulation mock] son → ${lampe}`);
}
