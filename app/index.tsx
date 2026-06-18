import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Svg, { Path, Rect } from "react-native-svg";
import DiscoBallLogo from "../components/DiscoBallLogo";
import type { DiscoBallLogo as LogoRef } from "../components/DiscoBallLogo";
import ProgramCard from "../components/ProgramCard";
import ConnectionDot from "../components/ConnectionDot";
import RayBackground from "../components/RayBackground";
import { useProgramsStore } from "../stores/useProgramsStore";
import { useLightStore } from "../stores/useLightStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useFavoritesStore } from "../stores/useFavoritesStore";
import { Program, colors, spacing, radii, typo, touch } from "../theme";
import { turnOnLight, configureIp, MODE_OFF } from "../services/light";
import { startProgram, stopEngine, isActive } from "../services/playbackEngine";
import { useT } from "../i18n";

function GearIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        stroke="#1F1400"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke="#1F1400"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function StopIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Rect x={3} y={3} width={10} height={10} rx={2} fill={colors.stopText} />
    </Svg>
  );
}

function RefreshIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12a9 9 0 1 1-2.64-6.36"
        stroke="#1F1400"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M21 3v6h-6"
        stroke="#1F1400"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function Home() {
  const t = useT();
  const router = useRouter();
  const discoBall = useRef<LogoRef>(null);

  const {
    programs,
    remove,
    duplicate,
    incrementRunCount,
    load,
    launch,
    loading,
    error: modesError,
    activeMode,
  } = useProgramsStore();
  const {
    state,
    setOn,
    setCurrentProgram,
    setStepIndex,
    setPaused,
    setLastLaunchedProgramId,
    reset,
  } = useLightStore();
  const { settings } = useSettingsStore();
  const favorites = useFavoritesStore((s) => s.favorites);

  useEffect(() => {
    configureIp(settings.lightIp);
  }, [settings.lightIp]);

  // Reloads the list of modes from the light every time the screen regains
  // focus (returning from the editor, settings…) or when the IP changes.
  useFocusEffect(
    React.useCallback(() => {
      configureIp(settings.lightIp);
      load();
    }, [settings.lightIp, load])
  );

  // Syncs the display (disco ball, mirror, playback block) with the mode that's
  // actually active on the light — including when it changes on its own via the
  // physical button, detected by the heartbeat. We adopt the reported mode
  // without sending it back to the light or counting a run.
  useEffect(() => {
    // No active mode (or OFF mode) → stop the local preview.
    if (!activeMode || activeMode === MODE_OFF) {
      if (isActive()) {
        stopEngine();
        reset();
      }
      return;
    }
    const prog = programs.find((p) => p.name === activeMode);
    if (!prog || prog.steps.length === 0) return;
    if (state.currentProgram === prog.id) return; // already displayed
    setCurrentProgram(prog.id);
    setPaused(false);
    startProgram(
      prog,
      // Preview: we only update the store on a step change (for the disco ball
      // color / mirror). Progress is no longer displayed, so we avoid
      // re-rendering the whole screen every 100 ms — otherwise renders pile up
      // and the app gradually slows down.
      (stepIndex) => {
        const light = useLightStore.getState();
        if (light.state.stepIndex !== stepIndex) light.setStepIndex(stepIndex);
      },
      () => reset()
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode, programs]);

  const vibrate = () => {
    if (settings.vibrations)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleLaunch = (id: string) => {
    vibrate();
    const prog = programs.find((p) => p.id === id);
    if (!prog || prog.steps.length === 0) return;
    // Activates the mode on the light (the hardware runs the sequence itself).
    launch(prog.name);
    if (!state.on) {
      setOn(true);
      turnOnLight().catch(() => {});
    }
    setCurrentProgram(id);
    setStepIndex(0);
    setPaused(false);
    setLastLaunchedProgramId(id);
    incrementRunCount(id);
    discoBall.current?.explode();
    startProgram(
      prog,
      // Preview: we only update the store on a step change (for the disco ball
      // color / mirror). Progress is no longer displayed, so we avoid
      // re-rendering the whole screen every 100 ms — otherwise renders pile up
      // and the app gradually slows down.
      (stepIndex) => {
        const light = useLightStore.getState();
        if (light.state.stepIndex !== stepIndex) light.setStepIndex(stepIndex);
      },
      () => reset()
    );
    if (settings.autoFullscreen) router.push("/mirror");
  };

  // Stop: we run the OFF mode on the light. The adoption effect above will
  // detect the active-mode change and stop the local preview.
  const handleStop = () => {
    vibrate();
    launch(MODE_OFF);
  };

  const currentProg = state.currentProgram
    ? (programs.find((p) => p.id === state.currentProgram) ?? null)
    : null;

  const currentStep = currentProg
    ? (currentProg.steps[state.stepIndex] ?? null)
    : null;

  // Favorites: the programs marked with a star.
  const favoritePrograms = programs.filter((p) => favorites.includes(p.name));

  // Recent: the 3 most recently launched programs from the app (recency rank).
  const recentPrograms = [...programs]
    .filter((p) => (p.lastRun ?? 0) > 0)
    .sort((a, b) => (b.lastRun ?? 0) - (a.lastRun ?? 0))
    .slice(0, 3);

  const renderCard = (p: Program) => (
    <ProgramCard
      key={p.id}
      program={{ ...p, pinned: favorites.includes(p.name) }}
      active={activeMode === p.name && activeMode !== MODE_OFF}
      onLaunch={() => handleLaunch(p.id)}
      onStop={handleStop}
      onOpen={() => router.push(`/program/${p.id}`)}
      onDuplicate={() => duplicate(p.id)}
      onDelete={() => remove(p.id)}
    />
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Decorative background */}
      <RayBackground />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ─────────────────────────────────── */}
        <View style={styles.header}>
          {/* Left spacer */}
          <View style={styles.leftSpacer} />

          {/* Centered title */}
          <View style={styles.titleCenter}>
            <Text style={styles.hello}>{t("home_hello")}</Text>
            <Text style={styles.firstName}>Benoit</Text>
          </View>

          {/* Settings button */}
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            style={styles.btnSettings}
            accessibilityLabel={t("home_open_settings_a11y")}
            accessibilityRole="button"
          >
            <GearIcon />
          </TouchableOpacity>
        </View>

        {/* Disco ball logo */}
        <View style={styles.logoContainer}>
          <DiscoBallLogo
            ref={discoBall}
            size={130}
            animated={settings.logoAnimation}
            activeLight={
              currentStep?.lights.find((l) => l !== "off") ??
              currentStep?.lights[0]
            }
          />
        </View>

        {/* Connection dot */}
        <ConnectionDot connection={state.connection} />

        {/* Error message */}
        {state.error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{state.error}</Text>
          </View>
        )}

        {/* ── Current mode (reported by the light) ───── */}
        <View style={styles.currentMode}>
          <Text style={styles.currentModeLabel}>{t("home_current_mode")}</Text>
          <Text style={styles.currentModeName} numberOfLines={1}>
            {activeMode ?? t("home_none")}
          </Text>
          {activeMode && activeMode !== MODE_OFF && (
            <TouchableOpacity
              onPress={handleStop}
              style={styles.btnStopTile}
              accessibilityLabel={t("home_stop_mode_a11y")}
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <StopIcon />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Favorites (only if there are any) ────────── */}
        {favoritePrograms.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t("home_favorites")}</Text>
            <View style={styles.programList}>
              {favoritePrograms.map(renderCard)}
            </View>
          </>
        )}

        {/* ── Recent (max 3, by last launch) ───── */}
        {recentPrograms.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t("home_recent")}</Text>
            <View style={styles.programList}>
              {recentPrograms.map(renderCard)}
            </View>
          </>
        )}

        {/* ── All programs ──────────────────────────── */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>{t("home_all_programs")}</Text>
          <TouchableOpacity
            onPress={() => {
              vibrate();
              load();
            }}
            disabled={loading}
            style={[styles.btnRefresh, loading && styles.btnRefreshActive]}
            accessibilityLabel={t("home_refresh_a11y")}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <RefreshIcon />
          </TouchableOpacity>
          <View style={styles.divider} />
          <Text style={styles.programCount}>{programs.length}</Text>
        </View>

        <View style={styles.programList}>
          {modesError && (
            <TouchableOpacity
              onPress={() => load()}
              style={styles.modesError}
              accessibilityLabel={t("home_retry_load_a11y")}
              accessibilityRole="button"
            >
              <Text style={styles.modesErrorText}>
                {modesError}{"\n"}{t("home_tap_retry")}
              </Text>
            </TouchableOpacity>
          )}
          {loading && programs.length === 0 ? (
            <Text style={styles.empty}>{t("home_loading")}</Text>
          ) : programs.length === 0 ? (
            !modesError && (
              <Text style={styles.empty}>
                {t("home_empty")}
              </Text>
            )
          ) : (
            programs.map(renderCard)
          )}
        </View>

        {/* ── Create button ─────────────────────────────── */}
        <TouchableOpacity
          onPress={() => {
            vibrate();
            router.push("/program/new");
          }}
          style={styles.btnCreate}
          accessibilityLabel={t("home_create_a11y")}
          accessibilityRole="button"
        >
          <Text style={styles.btnCreateText}>{t("home_create")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.screenBg },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  leftSpacer: { width: 40 },
  titleCenter: { flex: 1, alignItems: "center" },
  hello: { fontSize: 13, fontWeight: "500", color: colors.textSecondary },
  firstName: { fontSize: 28, fontWeight: "500", color: colors.textPrimary, letterSpacing: -0.5 },
  btnSettings: {
    width: 40,
    height: 40,
    backgroundColor: colors.secondarySurface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  // Logo
  logoContainer: { alignItems: "center" },

  // Error
  errorBanner: {
    backgroundColor: colors.destructive,
    borderRadius: radii.card,
    padding: spacing.sm,
  },
  errorText: { ...typo.body, color: colors.white, textAlign: "center" },

  // Current mode
  currentMode: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: spacing.sm,
  },
  currentModeLabel: { fontSize: 13, fontWeight: "500", color: colors.textSecondary },
  currentModeName: {
    flex: 1,
    textAlign: "right",
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  btnStopTile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.stop,
    alignItems: "center",
    justifyContent: "center",
  },

  // My programs
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionTitle: { fontSize: 17, fontWeight: "500", color: colors.textPrimary },
  btnRefresh: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondarySurface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  btnRefreshActive: { opacity: 0.5 },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  programCount: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  programList: { gap: spacing.sm },
  empty: { ...typo.bodySecondary, textAlign: "center", padding: spacing.md },
  modesError: {
    backgroundColor: colors.secondarySurface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.destructive,
    padding: spacing.md,
  },
  modesErrorText: {
    ...typo.bodySecondary,
    color: colors.destructive,
    textAlign: "center",
  },

  // Create
  btnCreate: {
    backgroundColor: colors.buttonBg,
    borderRadius: radii.standardButton,
    minHeight: touch.min,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  btnCreateText: { fontSize: 16, fontWeight: "500", color: colors.buttonText },
});
