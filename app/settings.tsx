import React, { useEffect } from "react";
import {
  View,
  Text,
  Switch,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useProgramsStore } from "../stores/useProgramsStore";
import { colors, radii, spacing, typo, touch } from "../theme";
import { useT, useLanguageStore, Lang } from "../i18n";

const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
];

export default function Settings() {
  const t = useT();
  const { settings, update } = useSettingsStore();
  const { loadVersion, version } = useProgramsStore();
  const lang = useLanguageStore((s) => s.lang);
  const setLang = useLanguageStore((s) => s.setLang);
  const appVersion = Constants.expoConfig?.version ?? "—";

  // Fetches the firmware version when the IP is known / changes.
  useEffect(() => {
    loadVersion();
  }, [settings.lightIp, loadVersion]);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.label}>{t("settings_language")}</Text>
          <View style={styles.langButtons}>
            {LANGUAGES.map(({ code, label }) => {
              const active = lang === code;
              return (
                <TouchableOpacity
                  key={code}
                  onPress={() => setLang(code)}
                  style={[styles.langBtn, active && styles.langBtnActive]}
                  accessibilityLabel={label}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    style={[
                      styles.langBtnText,
                      active && styles.langBtnTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Light IP */}
        <View style={styles.section}>
          <Text style={styles.label}>{t("settings_ip_label")}</Text>
          <TextInput
            value={settings.lightIp ?? ""}
            onChangeText={(v) => update({ lightIp: v.trim() || null })}
            placeholder={t("settings_ip_placeholder")}
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            keyboardType="decimal-pad"
            accessibilityLabel={t("settings_ip_a11y")}
            returnKeyType="done"
            autoCorrect={false}
            autoCapitalize="none"
          />
          <Text style={styles.hint}>{t("settings_ip_hint")}</Text>
        </View>

        {/* Disco ball animation */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t("settings_disco_animation")}</Text>
          <Switch
            value={settings.logoAnimation}
            onValueChange={(v) => update({ logoAnimation: v })}
            thumbColor={colors.buttonText}
            trackColor={{ false: colors.border, true: colors.buttonBg }}
            accessibilityLabel={t("settings_disco_animation_a11y")}
            accessibilityRole="switch"
          />
        </View>

        {/* Versions */}
        <View style={styles.versionRow}>
          <Text style={styles.versionLabel}>{t("settings_application")}</Text>
          <Text style={styles.versionValue}>{appVersion}</Text>
        </View>
        <View style={styles.versionRow}>
          <Text style={styles.versionLabel}>{t("settings_firmware")}</Text>
          <Text style={styles.versionValue}>{version ?? "—"}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.screenBg },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  section: { gap: spacing.xs },
  label: { ...typo.titleMedium },
  input: {
    backgroundColor: colors.card,
    borderRadius: radii.standardButton,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...typo.body,
    minHeight: touch.min,
  },
  hint: { ...typo.small },
  langButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  langBtn: {
    flex: 1,
    minHeight: touch.min,
    borderRadius: radii.standardButton,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  langBtnActive: {
    backgroundColor: colors.buttonBg,
    borderColor: colors.buttonBg,
  },
  langBtnText: { ...typo.button, color: colors.textPrimary },
  langBtnTextActive: { color: colors.buttonText },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: touch.min,
    gap: spacing.sm,
  },
  rowLabel: { ...typo.body, flex: 1 },
  versionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: touch.min,
    gap: spacing.sm,
  },
  versionLabel: { ...typo.body, flex: 1 },
  versionValue: { ...typo.bodySecondary, color: colors.textSoft },
});
