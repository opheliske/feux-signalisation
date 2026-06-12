import React, { useEffect } from "react";
import {
  View,
  Text,
  Switch,
  TextInput,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useReglagesStore } from "../stores/useReglagesStore";
import { useProgrammesStore } from "../stores/useProgrammesStore";
import { couleurs, rayons, espacements, typo, tactile } from "../theme";

export default function Reglages() {
  const { reglages, mettreAJour } = useReglagesStore();
  const { chargerVersion, version } = useProgrammesStore();
  const versionApp = Constants.expoConfig?.version ?? "—";

  // Récupère la version du firmware quand l'IP est connue / change.
  useEffect(() => {
    chargerVersion();
  }, [reglages.ipFeu, chargerVersion]);

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
            L'adresse IP du feu sur ton réseau Wi-Fi.
          </Text>
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

        {/* Versions */}
        <View style={styles.versionRangee}>
          <Text style={styles.versionLabel}>Application</Text>
          <Text style={styles.versionValeur}>{versionApp}</Text>
        </View>
        <View style={styles.versionRangee}>
          <Text style={styles.versionLabel}>Firmware</Text>
          <Text style={styles.versionValeur}>{version ?? "—"}</Text>
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
  labelRangee: { ...typo.corps, flex: 1 },
  versionRangee: {
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
  versionLabel: { ...typo.corps, flex: 1 },
  versionValeur: { ...typo.corpsSecondaire, color: couleurs.texteDoux },
});
