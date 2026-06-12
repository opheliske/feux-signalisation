import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { couleurs } from "../theme";
import { demarrerHeartbeat, arreterHeartbeat } from "../services/feu";

export default function RootLayout() {
  useEffect(() => {
    demarrerHeartbeat();
    return () => arreterHeartbeat();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={couleurs.fondEcran} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: couleurs.fondEcran },
          headerTintColor: couleurs.textePrincipal,
          contentStyle: { backgroundColor: couleurs.fondEcran },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="programme/[id]"
          options={{ title: "Programme", headerBackTitle: "Retour" }}
        />
        <Stack.Screen
          name="reglages"
          options={{ title: "Réglages", headerBackTitle: "Retour" }}
        />
        <Stack.Screen
          name="miroir"
          options={{ headerShown: false, presentation: "fullScreenModal" }}
        />
        <Stack.Screen
          name="minuterie"
          options={{ title: "Minuterie", headerBackTitle: "Retour" }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
