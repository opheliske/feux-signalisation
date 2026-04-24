import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Path, Line, Text as SvgText } from "react-native-svg";
import { couleurs } from "../theme";

export default function EtatVideProgramme() {
  return (
    <View style={styles.carte} accessibilityLabel="Aucun programme en cours">
      <Svg width={48} height={48} viewBox="0 0 48 48">
        {/* Suspension */}
        <Line x1={24} y1={11} x2={24} y2={6} stroke="#1F1400" strokeWidth={1.4} strokeLinecap="round" />
        <Circle cx={24} cy={13} r={1.8} fill="#1F1400" />
        {/* Sphère */}
        <Circle cx={24} cy={26} r={15} fill="#E8A814" />
        {/* Yeux fermés */}
        <Path d="M18 25 q0 -1.5 1.5 -1.5" stroke="#1F1400" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        <Path d="M27 25 q0 -1.5 1.5 -1.5" stroke="#1F1400" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        {/* Sourire */}
        <Path d="M20 31 q4 2.5 8 0" stroke="#1F1400" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        {/* Z */}
        <SvgText x={38} y={16} fontSize={11} fill="#6B3D00" fontWeight="500">z</SvgText>
        <SvgText x={43} y={10} fontSize={8} fill="#6B3D00" fontWeight="500">z</SvgText>
      </Svg>

      <View style={styles.textes}>
        <Text style={styles.titre}>Aucun programme en cours</Text>
        <Text style={styles.sous}>Choisis-en un en dessous</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carte: {
    backgroundColor: couleurs.surfaceSecondaire,
    borderWidth: 1.5,
    borderColor: couleurs.bordureForte,
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  textes: { flex: 1, gap: 3 },
  titre: { fontSize: 14, fontWeight: "500", color: couleurs.textePrincipal },
  sous: { fontSize: 12, color: couleurs.texteSecondaire },
});
