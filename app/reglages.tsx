import React from "react";
import {
  View,
  Text,
  Switch,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useReglagesStore } from "../stores/useReglagesStore";
import { useProgrammesStore } from "../stores/useProgrammesStore";
import { couleurs, rayons, espacements, typo, tactile } from "../theme";

export default function Reglages() {
  const router = useRouter();
  const { reglages, mettreAJour } = useReglagesStore();
  const { reinitialiserExemples } = useProgrammesStore();

  const vibrer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* IP du feu */}
        <View style={styles.section}>
          <Text style={styles.label}>Adresse IP du feu (Wi-Fi)</Text>
          <TextInput
            value={reglages.ipFeu ?? ""}
            onChangeText={(v) => mettreAJour({ ipFeu: v.trim() || null })}
            placeholder="ex : 192.168.1.42"
            placeholderTextColor={couleurs.texteSecondaire}
            style={styles.input}
            keyboardType="decimal-pad"
            accessibilityLabel="Adresse IP du feu"
            returnKeyType="done"
            autoCorrect={false}
            autoCapitalize="none"
          />
          <Text style={styles.aide}>
            Laisse vide pour utiliser le mode simulation (test sans feu physique).
          </Text>
        </View>

        {/* Planning */}
        <TouchableOpacity
          onPress={() => router.push("/planning")}
          style={styles.rangeeNav}
          accessibilityLabel="Gérer le planning automatique"
          accessibilityRole="button"
        >
          <Text style={styles.labelRangee}>Planning automatique</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Vibrations */}
        <View style={styles.rangee}>
          <Text style={styles.labelRangee}>Vibrations quand j'appuie</Text>
          <Switch
            value={reglages.vibrations}
            onValueChange={(v) => {
              if (v) vibrer();
              mettreAJour({ vibrations: v });
            }}
            thumbColor={couleurs.boutonTexte}
            trackColor={{ false: couleurs.bordure, true: couleurs.boutonFond }}
            accessibilityLabel="Activer ou désactiver les vibrations"
            accessibilityRole="switch"
          />
        </View>

        {/* Animation boule disco */}
        <View style={styles.rangee}>
          <Text style={styles.labelRangee}>Animation de la boule disco</Text>
          <Switch
            value={reglages.animationLogo}
            onValueChange={(v) => mettreAJour({ animationLogo: v })}
            thumbColor={couleurs.boutonTexte}
            trackColor={{ false: couleurs.bordure, true: couleurs.boutonFond }}
            accessibilityLabel="Activer ou désactiver l'animation de la boule disco"
            accessibilityRole="switch"
          />
        </View>

        {/* Sons */}
        <View style={styles.rangee}>
          <Text style={styles.labelRangee}>Sons à chaque changement</Text>
          <Switch
            value={reglages.sons}
            onValueChange={(v) => mettreAJour({ sons: v })}
            thumbColor={couleurs.boutonTexte}
            trackColor={{ false: couleurs.bordure, true: couleurs.boutonFond }}
            accessibilityLabel="Activer ou désactiver les sons"
            accessibilityRole="switch"
          />
        </View>

        {/* Flash LED */}
        <View style={styles.rangee}>
          <Text style={styles.labelRangee}>Flash LED à chaque changement</Text>
          <Switch
            value={reglages.ledFlash}
            onValueChange={(v) => mettreAJour({ ledFlash: v })}
            thumbColor={couleurs.boutonTexte}
            trackColor={{ false: couleurs.bordure, true: couleurs.boutonFond }}
            accessibilityLabel="Activer ou désactiver le flash LED"
            accessibilityRole="switch"
          />
        </View>

        {/* Plein écran auto */}
        <View style={styles.rangee}>
          <Text style={styles.labelRangee}>Plein écran au lancement</Text>
          <Switch
            value={reglages.pleinEcranAuto}
            onValueChange={(v) => mettreAJour({ pleinEcranAuto: v })}
            thumbColor={couleurs.boutonTexte}
            trackColor={{ false: couleurs.bordure, true: couleurs.boutonFond }}
            accessibilityLabel="Ouvrir automatiquement le miroir au lancement d'un programme"
            accessibilityRole="switch"
          />
        </View>

        {/* Réinitialiser exemples */}
        <TouchableOpacity
          onPress={reinitialiserExemples}
          style={styles.btnReinit}
          accessibilityLabel="Remettre les programmes d'exemple"
          accessibilityRole="button"
        >
          <Text style={styles.btnReinitTexte}>
            Remettre les programmes d'exemple
          </Text>
        </TouchableOpacity>
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
  section: { gap: espacements.xs },
  label: { ...typo.titreMoyen },
  input: {
    backgroundColor: couleurs.carte,
    borderRadius: rayons.boutonStandard,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espacements.md,
    ...typo.corps,
    minHeight: tactile.min,
  },
  aide: { ...typo.petit },
  rangee: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: couleurs.carte,
    borderRadius: rayons.carte,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espacements.md,
    minHeight: tactile.min,
    gap: espacements.sm,
  },
  rangeeNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: couleurs.carte,
    borderRadius: rayons.carte,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espacements.md,
    minHeight: tactile.min,
  },
  labelRangee: { ...typo.corps, flex: 1 },
  chevron: {
    fontSize: 22,
    color: couleurs.texteSecondaire,
    lineHeight: 24,
  },
  btnReinit: {
    borderWidth: 1.5,
    borderColor: couleurs.boutonFond,
    borderRadius: rayons.boutonStandard,
    minHeight: tactile.min,
    alignItems: "center",
    justifyContent: "center",
    padding: espacements.md,
  },
  btnReinitTexte: { ...typo.bouton, color: couleurs.boutonFond },
});
