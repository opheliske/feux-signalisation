import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useFeuStore } from "../stores/useFeuStore";
import { useReglagesStore } from "../stores/useReglagesStore";
import { couleurs, rayons, espacements, typo, tactile } from "../theme";

const OPTIONS = [
  { label: "1 min", minutes: 1 },
  { label: "5 min", minutes: 5 },
  { label: "10 min", minutes: 10 },
  { label: "30 min", minutes: 30 },
  { label: "1 h", minutes: 60 },
];

function formatRestant(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m > 0) return `${m} min ${s < 10 ? "0" : ""}${s} s`;
  return `${s} s`;
}

export default function Minuterie() {
  const router = useRouter();
  const { etat, setFinMinuterie } = useFeuStore();
  const { reglages } = useReglagesStore();
  const [minutesCustom, setMinutesCustom] = useState("");

  const vibrer = () => {
    if (reglages.vibrations) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const definir = (minutes: number) => {
    vibrer();
    setFinMinuterie(Date.now() + minutes * 60 * 1000);
    router.back();
  };

  const handleCustom = () => {
    const n = parseInt(minutesCustom, 10);
    if (!isNaN(n) && n > 0 && n <= 600) definir(n);
  };

  const annuler = () => {
    vibrer();
    setFinMinuterie(null);
    router.back();
  };

  const resteMs =
    etat.finMinuterie !== null ? etat.finMinuterie - Date.now() : null;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {resteMs !== null && resteMs > 0 && (
          <View style={styles.encart}>
            <Text style={styles.encartTitre}>Arrêt programmé dans</Text>
            <Text style={styles.encartValeur}>{formatRestant(resteMs)}</Text>
            <TouchableOpacity
              onPress={annuler}
              style={styles.btnAnnuler}
              accessibilityLabel="Annuler la minuterie"
              accessibilityRole="button"
            >
              <Text style={styles.btnAnnulerTexte}>Annuler la minuterie</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.titre}>Arrêt automatique dans…</Text>

        <View style={styles.grille}>
          {OPTIONS.map(({ label, minutes }) => (
            <TouchableOpacity
              key={minutes}
              onPress={() => definir(minutes)}
              style={styles.btnOption}
              accessibilityLabel={`Arrêt dans ${label}`}
              accessibilityRole="button"
            >
              <Text style={styles.btnOptionTexte}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sousTitre}>Autre durée</Text>
        <View style={styles.ligneCustom}>
          <TextInput
            value={minutesCustom}
            onChangeText={setMinutesCustom}
            placeholder="ex : 45"
            placeholderTextColor={couleurs.texteSecondaire}
            style={styles.input}
            keyboardType="number-pad"
            returnKeyType="done"
            onSubmitEditing={handleCustom}
            accessibilityLabel="Durée personnalisée en minutes"
            maxLength={3}
          />
          <Text style={styles.inputUnite}>min</Text>
          <TouchableOpacity
            onPress={handleCustom}
            style={styles.btnOk}
            accessibilityLabel="Valider la durée personnalisée"
            accessibilityRole="button"
          >
            <Text style={styles.btnOkTexte}>OK</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: couleurs.fondEcran },
  scroll: {
    padding: espacements.md,
    gap: espacements.md,
    paddingBottom: espacements.xxl,
  },
  encart: {
    backgroundColor: couleurs.surfaceSecondaire,
    borderRadius: rayons.carteLarge,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espacements.md,
    gap: espacements.sm,
    alignItems: "center",
  },
  encartTitre: { ...typo.corpsSecondaire },
  encartValeur: { ...typo.titreLarge },
  btnAnnuler: {
    borderWidth: 1.5,
    borderColor: couleurs.destructif,
    borderRadius: rayons.boutonStandard,
    paddingHorizontal: espacements.lg,
    paddingVertical: espacements.sm,
    minHeight: tactile.min,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
  },
  btnAnnulerTexte: { ...typo.bouton, color: couleurs.destructif },
  titre: { ...typo.titre },
  grille: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espacements.sm,
  },
  btnOption: {
    backgroundColor: couleurs.boutonFond,
    borderRadius: rayons.boutonStandard,
    paddingHorizontal: espacements.lg,
    paddingVertical: espacements.sm,
    minHeight: tactile.min,
    justifyContent: "center",
    alignItems: "center",
  },
  btnOptionTexte: { ...typo.bouton, color: couleurs.boutonTexte },
  sousTitre: { ...typo.titreMoyen },
  ligneCustom: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacements.sm,
  },
  input: {
    backgroundColor: couleurs.carte,
    borderRadius: rayons.boutonStandard,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espacements.md,
    ...typo.corps,
    minHeight: tactile.min,
    width: 80,
    textAlign: "center",
  },
  inputUnite: { ...typo.corps },
  btnOk: {
    backgroundColor: couleurs.boutonFond,
    borderRadius: rayons.boutonStandard,
    minHeight: tactile.min,
    paddingHorizontal: espacements.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  btnOkTexte: { ...typo.bouton, color: couleurs.boutonTexte },
});
