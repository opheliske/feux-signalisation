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
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useProgrammesStore } from "../../stores/useProgrammesStore";
import { useReglagesStore } from "../../stores/useReglagesStore";
import SelecteurDuree from "../../components/SelecteurDuree";
import SelecteurLampe from "../../components/SelecteurLampe";
import ApercuCycle from "../../components/ApercuCycle";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import Confettis, { ConfettisRef } from "../../components/Confettis";
import {
  Lampe,
  Etape,
  Programme,
  couleurs,
  rayons,
  espacements,
  typo,
  tactile,
  libelleLampes,
  couleurPastille,
} from "../../theme";

function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export default function EcranProgramme() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { programmes, creer, mettreAJour, supprimer, dupliquer } =
    useProgrammesStore();
  const { reglages } = useReglagesStore();
  const confettisRef = useRef<ConfettisRef>(null);

  const estNouveau = id === "new";
  const programmeExistant = !estNouveau
    ? (programmes.find((p) => p.id === id) ?? null)
    : null;

  const [nom, setNom] = useState(programmeExistant?.nom ?? "");
  const [etapes, setEtapes] = useState<Etape[]>(
    programmeExistant?.etapes ?? []
  );

  const [indexEditionLampes, setIndexEditionLampes] = useState<number | null>(
    null
  );
  const [ajoutLampes, setAjoutLampes] = useState(false);
  const [indexDuree, setIndexDuree] = useState<number | null>(null);
  const [showConfirmSuppr, setShowConfirmSuppr] = useState(false);
  const [showConfirmAnnuler, setShowConfirmAnnuler] = useState(false);

  const vibrer = () => {
    if (reglages.vibrations) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const aDesModifs = (): boolean => {
    if (!programmeExistant)
      return nom !== "" || etapes.length > 0;
    return (
      nom !== programmeExistant.nom ||
      JSON.stringify(etapes) !== JSON.stringify(programmeExistant.etapes)
    );
  };

  const handleEnregistrer = () => {
    vibrer();
    const nomFinal = nom.trim() || "Programme sans nom";
    if (estNouveau) {
      const nouveau: Programme = {
        id: genId(),
        nom: nomFinal,
        etapes,
        epingle: false,
        nbLancements: 0,
        creeA: Date.now(),
        modifieA: Date.now(),
      };
      creer(nouveau);
    } else if (programmeExistant) {
      mettreAJour(programmeExistant.id, { nom: nomFinal, etapes });
    }
    confettisRef.current?.lancer();
    setTimeout(() => router.back(), 600);
  };

  const handleSupprimer = () => {
    if (!programmeExistant) return;
    supprimer(programmeExistant.id);
    router.back();
  };

  const handleDupliquer = () => {
    if (!programmeExistant) return;
    vibrer();
    dupliquer(programmeExistant.id);
    router.back();
  };

  const handleAnnuler = () => {
    if (aDesModifs()) {
      setShowConfirmAnnuler(true);
    } else {
      router.back();
    }
  };

  const ajouterEtape = (lampes: Lampe[]) => {
    if (lampes.length === 0) return;
    setEtapes((prev) => [
      ...prev,
      { id: genId(), lampes, dureeSecondes: 3 },
    ]);
    setAjoutLampes(false);
  };

  const modifierLampes = (index: number, lampes: Lampe[]) => {
    if (lampes.length === 0) return;
    setEtapes((prev) =>
      prev.map((e, i) => (i === index ? { ...e, lampes } : e))
    );
    setIndexEditionLampes(null);
  };

  const modifierDuree = (index: number, duree: number) => {
    setEtapes((prev) =>
      prev.map((e, i) => (i === index ? { ...e, dureeSecondes: duree } : e))
    );
  };

  const supprimerEtape = (index: number) => {
    vibrer();
    setEtapes((prev) => prev.filter((_, i) => i !== index));
  };

  const monterEtape = (index: number) => {
    if (index === 0) return;
    vibrer();
    setEtapes((prev) => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  };

  const descendreEtape = (index: number) => {
    if (index === etapes.length - 1) return;
    vibrer();
    setEtapes((prev) => {
      const copy = [...prev];
      [copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
      return copy;
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Nom */}
        <View style={styles.section}>
          <Text style={styles.label}>Nom du programme</Text>
          <TextInput
            value={nom}
            onChangeText={setNom}
            placeholder="Ex : Vert tranquille"
            placeholderTextColor={couleurs.texteSecondaire}
            style={styles.input}
            accessibilityLabel="Nom du programme"
            returnKeyType="done"
          />
        </View>

        {/* Étapes */}
        <View style={styles.section}>
          <Text style={styles.label}>Étapes</Text>

          {etapes.length === 0 && (
            <Text style={styles.vide}>Aucune étape. Ajoute-en une !</Text>
          )}

          {etapes.map((etape, i) => (
            <View key={etape.id} style={styles.carteEtape}>
              <Text style={styles.numEtape}>{i + 1}</Text>
              <TouchableOpacity
                onPress={() => {
                  vibrer();
                  setIndexEditionLampes(i);
                }}
                style={styles.zoneLampes}
                accessibilityLabel={`Modifier les lampes de l'étape ${i + 1}, actuellement ${libelleLampes(etape.lampes)}`}
                accessibilityRole="button"
              >
                <View style={styles.pastilles}>
                  {etape.lampes.map((l) => (
                    <View
                      key={l}
                      style={[
                        styles.pastilleEtape,
                        { backgroundColor: couleurPastille(l) },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.nomLampe} numberOfLines={1}>
                  {libelleLampes(etape.lampes)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIndexDuree(i)}
                style={styles.btnDuree}
                accessibilityLabel={`Modifier la durée de l'étape ${i + 1}, actuellement ${etape.dureeSecondes} secondes`}
                accessibilityRole="button"
              >
                <Text style={styles.dureeTexte}>{etape.dureeSecondes} s</Text>
              </TouchableOpacity>

              <View style={styles.reordonne}>
                <TouchableOpacity
                  onPress={() => monterEtape(i)}
                  disabled={i === 0}
                  style={[styles.btnOrdre, i === 0 && styles.btnOrdreDesactive]}
                  accessibilityLabel={`Monter l'étape ${i + 1}`}
                  accessibilityRole="button"
                >
                  <Text style={styles.fleche}>↑</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => descendreEtape(i)}
                  disabled={i === etapes.length - 1}
                  style={[
                    styles.btnOrdre,
                    i === etapes.length - 1 && styles.btnOrdreDesactive,
                  ]}
                  accessibilityLabel={`Descendre l'étape ${i + 1}`}
                  accessibilityRole="button"
                >
                  <Text style={styles.fleche}>↓</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => supprimerEtape(i)}
                style={styles.btnSupprEtape}
                accessibilityLabel={`Supprimer l'étape ${i + 1}`}
                accessibilityRole="button"
              >
                <Text style={styles.supprTexte}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => {
              vibrer();
              setAjoutLampes(true);
            }}
            style={styles.btnAjouter}
            accessibilityLabel="Ajouter une étape"
            accessibilityRole="button"
          >
            <Text style={styles.btnAjouterTexte}>+ Ajouter une étape</Text>
          </TouchableOpacity>
        </View>

        {etapes.length > 0 && <ApercuCycle etapes={etapes} />}
      </ScrollView>

      {/* Barre d'actions */}
      <View style={styles.barreActions}>
        <TouchableOpacity
          onPress={handleAnnuler}
          style={styles.btnAnnuler}
          accessibilityLabel="Annuler les modifications"
          accessibilityRole="button"
        >
          <Text style={styles.btnAnnulerTexte}>Annuler</Text>
        </TouchableOpacity>
        {!estNouveau && (
          <TouchableOpacity
            onPress={handleDupliquer}
            style={styles.btnDupliquer}
            accessibilityLabel="Dupliquer le programme"
            accessibilityRole="button"
          >
            <Text style={styles.btnDupliquerTexte}>Dupliquer</Text>
          </TouchableOpacity>
        )}
        {!estNouveau && (
          <TouchableOpacity
            onPress={() => {
              vibrer();
              setShowConfirmSuppr(true);
            }}
            style={styles.btnSupprProg}
            accessibilityLabel="Supprimer le programme"
            accessibilityRole="button"
          >
            <Text style={styles.btnSupprProgTexte}>Supprimer</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleEnregistrer}
          style={styles.btnEnregistrer}
          accessibilityLabel="Enregistrer le programme"
          accessibilityRole="button"
        >
          <Text style={styles.btnEnregistrerTexte}>Enregistrer</Text>
        </TouchableOpacity>
      </View>

      {/* Confettis */}
      <Confettis ref={confettisRef} />

      {/* Modal : ajouter une étape (sélection de lampes) */}
      <Modal
        visible={ajoutLampes}
        transparent
        animationType="slide"
        onRequestClose={() => setAjoutLampes(false)}
        accessibilityViewIsModal
      >
        <TouchableOpacity
          style={styles.fondModal}
          onPress={() => setAjoutLampes(false)}
          accessibilityLabel="Fermer le sélecteur"
          activeOpacity={1}
        >
          <TouchableOpacity activeOpacity={1} style={styles.feuilleModal}>
            <Text style={styles.titreModal}>Choisir les lampes</Text>
            <SelecteurLampe onValider={ajouterEtape} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal : modifier les lampes d'une étape existante */}
      <Modal
        visible={indexEditionLampes !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setIndexEditionLampes(null)}
        accessibilityViewIsModal
      >
        <TouchableOpacity
          style={styles.fondModal}
          onPress={() => setIndexEditionLampes(null)}
          accessibilityLabel="Fermer le sélecteur"
          activeOpacity={1}
        >
          <TouchableOpacity activeOpacity={1} style={styles.feuilleModal}>
            <Text style={styles.titreModal}>Modifier les lampes</Text>
            {indexEditionLampes !== null && (
              <SelecteurLampe
                selectionInitiale={etapes[indexEditionLampes]?.lampes ?? []}
                onValider={(lampes) =>
                  modifierLampes(indexEditionLampes, lampes)
                }
              />
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal : modifier la durée */}
      <Modal
        visible={indexDuree !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setIndexDuree(null)}
        accessibilityViewIsModal
      >
        <TouchableOpacity
          style={styles.fondModal}
          onPress={() => setIndexDuree(null)}
          accessibilityLabel="Fermer le sélecteur de durée"
          activeOpacity={1}
        >
          <View style={styles.feuilleModal}>
            <Text style={styles.titreModal}>Durée de l'étape</Text>
            {indexDuree !== null && (
              <SelecteurDuree
                valeur={etapes[indexDuree]?.dureeSecondes ?? 3}
                onChange={(v) => modifierDuree(indexDuree, v)}
              />
            )}
            <TouchableOpacity
              onPress={() => setIndexDuree(null)}
              style={styles.btnFermer}
              accessibilityLabel="Valider la durée"
              accessibilityRole="button"
            >
              <Text style={styles.btnFermerTexte}>OK</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ConfirmationDialog
        visible={showConfirmSuppr}
        message="Tu veux vraiment supprimer ce programme ?"
        labelAnnuler="Non, garder"
        labelConfirmer="Oui, supprimer"
        onAnnuler={() => setShowConfirmSuppr(false)}
        onConfirmer={handleSupprimer}
      />

      <ConfirmationDialog
        visible={showConfirmAnnuler}
        message="Tu veux vraiment annuler les modifications ?"
        labelAnnuler="Non, continuer"
        labelConfirmer="Oui, annuler"
        onAnnuler={() => setShowConfirmAnnuler(false)}
        onConfirmer={() => {
          setShowConfirmAnnuler(false);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: couleurs.fondEcran },
  scroll: {
    padding: espacements.md,
    gap: espacements.md,
    paddingBottom: 140,
  },
  section: { gap: espacements.sm },
  label: { ...typo.titreMoyen },
  input: {
    backgroundColor: couleurs.carte,
    borderRadius: rayons.boutonStandard,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espacements.md,
    ...typo.corps,
    minHeight: tactile.min,
  },
  vide: {
    ...typo.corpsSecondaire,
    textAlign: "center",
    padding: espacements.md,
  },
  carteEtape: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: couleurs.carte,
    borderRadius: rayons.carte,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espacements.sm,
    gap: espacements.xs,
    minHeight: tactile.min,
  },
  numEtape: {
    ...typo.titreMoyen,
    width: 22,
    textAlign: "center",
    flexShrink: 0,
  },
  pastilleEtape: { width: 20, height: 20, borderRadius: 10, flexShrink: 0 },
  pastilles: { flexDirection: "row", gap: 4, flexShrink: 0 },
  zoneLampes: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: espacements.xs,
    minHeight: tactile.min - 8,
  },
  nomLampe: { ...typo.corps, flex: 1 },
  btnDuree: {
    backgroundColor: couleurs.surfaceSecondaire,
    borderRadius: rayons.boutonStandard,
    paddingHorizontal: espacements.sm,
    paddingVertical: espacements.xs,
    minWidth: 52,
    alignItems: "center",
    minHeight: 36,
    justifyContent: "center",
  },
  dureeTexte: { ...typo.corps },
  reordonne: { flexDirection: "column", flexShrink: 0 },
  btnOrdre: {
    width: 32,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  btnOrdreDesactive: { opacity: 0.2 },
  fleche: { fontSize: 16 },
  btnSupprEtape: {
    width: tactile.min,
    height: tactile.min,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  supprTexte: { fontSize: 18, color: couleurs.destructif },
  btnAjouter: {
    borderWidth: 1.5,
    borderColor: couleurs.boutonFond,
    borderRadius: rayons.boutonStandard,
    minHeight: tactile.min,
    alignItems: "center",
    justifyContent: "center",
    padding: espacements.md,
  },
  btnAjouterTexte: { ...typo.bouton, color: couleurs.boutonFond },
  barreActions: {
    flexDirection: "row",
    padding: espacements.md,
    gap: espacements.xs,
    backgroundColor: couleurs.fondEcran,
    borderTopWidth: 1,
    borderTopColor: couleurs.bordure,
  },
  btnAnnuler: {
    flex: 1,
    minHeight: tactile.min,
    borderRadius: rayons.boutonStandard,
    borderWidth: 1,
    borderColor: couleurs.boutonFond,
    alignItems: "center",
    justifyContent: "center",
  },
  btnAnnulerTexte: { ...typo.bouton, color: couleurs.boutonFond },
  btnDupliquer: {
    flex: 1,
    minHeight: tactile.min,
    borderRadius: rayons.boutonStandard,
    borderWidth: 1,
    borderColor: couleurs.texteSecondaire,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDupliquerTexte: { ...typo.bouton, color: couleurs.texteSecondaire },
  btnSupprProg: {
    flex: 1,
    minHeight: tactile.min,
    borderRadius: rayons.boutonStandard,
    borderWidth: 1.5,
    borderColor: couleurs.destructif,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSupprProgTexte: { ...typo.bouton, color: couleurs.destructif },
  btnEnregistrer: {
    flex: 1,
    minHeight: tactile.min,
    borderRadius: rayons.boutonStandard,
    backgroundColor: couleurs.boutonFond,
    alignItems: "center",
    justifyContent: "center",
  },
  btnEnregistrerTexte: { ...typo.bouton, color: couleurs.boutonTexte },
  fondModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: espacements.lg,
  },
  feuilleModal: {
    backgroundColor: couleurs.fondEcran,
    borderRadius: rayons.conteneur,
    padding: espacements.lg,
    gap: espacements.md,
    overflow: "hidden",
  },
  titreModal: { ...typo.titre, textAlign: "center" },
  btnFermer: {
    backgroundColor: couleurs.boutonFond,
    borderRadius: rayons.boutonStandard,
    minHeight: tactile.min,
    alignItems: "center",
    justifyContent: "center",
  },
  btnFermerTexte: { ...typo.bouton, color: couleurs.boutonTexte },
});
