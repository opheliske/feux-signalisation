import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
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
  min = 0.1,
  max = 60,
}: Props) {
  const [edition, setEdition] = useState(false);
  const [texte, setTexte] = useState("");

  const ouvrirSaisie = () => {
    setTexte(String(valeur));
    setEdition(true);
  };

  // Arrondi au millième (le feu travaille à la milliseconde) pour éviter les
  // imprécisions de virgule flottante (0.9 - 0.1, etc.).
  const arrondir = (v: number) => Math.round(v * 1000) / 1000;

  // Pas variable : 0,1 s sous la seconde, 1 s à partir de 1 s.
  const decrementer = () => {
    const pas = valeur <= 1 ? 0.1 : 1;
    onChange(arrondir(Math.max(min, valeur - pas)));
  };
  const incrementer = () => {
    const pas = valeur < 1 ? 0.1 : 1;
    onChange(arrondir(Math.min(max, valeur + pas)));
  };

  // Saisie manuelle : accepte les décimales (ex. « 0.200 » → 0,2 s = 200 ms).
  const saisir = (t: string) => {
    setTexte(t);
    const n = parseFloat(t.replace(",", "."));
    if (!isNaN(n)) {
      onChange(arrondir(Math.min(max, Math.max(min, n))));
    }
  };

  return (
    <View
      style={styles.conteneur}
      accessibilityLabel={`Durée : ${valeur} secondes`}
    >
      <TouchableOpacity
        onPress={decrementer}
        disabled={valeur <= min}
        style={[styles.btn, valeur <= min && styles.btnDesactive]}
        accessibilityLabel="Diminuer la durée"
        accessibilityRole="button"
      >
        <Text style={styles.btnTexte}>–</Text>
      </TouchableOpacity>

      <View style={styles.valeurConteneur}>
        {edition ? (
          <TextInput
            value={texte}
            onChangeText={saisir}
            onSubmitEditing={() => setEdition(false)}
            onBlur={() => setEdition(false)}
            keyboardType="decimal-pad"
            autoFocus
            selectTextOnFocus
            returnKeyType="done"
            style={styles.valeurInput}
            accessibilityLabel="Saisir la durée en secondes"
          />
        ) : (
          <TouchableOpacity
            onPress={ouvrirSaisie}
            accessibilityLabel="Saisir la durée à la main"
            accessibilityRole="button"
          >
            <Text style={styles.valeur}>{valeur}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.unite}>s</Text>
      </View>

      <TouchableOpacity
        onPress={incrementer}
        disabled={valeur >= max}
        style={[styles.btn, valeur >= max && styles.btnDesactive]}
        accessibilityLabel="Augmenter la durée"
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
  valeurInput: {
    fontSize: 52,
    fontWeight: "500",
    color: couleurs.textePrincipal,
    minWidth: 90,
    textAlign: "center",
    padding: 0,
  },
  unite: { ...typo.titre, color: couleurs.texteSecondaire },
});
