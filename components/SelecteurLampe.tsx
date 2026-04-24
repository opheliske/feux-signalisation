import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  Lampe,
  labelLampe,
  couleurPastille,
  couleurs,
  rayons,
  espacements,
  typo,
  tactile,
} from "../theme";

const LAMPES: Lampe[] = ["vert", "orange", "rouge", "eteint"];

type Props = {
  onChoisir: (lampe: Lampe) => void;
};

export default function SelecteurLampe({ onChoisir }: Props) {
  return (
    <View style={styles.grille} accessibilityLabel="Choisir une lampe">
      {LAMPES.map((lampe) => (
        <TouchableOpacity
          key={lampe}
          onPress={() => onChoisir(lampe)}
          style={styles.carte}
          accessibilityLabel={`Choisir ${labelLampe[lampe]}`}
          accessibilityRole="button"
        >
          <View
            style={[
              styles.pastille,
              { backgroundColor: couleurPastille(lampe) },
            ]}
          />
          <Text style={styles.label}>{labelLampe[lampe]}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grille: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espacements.sm,
  },
  carte: {
    width: "48%",
    minHeight: tactile.min + 16,
    backgroundColor: couleurs.carte,
    borderRadius: rayons.carte,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    alignItems: "center",
    justifyContent: "center",
    gap: espacements.xs,
    padding: espacements.sm,
  },
  pastille: { width: 36, height: 36, borderRadius: 18 },
  label: { ...typo.titreMoyen },
});
