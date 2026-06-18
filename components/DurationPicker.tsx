import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { colors, spacing, typo, touch, radii } from "../theme";
import { useT } from "../i18n";

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
};

export default function DurationPicker({
  value,
  onChange,
  min = 0.1,
  max = 60,
}: Props) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");

  const openInput = () => {
    setText(String(value));
    setEditing(true);
  };

  // Round to the thousandth (the light works in milliseconds) to avoid
  // floating-point imprecision (0.9 - 0.1, etc.).
  const round = (v: number) => Math.round(v * 1000) / 1000;

  // Variable step: 0.1 s below one second, 1 s from 1 s up.
  const decrement = () => {
    const step = value <= 1 ? 0.1 : 1;
    onChange(round(Math.max(min, value - step)));
  };
  const increment = () => {
    const step = value < 1 ? 0.1 : 1;
    onChange(round(Math.min(max, value + step)));
  };

  // Manual input: accepts decimals (e.g. "0.200" → 0.2 s = 200 ms).
  const typeValue = (txt: string) => {
    setText(txt);
    const n = parseFloat(txt.replace(",", "."));
    if (!isNaN(n)) {
      onChange(round(Math.min(max, Math.max(min, n))));
    }
  };

  return (
    <View
      style={styles.container}
      accessibilityLabel={t("duration_a11y", { value })}
    >
      <TouchableOpacity
        onPress={decrement}
        disabled={value <= min}
        style={[styles.btn, value <= min && styles.btnDisabled]}
        accessibilityLabel={t("duration_decrease_a11y")}
        accessibilityRole="button"
      >
        <Text style={styles.btnText}>–</Text>
      </TouchableOpacity>

      <View style={styles.valueContainer}>
        {editing ? (
          <TextInput
            value={text}
            onChangeText={typeValue}
            onSubmitEditing={() => setEditing(false)}
            onBlur={() => setEditing(false)}
            keyboardType="decimal-pad"
            autoFocus
            selectTextOnFocus
            returnKeyType="done"
            style={styles.valueInput}
            accessibilityLabel={t("duration_enter_a11y")}
          />
        ) : (
          <TouchableOpacity
            onPress={openInput}
            accessibilityLabel={t("duration_enter_hand_a11y")}
            accessibilityRole="button"
          >
            <Text style={styles.value}>{value}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.unit}>s</Text>
      </View>

      <TouchableOpacity
        onPress={increment}
        disabled={value >= max}
        style={[styles.btn, value >= max && styles.btnDisabled]}
        accessibilityLabel={t("duration_increase_a11y")}
        accessibilityRole="button"
      >
        <Text style={styles.btnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  btn: {
    width: touch.min,
    height: touch.min,
    borderRadius: radii.standardButton,
    backgroundColor: colors.buttonBg,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.3 },
  btnText: {
    fontSize: 28,
    color: colors.buttonText,
    fontWeight: "500",
    lineHeight: 32,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    minWidth: 80,
    justifyContent: "center",
  },
  value: {
    fontSize: 52,
    fontWeight: "500",
    color: colors.textPrimary,
    lineHeight: 60,
  },
  valueInput: {
    fontSize: 52,
    fontWeight: "500",
    color: colors.textPrimary,
    minWidth: 90,
    textAlign: "center",
    padding: 0,
  },
  unit: { ...typo.title, color: colors.textSecondary },
});
