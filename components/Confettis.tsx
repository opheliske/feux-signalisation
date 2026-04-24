import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";

export type ConfettisRef = { lancer: () => void };

const { width: W, height: H } = Dimensions.get("window");
const NB = 50;
const COULEURS = ["#FFD60A", "#FFEA5A", "#FF9500", "#F2B600", "#FFF176", "#E8A814"];
const DUREE = 1600;

type Particule = {
  x: Animated.Value;
  y: Animated.Value;
  rot: Animated.Value;
  op: Animated.Value;
  sc: Animated.Value;
  couleur: string;
  taille: number;
  startX: number;
};

function creerParticules(): Particule[] {
  return Array.from({ length: NB }, () => ({
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    rot: new Animated.Value(0),
    op: new Animated.Value(0),
    sc: new Animated.Value(0),
    couleur: COULEURS[Math.floor(Math.random() * COULEURS.length)],
    taille: 8 + Math.random() * 8,
    startX: Math.random() * W,
  }));
}

const Confettis = forwardRef<ConfettisRef, object>((_, ref) => {
  const [visible, setVisible] = useState(false);
  const particules = useRef<Particule[]>(creerParticules()).current;

  useImperativeHandle(ref, () => ({
    lancer: () => {
      // Réinitialiser
      particules.forEach((p) => {
        p.x.setValue(0);
        p.y.setValue(0);
        p.rot.setValue(0);
        p.op.setValue(0);
        p.sc.setValue(0);
      });

      setVisible(true);

      const anims = particules.map((p) => {
        const destX = (Math.random() - 0.5) * W * 0.8;
        const destY = H * 0.5 + Math.random() * H * 0.4;
        const delay = Math.random() * 300;
        return Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(p.sc, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(p.op, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.timing(p.x, { toValue: destX, duration: DUREE - delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(p.y, { toValue: destY, duration: DUREE - delay, easing: Easing.in(Easing.quad), useNativeDriver: true }),
            Animated.timing(p.rot, { toValue: 4 + Math.random() * 4, duration: DUREE - delay, easing: Easing.linear, useNativeDriver: true }),
            Animated.sequence([
              Animated.delay(DUREE - delay - 400),
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
      {particules.map((p, i) => {
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
                width: p.taille,
                height: p.taille * 0.6,
                backgroundColor: p.couleur,
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

Confettis.displayName = "Confettis";
export default Confettis;

const styles = StyleSheet.create({
  confetti: { position: "absolute", borderRadius: 2 },
});
