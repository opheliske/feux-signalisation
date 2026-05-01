import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StatusBar as RNStatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import { useFeuStore } from "../stores/useFeuStore";
import { useProgrammesStore } from "../stores/useProgrammesStore";
import { couleurFondMiroir, couleurs, Lampe } from "../theme";

const { width: W } = Dimensions.get("window");
const RAYON = W * 0.38;

export default function Miroir() {
  useKeepAwake();
  const router = useRouter();
  const { etat, torchAllume } = useFeuStore();
  const { programmes } = useProgrammesStore();

  const programme = etat.programmeEnCours
    ? programmes.find((p) => p.id === etat.programmeEnCours) ?? null
    : null;
  const etapeActuelle = programme
    ? (programme.etapes[etat.etapeIndex] ?? null)
    : null;
  const lampes: Lampe[] =
    etapeActuelle && etapeActuelle.lampes.length > 0
      ? etapeActuelle.lampes
      : ["eteint"];
  const lampePrincipale: Lampe =
    lampes.find((l) => l !== "eteint") ?? "eteint";
  const fondColor = couleurFondMiroir(lampePrincipale);

  const pulse = useRef(new Animated.Value(1)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    animRef.current?.stop();
    if (lampePrincipale === "eteint") {
      pulse.setValue(1);
      return;
    }
    animRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.18,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animRef.current.start();
    return () => animRef.current?.stop();
  }, [lampePrincipale, pulse]);

  return (
    <TouchableOpacity
      style={[styles.conteneur, { backgroundColor: fondColor }]}
      onPress={() => router.back()}
      activeOpacity={1}
      accessibilityLabel="Fermer le mode plein écran"
      accessibilityRole="button"
    >
      <RNStatusBar hidden />
      <View style={styles.pile}>
        {lampes.map((l) => {
          const couleurCercle =
            l !== "eteint" ? couleurs[l].allumee : "#444444";
          const taille = (RAYON * 2) / Math.max(1, lampes.length);
          return (
            <Animated.View
              key={l}
              style={[
                {
                  width: taille,
                  height: taille,
                  borderRadius: taille / 2,
                  opacity: 0.85,
                  backgroundColor: couleurCercle,
                  transform: [{ scale: pulse }],
                },
              ]}
            />
          );
        })}
      </View>
      {torchAllume && <TorchView />}
    </TouchableOpacity>
  );
}

function TorchView() {
  const [Cam, setCam] = React.useState<React.ComponentType<{
    style: object;
    enableTorch?: boolean;
  }> | null>(null);

  useEffect(() => {
    import("expo-camera")
      .then((m) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((m as any).CameraView) setCam(() => (m as any).CameraView);
      })
      .catch(() => {});
  }, []);

  if (!Cam) return null;
  return <Cam style={styles.cameraCache} enableTorch />;
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pile: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  cameraCache: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
});
