import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useProgramsStore } from "../../stores/useProgramsStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useFavoritesStore } from "../../stores/useFavoritesStore";
import DurationPicker from "../../components/DurationPicker";
import LightPicker from "../../components/LightPicker";
import CyclePreview from "../../components/CyclePreview";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import Confetti, { ConfettiRef } from "../../components/Confetti";
import {
  Light,
  Step,
  colors,
  radii,
  spacing,
  typo,
  touch,
  dotColor,
} from "../../theme";
import { useT, lightsLabel } from "../../i18n";
import { DeviceMode, MAX_NAME_LEN, MAX_STEPS } from "../../services/protocol";

function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export default function ProgramScreen() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { programs, create, update, remove, duplicate } =
    useProgramsStore();
  const { settings } = useSettingsStore();
  const { favorites, setFavorite, removeFavorite } = useFavoritesStore();
  const confettiRef = useRef<ConfettiRef>(null);

  const isNew = id === "new";
  const existingProgram = !isNew
    ? (programs.find((p) => p.id === id) ?? null)
    : null;

  const [name, setName] = useState(existingProgram?.name ?? "");
  const [isFavorite, setIsFavorite] = useState(
    existingProgram ? favorites.includes(existingProgram.name) : false
  );
  const [steps, setSteps] = useState<Step[]>(
    existingProgram?.steps ?? []
  );

  const [editLightsIndex, setEditLightsIndex] = useState<number | null>(
    null
  );
  const [addingLights, setAddingLights] = useState(false);
  const [durationIndex, setDurationIndex] = useState<number | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const vibrate = () => {
    if (settings.vibrations) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const handleSave = async () => {
    vibrate();
    setError(null);
    const mode: DeviceMode = {
      name: name.trim(),
      loop: true,
      steps,
    };
    setSaving(true);
    try {
      if (isNew) {
        await create(mode);
      } else if (existingProgram) {
        await update(existingProgram.name, mode);
      }
      // The light identifies a mode by its name: carry the favorite over to the
      // final name and clean up the old one in case of a rename.
      if (existingProgram && existingProgram.name !== mode.name) {
        removeFavorite(existingProgram.name);
      }
      setFavorite(mode.name, isFavorite);
      confettiRef.current?.launch();
      setTimeout(() => router.back(), 600);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("prog_save_failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingProgram) return;
    await remove(existingProgram.name);
    removeFavorite(existingProgram.name);
    router.back();
  };

  const handleDuplicate = async () => {
    if (!existingProgram) return;
    vibrate();
    await duplicate(existingProgram.name);
    router.back();
  };

  const addStep = (lights: Light[]) => {
    if (lights.length === 0) return;
    if (steps.length >= MAX_STEPS) {
      setError(t("prog_max_steps", { max: MAX_STEPS }));
      setAddingLights(false);
      return;
    }
    setError(null);
    setSteps((prev) => [
      ...prev,
      { id: genId(), lights, durationSeconds: 3 },
    ]);
    setAddingLights(false);
  };

  const editLights = (index: number, lights: Light[]) => {
    if (lights.length === 0) return;
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, lights } : s))
    );
    setEditLightsIndex(null);
  };

  const editDuration = (index: number, duration: number) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, durationSeconds: duration } : s))
    );
  };

  const deleteStep = (index: number) => {
    vibrate();
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const moveStepUp = (index: number) => {
    if (index === 0) return;
    vibrate();
    setSteps((prev) => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  };

  const moveStepDown = (index: number) => {
    if (index === steps.length - 1) return;
    vibrate();
    setSteps((prev) => {
      const copy = [...prev];
      [copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
      return copy;
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                vibrate();
                setIsFavorite((v) => !v);
              }}
              style={styles.btnFavorite}
              accessibilityLabel={
                isFavorite ? t("prog_remove_fav_a11y") : t("prog_add_fav_a11y")
              }
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.btnFavoriteText}>{isFavorite ? "⭐" : "☆"}</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>{t("prog_name_label")}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t("prog_name_placeholder")}
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            accessibilityLabel={t("prog_name_label")}
            returnKeyType="done"
            maxLength={MAX_NAME_LEN}
            autoCorrect={false}
          />
          <Text style={styles.hint}>
            {t("prog_name_hint", { max: MAX_NAME_LEN })}
          </Text>
        </View>

        {/* Steps */}
        <View style={styles.section}>
          <Text style={styles.label}>{t("prog_steps")}</Text>

          {steps.length === 0 && (
            <Text style={styles.empty}>{t("prog_no_steps_add")}</Text>
          )}

          {steps.map((step, i) => (
            <View key={step.id} style={styles.stepCard}>
              <Text style={styles.stepNum}>{i + 1}</Text>
              <TouchableOpacity
                onPress={() => {
                  vibrate();
                  setEditLightsIndex(i);
                }}
                style={styles.lightsZone}
                accessibilityLabel={t("prog_edit_lights_a11y", { num: i + 1, lights: lightsLabel(step.lights) })}
                accessibilityRole="button"
              >
                <View style={styles.dots}>
                  {step.lights.map((l) => (
                    <View
                      key={l}
                      style={[
                        styles.stepDot,
                        { backgroundColor: dotColor(l) },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.lightName} numberOfLines={1}>
                  {lightsLabel(step.lights)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setDurationIndex(i)}
                style={styles.btnDuration}
                accessibilityLabel={t("prog_edit_duration_a11y", { num: i + 1, seconds: step.durationSeconds })}
                accessibilityRole="button"
              >
                <Text style={styles.durationText}>{step.durationSeconds} s</Text>
              </TouchableOpacity>

              <View style={styles.reorder}>
                <TouchableOpacity
                  onPress={() => moveStepUp(i)}
                  disabled={i === 0}
                  style={[styles.btnOrder, i === 0 && styles.btnOrderDisabled]}
                  accessibilityLabel={t("prog_move_up_a11y", { num: i + 1 })}
                  accessibilityRole="button"
                >
                  <Text style={styles.arrow}>↑</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => moveStepDown(i)}
                  disabled={i === steps.length - 1}
                  style={[
                    styles.btnOrder,
                    i === steps.length - 1 && styles.btnOrderDisabled,
                  ]}
                  accessibilityLabel={t("prog_move_down_a11y", { num: i + 1 })}
                  accessibilityRole="button"
                >
                  <Text style={styles.arrow}>↓</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => deleteStep(i)}
                style={styles.btnDeleteStep}
                accessibilityLabel={t("prog_delete_step_a11y", { num: i + 1 })}
                accessibilityRole="button"
              >
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => {
              vibrate();
              setAddingLights(true);
            }}
            style={styles.btnAdd}
            accessibilityLabel={t("prog_add_step_a11y")}
            accessibilityRole="button"
          >
            <Text style={styles.btnAddText}>{t("prog_add_step")}</Text>
          </TouchableOpacity>
        </View>

        {steps.length > 0 && <CyclePreview steps={steps} />}
      </ScrollView>

      {/* Error message (validation / network) */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* Action bar */}
      <View style={styles.actionBar}>
        {!isNew && (
          <TouchableOpacity
            onPress={handleDuplicate}
            style={styles.btnDuplicate}
            accessibilityLabel={t("prog_duplicate_a11y")}
            accessibilityRole="button"
          >
            <Text style={styles.btnDuplicateText}>{t("common_duplicate")}</Text>
          </TouchableOpacity>
        )}
        {!isNew && (
          <TouchableOpacity
            onPress={() => {
              vibrate();
              setShowConfirmDelete(true);
            }}
            style={styles.btnDeleteProg}
            accessibilityLabel={t("prog_delete_a11y")}
            accessibilityRole="button"
          >
            <Text style={styles.btnDeleteProgText}>{t("common_delete")}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.btnSave, saving && styles.btnDisabled]}
          accessibilityLabel={t("prog_save_a11y")}
          accessibilityRole="button"
        >
          <Text style={styles.btnSaveText}>
            {saving ? t("prog_sending") : t("prog_save")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Confetti */}
      <Confetti ref={confettiRef} />

      {/* Modal: add a step (light selection) */}
      <Modal
        visible={addingLights}
        transparent
        animationType="slide"
        onRequestClose={() => setAddingLights(false)}
        accessibilityViewIsModal
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setAddingLights(false)}
          accessibilityLabel={t("prog_close_picker_a11y")}
          activeOpacity={1}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t("prog_choose_lights")}</Text>
            <LightPicker onConfirm={addStep} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal: edit the lights of an existing step */}
      <Modal
        visible={editLightsIndex !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditLightsIndex(null)}
        accessibilityViewIsModal
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setEditLightsIndex(null)}
          accessibilityLabel={t("prog_close_picker_a11y")}
          activeOpacity={1}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t("prog_edit_lights")}</Text>
            {editLightsIndex !== null && (
              <LightPicker
                initialSelection={steps[editLightsIndex]?.lights ?? []}
                onConfirm={(lights) =>
                  editLights(editLightsIndex, lights)
                }
              />
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal: edit the duration */}
      <Modal
        visible={durationIndex !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setDurationIndex(null)}
        accessibilityViewIsModal
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setDurationIndex(null)}
          accessibilityLabel={t("prog_close_duration_a11y")}
          activeOpacity={1}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t("prog_step_duration")}</Text>
            {durationIndex !== null && (
              <DurationPicker
                value={steps[durationIndex]?.durationSeconds ?? 3}
                onChange={(v) => editDuration(durationIndex, v)}
              />
            )}
            <TouchableOpacity
              onPress={() => setDurationIndex(null)}
              style={styles.btnClose}
              accessibilityLabel={t("prog_confirm_duration_a11y")}
              accessibilityRole="button"
            >
              <Text style={styles.btnCloseText}>{t("common_ok")}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ConfirmationDialog
        visible={showConfirmDelete}
        message={t("prog_confirm_delete")}
        cancelLabel={t("prog_keep")}
        confirmLabel={t("prog_delete_confirm")}
        onCancel={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.screenBg },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 140,
  },
  section: { gap: spacing.sm },
  label: { ...typo.titleMedium },
  input: {
    backgroundColor: colors.card,
    borderRadius: radii.standardButton,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...typo.body,
    minHeight: touch.min,
  },
  empty: {
    ...typo.bodySecondary,
    textAlign: "center",
    padding: spacing.md,
  },
  hint: { ...typo.small },
  errorBanner: {
    backgroundColor: colors.destructive,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorBannerText: {
    ...typo.bodySecondary,
    color: colors.white,
    textAlign: "center",
  },
  btnDisabled: { opacity: 0.5 },
  stepCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.xs,
    minHeight: touch.min,
  },
  stepNum: {
    ...typo.titleMedium,
    width: 22,
    textAlign: "center",
    flexShrink: 0,
  },
  stepDot: { width: 20, height: 20, borderRadius: 10, flexShrink: 0 },
  dots: { flexDirection: "row", gap: 4, flexShrink: 0 },
  lightsZone: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: touch.min - 8,
  },
  lightName: { ...typo.body, flex: 1 },
  btnDuration: {
    backgroundColor: colors.secondarySurface,
    borderRadius: radii.standardButton,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 52,
    alignItems: "center",
    minHeight: 36,
    justifyContent: "center",
  },
  durationText: { ...typo.body },
  reorder: { flexDirection: "column", flexShrink: 0 },
  btnOrder: {
    width: 32,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  btnOrderDisabled: { opacity: 0.2 },
  arrow: { fontSize: 16 },
  btnDeleteStep: {
    width: touch.min,
    height: touch.min,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  deleteText: { fontSize: 18, color: colors.destructive },
  btnAdd: {
    borderWidth: 1.5,
    borderColor: colors.buttonBg,
    borderRadius: radii.standardButton,
    minHeight: touch.min,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  btnAddText: { ...typo.button, color: colors.buttonBg },
  actionBar: {
    flexDirection: "row",
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.screenBg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  btnFavorite: {
    minWidth: touch.min,
    minHeight: touch.min,
    alignItems: "center",
    justifyContent: "center",
  },
  btnFavoriteText: { fontSize: 22 },
  btnDuplicate: {
    flex: 1,
    minHeight: touch.min,
    borderRadius: radii.standardButton,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDuplicateText: { ...typo.button, color: colors.textSecondary },
  btnDeleteProg: {
    flex: 1,
    minHeight: touch.min,
    borderRadius: radii.standardButton,
    borderWidth: 1.5,
    borderColor: colors.destructive,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDeleteProgText: { ...typo.button, color: colors.destructive },
  btnSave: {
    flex: 1,
    minHeight: touch.min,
    borderRadius: radii.standardButton,
    backgroundColor: colors.buttonBg,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSaveText: { ...typo.button, color: colors.buttonText },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalSheet: {
    backgroundColor: colors.screenBg,
    borderRadius: radii.container,
    padding: spacing.lg,
    gap: spacing.md,
    overflow: "hidden",
  },
  modalTitle: { ...typo.title, textAlign: "center" },
  btnClose: {
    backgroundColor: colors.buttonBg,
    borderRadius: radii.standardButton,
    minHeight: touch.min,
    alignItems: "center",
    justifyContent: "center",
  },
  btnCloseText: { ...typo.button, color: colors.buttonText },
});
