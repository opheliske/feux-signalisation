import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  Light,
  dotColor,
  colors,
  radii,
  spacing,
  typo,
  touch,
} from "../theme";
import { useT, lightLabel } from "../i18n";

const LIGHTS: Light[] = ["green", "orange", "red", "off"];

type Props = {
  initialSelection?: Light[];
  onConfirm: (lights: Light[]) => void;
};

export default function LightPicker({
  initialSelection = [],
  onConfirm,
}: Props) {
  const t = useT();
  const [selection, setSelection] = useState<Light[]>(initialSelection);

  const toggle = (light: Light) => {
    setSelection((prev) => {
      // Off is exclusive: it can't be lit alongside anything else
      if (light === "off") {
        return prev.includes("off") ? [] : ["off"];
      }
      // Selecting a color removes "off"
      const withoutOff = prev.filter((l) => l !== "off");
      if (withoutOff.includes(light)) {
        return withoutOff.filter((l) => l !== light);
      }
      return [...withoutOff, light];
    });
  };

  const canConfirm = selection.length > 0;

  return (
    <View style={styles.container} accessibilityLabel={t("picker_choose_lights_a11y")}>
      <Text style={styles.hint}>
        {t("picker_lights_hint")}
      </Text>

      <View style={styles.grid}>
        {LIGHTS.map((light) => {
          const chosen = selection.includes(light);
          return (
            <TouchableOpacity
              key={light}
              onPress={() => toggle(light)}
              style={[styles.card, chosen && styles.cardChosen]}
              accessibilityLabel={`${lightLabel(light)}${chosen ? t("picker_checked_suffix") : ""}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: chosen }}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: dotColor(light) },
                ]}
              />
              <Text style={styles.label}>{lightLabel(light)}</Text>
              <View style={[styles.check, chosen && styles.checkActive]}>
                {chosen && <Text style={styles.checkText}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={() => onConfirm(selection)}
        disabled={!canConfirm}
        style={[styles.btnConfirm, !canConfirm && styles.btnConfirmDisabled]}
        accessibilityLabel={t("picker_confirm_a11y")}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canConfirm }}
      >
        <Text style={styles.btnConfirmText}>{t("common_confirm")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  hint: {
    ...typo.bodySecondary,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  card: {
    width: "48%",
    minHeight: touch.min + 16,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.sm,
  },
  cardChosen: {
    borderColor: colors.buttonBg,
    borderWidth: 2,
    backgroundColor: colors.secondarySurface,
  },
  dot: { width: 36, height: 36, borderRadius: 18 },
  label: { ...typo.titleMedium },
  check: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  checkActive: {
    backgroundColor: colors.buttonBg,
    borderColor: colors.buttonBg,
  },
  checkText: {
    color: colors.buttonText,
    fontSize: 14,
    fontWeight: "700",
  },
  btnConfirm: {
    minHeight: touch.min,
    backgroundColor: colors.buttonBg,
    borderRadius: radii.standardButton,
    alignItems: "center",
    justifyContent: "center",
  },
  btnConfirmDisabled: {
    opacity: 0.4,
  },
  btnConfirmText: { ...typo.button, color: colors.buttonText },
});
