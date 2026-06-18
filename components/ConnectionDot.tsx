import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { LightState, colors } from "../theme";
import { useT, TranslationKey } from "../i18n";

type Props = {
  connection: LightState["connection"];
};

const CONFIG: Record<
  LightState["connection"],
  { dot: string; halo: string; labelKey: TranslationKey }
> = {
  connected: { dot: "#2BA84A", halo: "#7ACB2B33", labelKey: "conn_connected" },
  disconnected: { dot: colors.borderStrong, halo: "#C9920033", labelKey: "conn_disconnected" },
  unknown: { dot: "#888888", halo: "#88888833", labelKey: "conn_connecting" },
};

export default function ConnectionDot({ connection }: Props) {
  const t = useT();
  const { dot, halo, labelKey } = CONFIG[connection];
  const label = t(labelKey);
  return (
    <View style={styles.container} accessibilityLabel={label}>
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
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
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
  label: { fontSize: 13, fontWeight: "500", color: colors.textPrimary },
});
