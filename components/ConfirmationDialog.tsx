import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { colors, radii, spacing, typo, touch } from "../theme";
import { useT } from "../i18n";

type Props = {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
};

export default function ConfirmationDialog({
  visible,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
}: Props) {
  const t = useT();
  const confirm = confirmLabel ?? t("prog_delete_confirm");
  const cancel = cancelLabel ?? t("prog_keep");
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      accessibilityViewIsModal
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            {/* Non-destructive button first, default */}
            <TouchableOpacity
              onPress={onCancel}
              style={styles.btnKeep}
              accessibilityLabel={cancel}
              accessibilityRole="button"
            >
              <Text style={styles.txtKeep}>{cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={styles.btnDelete}
              accessibilityLabel={confirm}
              accessibilityRole="button"
            >
              <Text style={styles.txtDelete}>{confirm}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  box: {
    backgroundColor: colors.card,
    borderRadius: radii.cardLarge,
    padding: spacing.lg,
    width: "100%",
    gap: spacing.md,
  },
  message: {
    ...typo.title,
    textAlign: "center",
  },
  buttons: { flexDirection: "column", gap: spacing.sm },
  btnKeep: {
    backgroundColor: colors.buttonBg,
    borderRadius: radii.standardButton,
    minHeight: touch.min,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  txtKeep: { ...typo.button, color: colors.buttonText },
  btnDelete: {
    borderWidth: 2,
    borderColor: colors.destructive,
    borderRadius: radii.standardButton,
    minHeight: touch.min,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  txtDelete: { ...typo.button, color: colors.destructive },
});
