import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";

export type ConfettiRef = { launch: () => void };

const { width: W, height: H } = Dimensions.get("window");
const COUNT = 50;
const COLORS = ["#FFD60A", "#FFEA5A", "#FF9500", "#F2B600", "#FFF176", "#E8A814"];
const DURATION = 1600;

type Particle = {
  x: Animated.Value;
  y: Animated.Value;
  rot: Animated.Value;
  op: Animated.Value;
  sc: Animated.Value;
  color: string;
  size: number;
  startX: number;
};

function createParticles(): Particle[] {
  return Array.from({ length: COUNT }, () => ({
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    rot: new Animated.Value(0),
    op: new Animated.Value(0),
    sc: new Animated.Value(0),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 8 + Math.random() * 8,
    startX: Math.random() * W,
  }));
}

const Confetti = forwardRef<ConfettiRef, object>((_, ref) => {
  const [visible, setVisible] = useState(false);
  const particles = useRef<Particle[]>(createParticles()).current;

  useImperativeHandle(ref, () => ({
    launch: () => {
      // Reset
      particles.forEach((p) => {
        p.x.setValue(0);
        p.y.setValue(0);
        p.rot.setValue(0);
        p.op.setValue(0);
        p.sc.setValue(0);
      });

      setVisible(true);

      const anims = particles.map((p) => {
        const destX = (Math.random() - 0.5) * W * 0.8;
        const destY = H * 0.5 + Math.random() * H * 0.4;
        const delay = Math.random() * 300;
        return Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(p.sc, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(p.op, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.timing(p.x, { toValue: destX, duration: DURATION - delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(p.y, { toValue: destY, duration: DURATION - delay, easing: Easing.in(Easing.quad), useNativeDriver: true }),
            Animated.timing(p.rot, { toValue: 4 + Math.random() * 4, duration: DURATION - delay, easing: Easing.linear, useNativeDriver: true }),
            Animated.sequence([
              Animated.delay(DURATION - delay - 400),
              Animated.timing(p.op, { toValue: 0, duration: 400, useNativeDriver: true }),
            ]),
          ]),
        ]);
      });

      Animated.parallel(anims).start(() => setVisible(false));
    },
  }));

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => {
        const rotate = p.rot.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.confetti,
              {
                left: p.startX,
                top: H * 0.15,
                width: p.size,
                height: p.size * 0.6,
                backgroundColor: p.color,
                opacity: p.op,
                transform: [
                  { translateX: p.x },
                  { translateY: p.y },
                  { rotate },
                  { scale: p.sc },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
});

Confetti.displayName = "Confetti";
export default Confetti;

const styles = StyleSheet.create({
  confetti: { position: "absolute", borderRadius: 2 },
});
