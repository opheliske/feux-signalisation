import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import Svg, { Polygon, Rect } from "react-native-svg";
import CyclePreview from "./CyclePreview";
import {
  Program,
  colors,
  spacing,
  typo,
  formatDuration,
} from "../theme";
import { useT, lightsLabel } from "../i18n";

type Props = {
  program: Program;
  active?: boolean;
  onLaunch: () => void;
  onStop?: () => void;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

function shortSummary(program: Program, t: ReturnType<typeof useT>): string {
  if (program.steps.length === 0) return t("summary_no_steps");
  return program.steps
    .map((s) => `${lightsLabel(s.lights)} ${formatDuration(s.durationSeconds)}`)
    .join(" · ");
}

export default function ProgramCard({
  program,
  active = false,
  onLaunch,
  onStop,
  onOpen,
  onDuplicate,
  onDelete,
}: Props) {
  const t = useT();
  const [menuVisible, setMenuVisible] = useState(false);
  const summary = shortSummary(program, t);

  return (
    <>
      <TouchableOpacity
        onPress={onOpen}
        style={styles.card}
        accessibilityLabel={t("card_program_a11y", { name: program.name, summary })}
        accessibilityRole="button"
      >
        {/* Fixed badge */}
        <View style={styles.badge}>
          <Text style={styles.emoji}>🚦</Text>
        </View>

        {/* Content */}
        <View style={styles.body}>
          <View style={styles.header}>
            {program.pinned && (
              <Text style={styles.star}>⭐</Text>
            )}
            <Text style={styles.name} numberOfLines={1}>{program.name}</Text>
          </View>
          {program.steps.length > 0 ? (
            <CyclePreview steps={program.steps} showFooter={false} />
          ) : (
            <Text style={styles.summary} numberOfLines={2}>{t("summary_no_steps")}</Text>
          )}
        </View>

        {/* Play / stop button (depending on whether the mode is active on the light) */}
        <TouchableOpacity
          onPress={() => (active ? onStop?.() : onLaunch())}
          style={[styles.play, active && styles.playActive]}
          accessibilityLabel={
            active
              ? t("card_stop_a11y", { name: program.name })
              : t("card_launch_a11y", { name: program.name })
          }
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {active ? (
            <Svg width={12} height={12} viewBox="0 0 12 12">
              <Rect x={1} y={1} width={10} height={10} rx={2} fill={colors.stopText} />
            </Svg>
          ) : (
            <Svg width={14} height={14} viewBox="0 0 14 14">
              <Polygon points="4,3 13,7 4,11" fill={colors.buttonText} />
            </Svg>
          )}
        </TouchableOpacity>

        {/* Menu */}
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.btnMenu}
          accessibilityLabel={t("card_more_options")}
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.threeDots}>⋯</Text>
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
          style={styles.menuBackdrop}
          onPress={() => setMenuVisible(false)}
          activeOpacity={1}
        >
          <TouchableOpacity activeOpacity={1} style={styles.menuBox}>
            <Text style={styles.menuTitle}>{program.name}</Text>
            {[
              { id: "duplicate", label: t("common_duplicate"), action: () => { onDuplicate(); setMenuVisible(false); } },
              { id: "edit", label: t("common_edit"), action: () => { onOpen(); setMenuVisible(false); } },
              { id: "delete", label: t("common_delete"), action: () => { onDelete(); setMenuVisible(false); }, danger: true },
            ].map(({ id, label, action, danger }) => (
              <TouchableOpacity
                key={id}
                onPress={action}
                style={styles.menuItem}
                accessibilityLabel={label}
                accessibilityRole="button"
              >
                <Text style={[styles.menuItemText, danger && styles.danger]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.secondarySurface,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  emoji: { fontSize: 22 },
  body: { flex: 1, gap: 2 },
  header: { flexDirection: "row", alignItems: "center", gap: 4 },
  star: { fontSize: 12 },
  name: { fontSize: 14, fontWeight: "500", color: colors.textPrimary, flex: 1 },
  summary: { fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
  stats: { fontSize: 11, color: colors.textSoft },
  play: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.buttonBg,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  playActive: { backgroundColor: colors.stop },
  btnMenu: {
    width: 32,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  threeDots: { fontSize: 22, lineHeight: 22, color: colors.textSecondary },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  menuBox: {
    backgroundColor: colors.card,
    borderRadius: 14,
    overflow: "hidden",
  },
  menuTitle: { ...typo.titleMedium, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuItem: { padding: spacing.md, minHeight: 56, justifyContent: "center", borderBottomWidth: 1, borderBottomColor: colors.border },
  menuItemText: { ...typo.body },
  danger: { color: colors.destructive },
});
