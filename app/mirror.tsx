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
import { useLightStore } from "../stores/useLightStore";
import { useProgramsStore } from "../stores/useProgramsStore";
import { mirrorBgColor, colors, Light } from "../theme";
import { useT } from "../i18n";

const { width: W } = Dimensions.get("window");
const RADIUS = W * 0.38;

export default function Mirror() {
  useKeepAwake();
  const t = useT();
  const router = useRouter();
  const { state, torchOn } = useLightStore();
  const { programs } = useProgramsStore();

  const program = state.currentProgram
    ? programs.find((p) => p.id === state.currentProgram) ?? null
    : null;
  const currentStep = program
    ? (program.steps[state.stepIndex] ?? null)
    : null;
  const lights: Light[] =
    currentStep && currentStep.lights.length > 0
      ? currentStep.lights
      : ["off"];
  const mainLight: Light = lights.find((l) => l !== "off") ?? "off";
  const bgColor = mirrorBgColor(mainLight);

  const pulse = useRef(new Animated.Value(1)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    animRef.current?.stop();
    if (mainLight === "off") {
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
  }, [mainLight, pulse]);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: bgColor }]}
      onPress={() => router.back()}
      activeOpacity={1}
      accessibilityLabel={t("mirror_close_a11y")}
      accessibilityRole="button"
    >
      <RNStatusBar hidden />
      <View style={styles.stack}>
        {lights.map((l) => {
          const circleColor =
            l !== "off" ? colors[l].on : "#444444";
          const size = (RADIUS * 2) / Math.max(1, lights.length);
          return (
            <Animated.View
              key={l}
              style={[
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  opacity: 0.85,
                  backgroundColor: circleColor,
                  transform: [{ scale: pulse }],
                },
              ]}
            />
          );
        })}
      </View>
      {torchOn && <TorchView />}
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
  return <Cam style={styles.hiddenCamera} enableTorch />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stack: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  hiddenCamera: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
});
