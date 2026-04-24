import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { couleurs, espacements, typo, tactile, rayons } from "../theme";

type Props = {
  valeur: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
};

export default function SelecteurDuree({
  valeur,
  onChange,
  min = 1,
  max = 60,
}: Props) {
  return (
    <View
      style={styles.conteneur}
      accessibilityLabel={`Durée : ${valeur} secondes`}
    >
      <TouchableOpacity
        onPress={() => onChange(Math.max(min, valeur - 1))}
        disabled={valeur <= min}
        style={[styles.btn, valeur <= min && styles.btnDesactive]}
        accessibilityLabel="Diminuer la durée d'une seconde"
        accessibilityRole="button"
      >
        <Text style={styles.btnTexte}>–</Text>
      </TouchableOpacity>

      <View style={styles.valeurConteneur}>
        <Text style={styles.valeur}>{valeur}</Text>
        <Text style={styles.unite}>s</Text>
      </View>

      <TouchableOpacity
        onPress={() => onChange(Math.min(max, valeur + 1))}
        disabled={valeur >= max}
        style={[styles.btn, valeur >= max && styles.btnDesactive]}
        accessibilityLabel="Augmenter la durée d'une seconde"
        accessibilityRole="button"
      >
        <Text style={styles.btnTexte}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: espacements.lg,
  },
  btn: {
    width: tactile.min,
    height: tactile.min,
    borderRadius: rayons.boutonStandard,
    backgroundColor: couleurs.boutonFond,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDesactive: { opacity: 0.3 },
  btnTexte: {
    fontSize: 28,
    color: couleurs.boutonTexte,
    fontWeight: "500",
    lineHeight: 32,
  },
  valeurConteneur: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    minWidth: 80,
    justifyContent: "center",
  },
  valeur: {
    fontSize: 52,
    fontWeight: "500",
    color: couleurs.textePrincipal,
    lineHeight: 60,
  },
  unite: { ...typo.titre, color: couleurs.texteSecondaire },
});
