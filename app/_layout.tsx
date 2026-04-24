import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { couleurs } from "../theme";
import { demarrerHeartbeat, arreterHeartbeat } from "../services/feu";
import { configurerRecepteurNotifications } from "../services/planificateur";
import { useFeuStore } from "../stores/useFeuStore";
import { useProgrammesStore } from "../stores/useProgrammesStore";
import { lancerProgramme } from "../services/moteurLecture";

export default function RootLayout() {
  useEffect(() => {
    demarrerHeartbeat();

    configurerRecepteurNotifications((programmeId) => {
      const { programmes } = useProgrammesStore.getState();
      const prog = programmes.find((p) => p.id === programmeId);
      if (!prog || prog.etapes.length === 0) return;

      const feu = useFeuStore.getState();
      feu.setAllume(true);
      feu.setProgrammeEnCours(programmeId);
      feu.setEtapeIndex(0);
      feu.setProgression(0);
      feu.setEnPause(false);

      lancerProgramme(
        prog,
        (etapeIndex, progression) => {
          useFeuStore.getState().setEtapeIndex(etapeIndex);
          useFeuStore.getState().setProgression(progression);
        },
        () => {
          useFeuStore.getState().reset();
        }
      );
    });

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
        <Stack.Screen
          name="planning"
          options={{ title: "Planning", headerBackTitle: "Retour" }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
