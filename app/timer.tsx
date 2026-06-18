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
import { useLightStore } from "../stores/useLightStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useT } from "../i18n";
import { colors, radii, spacing, typo, touch } from "../theme";

const OPTIONS = [
  { label: "1 min", minutes: 1 },
  { label: "5 min", minutes: 5 },
  { label: "10 min", minutes: 10 },
  { label: "30 min", minutes: 30 },
  { label: "1 h", minutes: 60 },
];

function formatRemaining(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m > 0) return `${m} min ${s < 10 ? "0" : ""}${s} s`;
  return `${s} s`;
}

export default function Timer() {
  const t = useT();
  const router = useRouter();
  const { state, setTimerEnd } = useLightStore();
  const { settings } = useSettingsStore();
  const [customMinutes, setCustomMinutes] = useState("");

  const vibrate = () => {
    if (settings.vibrations) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const setTimer = (minutes: number) => {
    vibrate();
    setTimerEnd(Date.now() + minutes * 60 * 1000);
    router.back();
  };

  const handleCustom = () => {
    const n = parseInt(customMinutes, 10);
    if (!isNaN(n) && n > 0 && n <= 600) setTimer(n);
  };

  const cancel = () => {
    vibrate();
    setTimerEnd(null);
    router.back();
  };

  const remainingMs =
    state.timerEnd !== null ? state.timerEnd - Date.now() : null;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {remainingMs !== null && remainingMs > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("timer_autostop_in")}</Text>
            <Text style={styles.cardValue}>{formatRemaining(remainingMs)}</Text>
            <TouchableOpacity
              onPress={cancel}
              style={styles.btnCancel}
              accessibilityLabel={t("timer_cancel_a11y")}
              accessibilityRole="button"
            >
              <Text style={styles.btnCancelText}>{t("timer_cancel")}</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.title}>{t("timer_autostop_title")}</Text>

        <View style={styles.grid}>
          {OPTIONS.map(({ label, minutes }) => (
            <TouchableOpacity
              key={minutes}
              onPress={() => setTimer(minutes)}
              style={styles.btnOption}
              accessibilityLabel={t("timer_stop_in_a11y", { label })}
              accessibilityRole="button"
            >
              <Text style={styles.btnOptionText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.subtitle}>{t("timer_other_duration")}</Text>
        <View style={styles.customRow}>
          <TextInput
            value={customMinutes}
            onChangeText={setCustomMinutes}
            placeholder={t("timer_custom_placeholder")}
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            keyboardType="number-pad"
            returnKeyType="done"
            onSubmitEditing={handleCustom}
            accessibilityLabel={t("timer_custom_a11y")}
            maxLength={3}
          />
          <Text style={styles.inputUnit}>min</Text>
          <TouchableOpacity
            onPress={handleCustom}
            style={styles.btnOk}
            accessibilityLabel={t("timer_confirm_custom_a11y")}
            accessibilityRole="button"
          >
            <Text style={styles.btnOkText}>{t("common_ok")}</Text>
          </TouchableOpacity>
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
  card: {
    backgroundColor: colors.secondarySurface,
    borderRadius: radii.cardLarge,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: "center",
  },
  cardTitle: { ...typo.bodySecondary },
  cardValue: { ...typo.titleLarge },
  btnCancel: {
    borderWidth: 1.5,
    borderColor: colors.destructive,
    borderRadius: radii.standardButton,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: touch.min,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
  },
  btnCancelText: { ...typo.button, color: colors.destructive },
  title: { ...typo.title },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  btnOption: {
    backgroundColor: colors.buttonBg,
    borderRadius: radii.standardButton,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: touch.min,
    justifyContent: "center",
    alignItems: "center",
  },
  btnOptionText: { ...typo.button, color: colors.buttonText },
  subtitle: { ...typo.titleMedium },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radii.standardButton,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...typo.body,
    minHeight: touch.min,
    width: 80,
    textAlign: "center",
  },
  inputUnit: { ...typo.body },
  btnOk: {
    backgroundColor: colors.buttonBg,
    borderRadius: radii.standardButton,
    minHeight: touch.min,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  btnOkText: { ...typo.button, color: colors.buttonText },
});
