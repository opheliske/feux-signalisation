import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Step,
  dotColor,
  cycleTotalDuration,
  spacing,
  typo,
  radii,
} from "../theme";
import { useT } from "../i18n";

type Props = {
  steps: Step[];
  showFooter?: boolean;
};

export default function CyclePreview({ steps, showFooter = true }: Props) {
  const t = useT();
  if (steps.length === 0) return null;
  // Round to the thousandth to avoid floating-point imprecision
  // (e.g. 0.1 + 0.2 = 0.30000000000000004).
  const total = Math.round(cycleTotalDuration(steps) * 1000) / 1000;

  return (
    <View
      style={styles.container}
      accessibilityLabel={t("cycle_preview_a11y", { total })}
    >
      <View style={styles.bar}>
        {steps.map((step, i) => (
          <View
            key={step.id}
            style={[
              styles.segment,
              {
                flex: step.durationSeconds,
                borderTopLeftRadius: i === 0 ? radii.card : 0,
                borderBottomLeftRadius: i === 0 ? radii.card : 0,
                borderTopRightRadius: i === steps.length - 1 ? radii.card : 0,
                borderBottomRightRadius:
                  i === steps.length - 1 ? radii.card : 0,
              },
            ]}
          >
            {step.lights.map((light, j) => (
              <View
                key={light}
                style={[
                  styles.band,
                  {
                    flex: 1,
                    backgroundColor: dotColor(light),
                    borderTopWidth:
                      j > 0 ? StyleSheet.hairlineWidth : 0,
                    borderTopColor: "rgba(0,0,0,0.2)",
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      {showFooter && (
        <View style={styles.footer}>
          <Text style={styles.text}>{t("cycle_length", { total })}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  bar: {
    flexDirection: "row",
    height: 20,
    borderRadius: radii.card,
    overflow: "hidden",
  },
  segment: { flexDirection: "column", overflow: "hidden" },
  band: {},
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  text: { ...typo.small },
});
