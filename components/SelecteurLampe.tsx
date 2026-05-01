import React, { useState } from "react";
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
  selectionInitiale?: Lampe[];
  onValider: (lampes: Lampe[]) => void;
};

export default function SelecteurLampe({
  selectionInitiale = [],
  onValider,
}: Props) {
  const [selection, setSelection] = useState<Lampe[]>(selectionInitiale);

  const basculer = (lampe: Lampe) => {
    setSelection((prev) => {
      // Éteint est exclusif : on ne peut pas l'allumer avec autre chose
      if (lampe === "eteint") {
        return prev.includes("eteint") ? [] : ["eteint"];
      }
      // Sélectionner une couleur retire "eteint"
      const sansEteint = prev.filter((l) => l !== "eteint");
      if (sansEteint.includes(lampe)) {
        return sansEteint.filter((l) => l !== lampe);
      }
      return [...sansEteint, lampe];
    });
  };

  const peutValider = selection.length > 0;

  return (
    <View style={styles.conteneur} accessibilityLabel="Choisir une ou plusieurs lampes">
      <Text style={styles.aide}>
        Coche une ou plusieurs lampes qui s&apos;allumeront en même temps.
      </Text>

      <View style={styles.grille}>
        {LAMPES.map((lampe) => {
          const choisie = selection.includes(lampe);
          return (
            <TouchableOpacity
              key={lampe}
              onPress={() => basculer(lampe)}
              style={[styles.carte, choisie && styles.carteChoisie]}
              accessibilityLabel={`${labelLampe[lampe]}${choisie ? ", cochée" : ""}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: choisie }}
            >
              <View
                style={[
                  styles.pastille,
                  { backgroundColor: couleurPastille(lampe) },
                ]}
              />
              <Text style={styles.label}>{labelLampe[lampe]}</Text>
              <View style={[styles.coche, choisie && styles.cocheActive]}>
                {choisie && <Text style={styles.cocheTexte}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={() => onValider(selection)}
        disabled={!peutValider}
        style={[styles.btnValider, !peutValider && styles.btnValiderDesactive]}
        accessibilityLabel="Valider la sélection"
        accessibilityRole="button"
        accessibilityState={{ disabled: !peutValider }}
      >
        <Text style={styles.btnValiderTexte}>Valider</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { gap: espacements.md },
  aide: {
    ...typo.corpsSecondaire,
    textAlign: "center",
  },
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
  carteChoisie: {
    borderColor: couleurs.boutonFond,
    borderWidth: 2,
    backgroundColor: couleurs.surfaceSecondaire,
  },
  pastille: { width: 36, height: 36, borderRadius: 18 },
  label: { ...typo.titreMoyen },
  coche: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: couleurs.bordure,
    backgroundColor: couleurs.carte,
    alignItems: "center",
    justifyContent: "center",
  },
  cocheActive: {
    backgroundColor: couleurs.boutonFond,
    borderColor: couleurs.boutonFond,
  },
  cocheTexte: {
    color: couleurs.boutonTexte,
    fontSize: 14,
    fontWeight: "700",
  },
  btnValider: {
    minHeight: tactile.min,
    backgroundColor: couleurs.boutonFond,
    borderRadius: rayons.boutonStandard,
    alignItems: "center",
    justifyContent: "center",
  },
  btnValiderDesactive: {
    opacity: 0.4,
  },
  btnValiderTexte: { ...typo.bouton, color: couleurs.boutonTexte },
});
