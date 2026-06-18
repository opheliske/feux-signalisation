import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { colors } from "../theme";
import { startHeartbeat, stopHeartbeat } from "../services/light";
import { useT } from "../i18n";

export default function RootLayout() {
  const t = useT();
  useEffect(() => {
    startHeartbeat();
    return () => stopHeartbeat();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={colors.screenBg} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.screenBg },
          headerTintColor: colors.textPrimary,
          contentStyle: { backgroundColor: colors.screenBg },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="program/[id]"
          options={{ title: t("nav_program"), headerBackTitle: t("common_back") }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: t("nav_settings"), headerBackTitle: t("common_back") }}
        />
        <Stack.Screen
          name="mirror"
          options={{ headerShown: false, presentation: "fullScreenModal" }}
        />
        <Stack.Screen
          name="timer"
          options={{ title: t("nav_timer"), headerBackTitle: t("common_back") }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
