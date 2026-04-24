import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Modal,
  TextInput,
  StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { usePlanningStore } from "../stores/usePlanningStore";
import { useProgrammesStore } from "../stores/useProgrammesStore";
import { useReglagesStore } from "../stores/useReglagesStore";
import {
  planifierDeclencheur,
  annulerDeclencheur,
} from "../services/planificateur";
import {
  DeclencheurPlanifie,
  couleurs,
  rayons,
  espacements,
  typo,
  tactile,
} from "../theme";

type Jour = DeclencheurPlanifie["jours"][number];

const JOURS: { clé: Jour; label: string }[] = [
  { clé: "lun", label: "L" },
  { clé: "mar", label: "M" },
  { clé: "mer", label: "Me" },
  { clé: "jeu", label: "J" },
  { clé: "ven", label: "V" },
  { clé: "sam", label: "S" },
  { clé: "dim", label: "D" },
];

function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function nomJours(jours: Jour[]): string {
  if (jours.length === 7) return "Tous les jours";
  if (jours.length === 0) return "Aucun jour";
  return jours.map((j) => JOURS.find((x) => x.clé === j)?.label ?? j).join(" ");
}

function validerHeure(v: string): boolean {
  return /^\d{1,2}:\d{2}$/.test(v);
}

export default function Planning() {
  const { declencheurs, ajouter, mettreAJour, supprimer, setActif } =
    usePlanningStore();
  const { programmes } = useProgrammesStore();
  const { reglages } = useReglagesStore();
  const insets = useSafeAreaInsets();

  const [formVisible, setFormVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [programmeId, setProgrammeId] = useState(programmes[0]?.id ?? "");
  const [heure, setHeure] = useState("08:00");
  const [jours, setJours] = useState<Jour[]>(["lun", "mar", "mer", "jeu", "ven"]);
  const [localActif, setLocalActif] = useState(true);

  const vibrer = () => {
    if (reglages.vibrations) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const ouvrirAjout = () => {
    vibrer();
    setEditId(null);
    setProgrammeId(programmes[0]?.id ?? "");
    setHeure("08:00");
    setJours(["lun", "mar", "mer", "jeu", "ven"]);
    setLocalActif(true);
    setFormVisible(true);
  };

  const ouvrirEdit = (d: DeclencheurPlanifie) => {
    vibrer();
    setEditId(d.id);
    setProgrammeId(d.programmeId);
    setHeure(d.heure);
    setJours([...d.jours]);
    setLocalActif(d.actif);
    setFormVisible(true);
  };

  const toggleJour = (j: Jour) => {
    setJours((prev) =>
      prev.includes(j) ? prev.filter((x) => x !== j) : [...prev, j]
    );
  };

  const handleEnregistrer = () => {
    if (!programmeId || !validerHeure(heure) || jours.length === 0) return;
    vibrer();
    const prog = programmes.find((p) => p.id === programmeId);
    if (!prog) return;

    if (editId) {
      annulerDeclencheur(editId).catch(() => {});
      mettreAJour(editId, { programmeId, heure, jours, actif: localActif });
      if (localActif) {
        planifierDeclencheur(
          { id: editId, programmeId, heure, jours, actif: localActif },
          prog
        ).catch(() => {});
      }
    } else {
      const nouveau: DeclencheurPlanifie = {
        id: genId(),
        programmeId,
        heure,
        jours,
        actif: localActif,
      };
      ajouter(nouveau);
      if (localActif) planifierDeclencheur(nouveau, prog).catch(() => {});
    }
    setFormVisible(false);
  };

  const handleSupprimer = (id: string) => {
    vibrer();
    annulerDeclencheur(id).catch(() => {});
    supprimer(id);
  };

  const handleToggleActif = (id: string, val: boolean) => {
    vibrer();
    setActif(id, val);
    const d = declencheurs.find((x) => x.id === id);
    if (!d) return;
    const prog = programmes.find((p) => p.id === d.programmeId);
    if (!prog) return;
    if (val) {
      planifierDeclencheur({ ...d, actif: true }, prog).catch(() => {});
    } else {
      annulerDeclencheur(id).catch(() => {});
    }
  };

  const peutEnregistrer =
    !!programmeId && validerHeure(heure) && jours.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {declencheurs.length === 0 && (
          <Text style={styles.vide}>Aucune alarme programmée.</Text>
        )}
        {declencheurs.map((d) => {
          const nomProg =
            programmes.find((p) => p.id === d.programmeId)?.nom ??
            "Programme inconnu";
          return (
            <View
              key={d.id}
              style={[styles.carte, !d.actif && styles.carteInactive]}
            >
              <TouchableOpacity
                onPress={() => ouvrirEdit(d)}
                style={styles.carteCorps}
                accessibilityLabel={`Modifier : ${nomProg} à ${d.heure}`}
                accessibilityRole="button"
              >
                <Text style={styles.heure}>{d.heure}</Text>
                <View style={styles.infos}>
                  <Text style={styles.nomProg} numberOfLines={1}>
                    {nomProg}
                  </Text>
                  <Text style={styles.joursTexte}>{nomJours(d.jours)}</Text>
                </View>
              </TouchableOpacity>
              <Switch
                value={d.actif}
                onValueChange={(v) => handleToggleActif(d.id, v)}
                thumbColor={couleurs.boutonTexte}
                trackColor={{
                  false: couleurs.bordure,
                  true: couleurs.boutonFond,
                }}
                accessibilityLabel={
                  d.actif ? "Désactiver l'alarme" : "Activer l'alarme"
                }
              />
              <TouchableOpacity
                onPress={() => handleSupprimer(d.id)}
                style={styles.btnSup}
                accessibilityLabel="Supprimer l'alarme"
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.supTexte}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <View
        style={[
          styles.pied,
          { paddingBottom: Math.max(insets.bottom, espacements.md) },
        ]}
      >
        <TouchableOpacity
          onPress={ouvrirAjout}
          style={styles.btnAjouter}
          accessibilityLabel="Ajouter une alarme"
          accessibilityRole="button"
        >
          <Text style={styles.btnAjouterTexte}>+ Ajouter une alarme</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={formVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFormVisible(false)}
        accessibilityViewIsModal
      >
        <TouchableOpacity
          style={styles.fond}
          onPress={() => setFormVisible(false)}
          activeOpacity={1}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.boite,
              { paddingBottom: Math.max(insets.bottom, espacements.lg) },
            ]}
          >
            <Text style={styles.titreModal}>
              {editId ? "Modifier l'alarme" : "Nouvelle alarme"}
            </Text>

            <Text style={styles.label}>Programme</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.progScrollContent}
            >
              {programmes.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setProgrammeId(p.id)}
                  style={[
                    styles.chipProg,
                    programmeId === p.id && styles.chipProgSel,
                  ]}
                  accessibilityLabel={`Programme ${p.nom}${programmeId === p.id ? ", sélectionné" : ""}`}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.chipProgTexte,
                      programmeId === p.id && styles.chipProgTexteSel,
                    ]}
                    numberOfLines={1}
                  >
                    {p.nom}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Heure</Text>
            <TextInput
              value={heure}
              onChangeText={setHeure}
              placeholder="08:00"
              placeholderTextColor={couleurs.texteSecondaire}
              style={[
                styles.inputHeure,
                !validerHeure(heure) && styles.inputErreur,
              ]}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              accessibilityLabel="Heure de déclenchement"
            />

            <Text style={styles.label}>Jours</Text>
            <View style={styles.joursLigne}>
              {JOURS.map(({ clé, label }) => (
                <TouchableOpacity
                  key={clé}
                  onPress={() => toggleJour(clé)}
                  style={[
                    styles.jourPuce,
                    jours.includes(clé) && styles.jourPuceSel,
                  ]}
                  accessibilityLabel={`${label}${jours.includes(clé) ? ", sélectionné" : ""}`}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.jourTexte,
                      jours.includes(clé) && styles.jourTexteSel,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.ligneActif}>
              <Text style={styles.labelRangee}>Activer maintenant</Text>
              <Switch
                value={localActif}
                onValueChange={setLocalActif}
                thumbColor={couleurs.boutonTexte}
                trackColor={{
                  false: couleurs.bordure,
                  true: couleurs.boutonFond,
                }}
              />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => setFormVisible(false)}
                style={styles.btnCancel}
                accessibilityLabel="Annuler"
                accessibilityRole="button"
              >
                <Text style={styles.btnCancelTexte}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEnregistrer}
                style={[
                  styles.btnSauvegarder,
                  !peutEnregistrer && styles.btnDesactive,
                ]}
                disabled={!peutEnregistrer}
                accessibilityLabel="Enregistrer l'alarme"
                accessibilityRole="button"
              >
                <Text style={styles.btnSauvegarderTexte}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: couleurs.fondEcran },
  scroll: {
    padding: espacements.md,
    gap: espacements.sm,
    paddingBottom: espacements.xxl,
  },
  vide: {
    ...typo.corpsSecondaire,
    textAlign: "center",
    padding: espacements.md,
  },
  carte: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: couleurs.carte,
    borderRadius: rayons.carte,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espacements.sm,
    gap: espacements.sm,
    minHeight: tactile.min,
  },
  carteInactive: { opacity: 0.5 },
  carteCorps: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: espacements.sm,
  },
  heure: { ...typo.titreLarge, minWidth: 58 },
  infos: { flex: 1, gap: 2 },
  nomProg: { ...typo.corps },
  joursTexte: { ...typo.petit },
  btnSup: {
    width: tactile.min,
    height: tactile.min,
    alignItems: "center",
    justifyContent: "center",
  },
  supTexte: { fontSize: 18, color: couleurs.destructif },
  pied: {
    padding: espacements.md,
    backgroundColor: couleurs.fondEcran,
    borderTopWidth: 1,
    borderTopColor: couleurs.bordure,
  },
  btnAjouter: {
    backgroundColor: couleurs.boutonFond,
    borderRadius: rayons.boutonStandard,
    minHeight: tactile.min,
    alignItems: "center",
    justifyContent: "center",
    padding: espacements.md,
  },
  btnAjouterTexte: { ...typo.bouton, color: couleurs.boutonTexte },
  fond: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: espacements.lg,
  },
  boite: {
    backgroundColor: couleurs.fondEcran,
    borderRadius: rayons.conteneur,
    padding: espacements.lg,
    gap: espacements.sm,
  },
  titreModal: { ...typo.titre, textAlign: "center" },
  label: { ...typo.titreMoyen },
  progScrollContent: {
    flexDirection: "row",
    gap: espacements.sm,
    paddingVertical: espacements.xs,
  },
  chipProg: {
    backgroundColor: couleurs.carte,
    borderRadius: rayons.boutonStandard,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    paddingHorizontal: espacements.md,
    paddingVertical: espacements.sm,
    minHeight: 40,
    justifyContent: "center",
    maxWidth: 160,
  },
  chipProgSel: {
    backgroundColor: couleurs.boutonFond,
    borderColor: couleurs.boutonFond,
  },
  chipProgTexte: { ...typo.corps },
  chipProgTexteSel: { color: couleurs.boutonTexte },
  inputHeure: {
    backgroundColor: couleurs.carte,
    borderRadius: rayons.boutonStandard,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espacements.md,
    ...typo.titreMoyen,
    minHeight: tactile.min,
    textAlign: "center",
  },
  inputErreur: { borderColor: couleurs.destructif },
  joursLigne: {
    flexDirection: "row",
    gap: espacements.xs,
  },
  jourPuce: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: couleurs.carte,
    borderWidth: 1,
    borderColor: couleurs.bordure,
  },
  jourPuceSel: {
    backgroundColor: couleurs.boutonFond,
    borderColor: couleurs.boutonFond,
  },
  jourTexte: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: couleurs.textePrincipal,
  },
  jourTexteSel: { color: couleurs.boutonTexte },
  ligneActif: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: couleurs.carte,
    borderRadius: rayons.carte,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espacements.md,
    minHeight: tactile.min,
  },
  labelRangee: { ...typo.corps },
  actions: {
    flexDirection: "row",
    gap: espacements.sm,
    marginTop: espacements.xs,
  },
  btnCancel: {
    flex: 1,
    minHeight: tactile.min,
    borderRadius: rayons.boutonStandard,
    borderWidth: 1,
    borderColor: couleurs.boutonFond,
    alignItems: "center",
    justifyContent: "center",
  },
  btnCancelTexte: { ...typo.bouton, color: couleurs.boutonFond },
  btnSauvegarder: {
    flex: 1,
    minHeight: tactile.min,
    borderRadius: rayons.boutonStandard,
    backgroundColor: couleurs.boutonFond,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDesactive: { opacity: 0.4 },
  btnSauvegarderTexte: { ...typo.bouton, color: couleurs.boutonTexte },
});
