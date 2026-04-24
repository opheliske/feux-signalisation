import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { couleurs, typo, espacements } from "../theme";

type Props = {
  onPress: () => void;
};

export default function BoutonStopGlobal({ onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.btn}
      accessibilityLabel="Arrêter tout immédiatement"
      accessibilityRole="button"
    >
      <Text style={styles.texte}>■  STOP</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: couleurs.stop,
    paddingVertical: espacements.md,
    paddingHorizontal: espacements.xl,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    shadowColor: couleurs.stop,
    shadowRadius: 8,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  texte: {
    ...typo.bouton,
    color: couleurs.stopTexte,
    fontSize: 18,
    letterSpacing: 1,
  },
});
