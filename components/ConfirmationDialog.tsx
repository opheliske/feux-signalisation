import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { couleurs, rayons, espacements, typo, tactile } from "../theme";

type Props = {
  visible: boolean;
  message: string;
  onConfirmer: () => void;
  onAnnuler: () => void;
  labelConfirmer?: string;
  labelAnnuler?: string;
};

export default function ConfirmationDialog({
  visible,
  message,
  onConfirmer,
  onAnnuler,
  labelConfirmer = "Oui, supprimer",
  labelAnnuler = "Non, garder",
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      accessibilityViewIsModal
      onRequestClose={onAnnuler}
    >
      <View style={styles.fond}>
        <View style={styles.boite}>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.boutons}>
            {/* Bouton non-destructif en premier, par défaut */}
            <TouchableOpacity
              onPress={onAnnuler}
              style={styles.btnGarder}
              accessibilityLabel={labelAnnuler}
              accessibilityRole="button"
            >
              <Text style={styles.txtGarder}>{labelAnnuler}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirmer}
              style={styles.btnSupprimer}
              accessibilityLabel={labelConfirmer}
              accessibilityRole="button"
            >
              <Text style={styles.txtSupprimer}>{labelConfirmer}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fond: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: espacements.lg,
  },
  boite: {
    backgroundColor: couleurs.carte,
    borderRadius: rayons.carteLarge,
    padding: espacements.lg,
    width: "100%",
    gap: espacements.md,
  },
  message: {
    ...typo.titre,
    textAlign: "center",
  },
  boutons: { flexDirection: "column", gap: espacements.sm },
  btnGarder: {
    backgroundColor: couleurs.boutonFond,
    borderRadius: rayons.boutonStandard,
    minHeight: tactile.min,
    alignItems: "center",
    justifyContent: "center",
    padding: espacements.md,
  },
  txtGarder: { ...typo.bouton, color: couleurs.boutonTexte },
  btnSupprimer: {
    borderWidth: 2,
    borderColor: couleurs.destructif,
    borderRadius: rayons.boutonStandard,
    minHeight: tactile.min,
    alignItems: "center",
    justifyContent: "center",
    padding: espacements.md,
  },
  txtSupprimer: { ...typo.bouton, color: couleurs.destructif },
});
