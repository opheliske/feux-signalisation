import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Lampe as LampeType,
  couleurLampe,
  labelLampe,
  couleurs,
  espacements,
  typo,
} from "../theme";

type Props = {
  lampe: LampeType;
  active?: boolean;
  taille?: number;
};

export default function Lampe({ lampe, active = false, taille = 32 }: Props) {
  const couleur = couleurLampe(lampe, active);
  return (
    <View
      style={styles.conteneur}
      accessibilityLabel={`Lampe ${labelLampe[lampe]}${active ? ", active" : ""}`}
    >
      <View
        style={[
          styles.pastille,
          {
            width: taille,
            height: taille,
            borderRadius: taille / 2,
            backgroundColor: couleur,
          },
          active && {
            shadowColor: couleur,
            shadowRadius: 10,
            shadowOpacity: 0.85,
            shadowOffset: { width: 0, height: 0 },
            elevation: 8,
          },
        ]}
      />
      <Text style={styles.mot}>{labelLampe[lampe]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { alignItems: "center", gap: espacements.xs },
  pastille: {},
  mot: { ...typo.corpsSecondaire, color: couleurs.textePrincipal },
});
