import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import Svg, { Polygon } from "react-native-svg";
import {
  Programme,
  couleurs,
  espacements,
  typo,
  labelLampe,
  dureeTotaleCycle,
} from "../theme";

type Props = {
  programme: Programme;
  onLancer: () => void;
  onOuvrir: () => void;
  onDupliquer: () => void;
  onSupprimer: () => void;
};

function resumeCourt(programme: Programme): string {
  if (programme.etapes.length === 0) return "Aucune étape";
  return programme.etapes
    .map((e) => `${labelLampe[e.lampe]} ${e.dureeSecondes} s`)
    .join(" · ");
}

export default function CarteProgramme({
  programme,
  onLancer,
  onOuvrir,
  onDupliquer,
  onSupprimer,
}: Props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const duree = dureeTotaleCycle(programme.etapes);
  const resume = resumeCourt(programme);

  return (
    <>
      <TouchableOpacity
        onPress={onOuvrir}
        style={styles.carte}
        accessibilityLabel={`Programme ${programme.nom}. ${resume}. Appuie pour modifier.`}
        accessibilityRole="button"
      >
        {/* Pastille fixe */}
        <View style={styles.pastille}>
          <Text style={styles.emoji}>🚦</Text>
        </View>

        {/* Contenu */}
        <View style={styles.corps}>
          <View style={styles.entete}>
            {programme.epingle && (
              <Text style={styles.etoile}>⭐</Text>
            )}
            <Text style={styles.nom} numberOfLines={1}>{programme.nom}</Text>
          </View>
          <Text style={styles.resume} numberOfLines={2}>{resume}</Text>
          <Text style={styles.stats}>Cycle {duree} s · {programme.nbLancements} fois</Text>
        </View>

        {/* Bouton play */}
        <TouchableOpacity
          onPress={onLancer}
          style={styles.play}
          accessibilityLabel={`Lancer ${programme.nom}`}
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Svg width={14} height={14} viewBox="0 0 14 14">
            <Polygon points="4,3 13,7 4,11" fill={couleurs.boutonTexte} />
          </Svg>
        </TouchableOpacity>

        {/* Menu */}
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.btnMenu}
          accessibilityLabel="Plus d'options"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.troisPoints}>•••</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
        accessibilityViewIsModal
      >
        <TouchableOpacity
          style={styles.fondMenu}
          onPress={() => setMenuVisible(false)}
          activeOpacity={1}
        >
          <TouchableOpacity activeOpacity={1} style={styles.boiteMenu}>
            <Text style={styles.titreMenu}>{programme.nom}</Text>
            {[
              { label: "Dupliquer", action: () => { onDupliquer(); setMenuVisible(false); } },
              { label: "Modifier", action: () => { onOuvrir(); setMenuVisible(false); } },
              { label: "Supprimer", action: () => { onSupprimer(); setMenuVisible(false); }, danger: true },
            ].map(({ label, action, danger }) => (
              <TouchableOpacity
                key={label}
                onPress={action}
                style={styles.itemMenu}
                accessibilityLabel={label}
                accessibilityRole="button"
              >
                <Text style={[styles.itemMenuTexte, danger && styles.danger]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pastille: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: couleurs.surfaceSecondaire,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  emoji: { fontSize: 22 },
  corps: { flex: 1, gap: 2 },
  entete: { flexDirection: "row", alignItems: "center", gap: 4 },
  etoile: { fontSize: 12 },
  nom: { fontSize: 14, fontWeight: "500", color: couleurs.textePrincipal, flex: 1 },
  resume: { fontSize: 12, color: couleurs.texteSecondaire, lineHeight: 17 },
  stats: { fontSize: 11, color: couleurs.texteDoux },
  play: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: couleurs.boutonFond,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  btnMenu: {
    width: 32,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  troisPoints: { fontSize: 14, color: couleurs.texteSecondaire, letterSpacing: 2 },
  fondMenu: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: espacements.lg,
  },
  boiteMenu: {
    backgroundColor: couleurs.carte,
    borderRadius: 14,
    overflow: "hidden",
  },
  titreMenu: { ...typo.titreMoyen, padding: espacements.md, borderBottomWidth: 1, borderBottomColor: couleurs.bordure },
  itemMenu: { padding: espacements.md, minHeight: 56, justifyContent: "center", borderBottomWidth: 1, borderBottomColor: couleurs.bordure },
  itemMenuTexte: { ...typo.corps },
  danger: { color: couleurs.destructif },
});
