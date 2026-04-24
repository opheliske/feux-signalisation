import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { couleurs, tactile } from "../theme";

type Props = {
  onPress: () => void;
  accessibilityLabel?: string;
};

export default function BoutonPlay({
  onPress,
  accessibilityLabel = "Lancer le programme",
}: Props) {
  const size = tactile.boutonPlay;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.btn, { width: size, height: size, borderRadius: size / 2 }]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Svg width={26} height={26} viewBox="0 0 24 24">
        <Polygon points="6,3 21,12 6,21" fill={couleurs.boutonTexte} />
      </Svg>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: couleurs.boutonFond,
    alignItems: "center",
    justifyContent: "center",
  },
});
