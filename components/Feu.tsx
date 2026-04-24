import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { Lampe as LampeType, couleurLampe, couleurs, espacements } from "../theme";

type Props = {
  lampActive: LampeType | null;
  taille?: number;
};

const LAMPES: LampeType[] = ["rouge", "orange", "vert"];

function LampeAvecHalo({ lampe, active, taille }: { lampe: LampeType; active: boolean; taille: number }) {
  const haloOpacity = useRef(new Animated.Value(0)).current;
  const haloAnim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    haloAnim.current?.stop();
    if (active) {
      haloOpacity.setValue(0.4);
      haloAnim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(haloOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(haloOpacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        ])
      );
      haloAnim.current.start();
    } else {
      haloOpacity.setValue(0);
    }
    return () => haloAnim.current?.stop();
  }, [active, haloOpacity]);

  const couleur = couleurLampe(lampe, active);
  const rayon = taille / 2;

  return (
    <View style={{ width: taille + 20, height: taille + 20, alignItems: "center", justifyContent: "center" }}>
      {active && (
        <Animated.View
          style={{
            position: "absolute",
            width: taille + 20,
            height: taille + 20,
            borderRadius: (taille + 20) / 2,
            backgroundColor: couleur,
            opacity: haloOpacity,
          }}
        />
      )}
      <View
        style={{
          width: taille,
          height: taille,
          borderRadius: rayon,
          backgroundColor: couleur,
        }}
        accessibilityLabel={`Lampe ${lampe}${active ? " active" : ""}`}
      />
    </View>
  );
}

export default function Feu({ lampActive, taille = 44 }: Props) {
  return (
    <View style={styles.boitier} accessibilityLabel="Feu de signalisation">
      {LAMPES.map((lampe) => (
        <LampeAvecHalo
          key={lampe}
          lampe={lampe}
          active={lampActive === lampe}
          taille={taille}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  boitier: {
    backgroundColor: couleurs.textePrincipal,
    borderRadius: 14,
    paddingHorizontal: espacements.sm,
    paddingVertical: espacements.xs,
    alignItems: "center",
    alignSelf: "center",
  },
});
