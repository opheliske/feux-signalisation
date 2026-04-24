import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {
  EtatFeu,
  Programme,
  couleurs,
  rayons,
  espacements,
  typo,
  tactile,
  labelLampe,
} from "../theme";

type Props = {
  etat: EtatFeu;
  programme: Programme | null;
  onPause: () => void;
  onStop: () => void;
};

function formatMs(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m > 0) return `${m} min ${s < 10 ? "0" : ""}${s} s`;
  return `${s} s`;
}

export default function BlocEnLecture({ etat, programme, onPause, onStop }: Props) {
  const router = useRouter();
  const etapeActuelle =
    programme && etat.programmeEnCours
      ? (programme.etapes[etat.etapeIndex] ?? null)
      : null;
  const nbEtapes = programme?.etapes.length ?? 0;
  const enCours = etat.programmeEnCours !== null && programme !== null;
  const restantMinuterie =
    etat.finMinuterie !== null ? etat.finMinuterie - Date.now() : null;

  return (
    <View style={styles.bloc} accessibilityLabel="Programme en cours">
      {!enCours ? (
        <Text style={styles.neutre}>Aucun programme en cours</Text>
      ) : (
        <>
          <Text style={styles.nomProgramme} numberOfLines={1}>
            {programme!.nom}
          </Text>

          <Text style={styles.etapeLabel} accessibilityLiveRegion="polite">
            Étape {etat.etapeIndex + 1} sur {nbEtapes}
            {etapeActuelle ? ` — ${labelLampe[etapeActuelle.lampe]}` : ""}
          </Text>

          <View
            style={styles.progressionConteneur}
            accessibilityLabel={`Progression : ${Math.round(etat.progression * 100)} pourcent`}
          >
            <View
              style={[
                styles.progressionBarre,
                { width: `${etat.progression * 100}%` },
              ]}
            />
          </View>

          {restantMinuterie !== null && restantMinuterie > 0 && (
            <Text style={styles.minuterie} accessibilityLiveRegion="polite">
              ⏱ Arrêt dans {formatMs(restantMinuterie)}
            </Text>
          )}

          <View style={styles.controles}>
            <TouchableOpacity
              onPress={onPause}
              style={styles.btnControle}
              accessibilityLabel={etat.enPause ? "Reprendre le programme" : "Mettre en pause"}
              accessibilityRole="button"
            >
              <Text style={styles.btnTexte}>
                {etat.enPause ? "Reprendre" : "Pause"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onStop}
              style={[styles.btnControle, styles.btnStop]}
              accessibilityLabel="Arrêter le programme"
              accessibilityRole="button"
            >
              <Text style={styles.btnTexte}>Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/minuterie")}
              style={[styles.btnControle, styles.btnMinuterie]}
              accessibilityLabel="Programmer un arrêt automatique"
              accessibilityRole="button"
            >
              <Text style={[styles.btnTexte, { color: couleurs.textePrincipal }]}>⏱</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: {
    backgroundColor: couleurs.surfaceSecondaire,
    borderRadius: rayons.carteLarge,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espacements.md,
    gap: espacements.sm,
    minHeight: 80,
    justifyContent: "center",
  },
  neutre: {
    ...typo.corpsSecondaire,
    textAlign: "center",
    paddingVertical: espacements.sm,
  },
  nomProgramme: { ...typo.titreMoyen },
  etapeLabel: { ...typo.corps, textAlign: "center" },
  progressionConteneur: {
    height: 8,
    backgroundColor: couleurs.bordure,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressionBarre: {
    height: "100%",
    backgroundColor: couleurs.boutonFond,
    borderRadius: 4,
  },
  minuterie: {
    ...typo.petit,
    textAlign: "center",
    color: couleurs.texteSecondaire,
  },
  controles: { flexDirection: "row", gap: espacements.sm },
  btnControle: {
    flex: 1,
    minHeight: tactile.min,
    backgroundColor: couleurs.boutonFond,
    borderRadius: rayons.boutonStandard,
    alignItems: "center",
    justifyContent: "center",
  },
  btnStop: { backgroundColor: couleurs.destructif },
  btnMinuterie: {
    flex: 0,
    width: tactile.min,
    backgroundColor: couleurs.surfaceSecondaire,
    borderWidth: 1,
    borderColor: couleurs.bordure,
  },
  btnTexte: { ...typo.bouton, color: couleurs.boutonTexte },
});
