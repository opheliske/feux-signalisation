import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { EtatFeu, couleurs } from "../theme";

type Props = {
  connexion: EtatFeu["connexionFeu"];
};

const CONFIG: Record<EtatFeu["connexionFeu"], { dot: string; halo: string; label: string }> = {
  connecte: { dot: "#2BA84A", halo: "#7ACB2B33", label: "Feu connecté" },
  deconnecte: { dot: couleurs.bordureForte, halo: "#C9920033", label: "Feu non trouvé" },
  inconnu: { dot: "#888888", halo: "#88888833", label: "Connexion…" },
};

export default function PastilleConnexion({ connexion }: Props) {
  const { dot, halo, label } = CONFIG[connexion];
  return (
    <View style={styles.conteneur} accessibilityLabel={label}>
      <View style={[styles.halo, { backgroundColor: halo }]}>
        <View
          style={[
            styles.dot,
            { backgroundColor: dot },
            Platform.OS === "ios" && {
              shadowColor: dot,
              shadowRadius: 6,
              shadowOpacity: 1,
              shadowOffset: { width: 0, height: 0 },
            },
          ]}
        />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: couleurs.blanc,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 14,
    alignSelf: "center",
  },
  halo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: { fontSize: 13, fontWeight: "500", color: couleurs.textePrincipal },
});
