import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Svg, { Rect, Circle, Polygon, Path } from "react-native-svg";
import LogoBouleDisco from "../components/LogoBouleDisco";
import type { LogoBouleDisco as LogoRef } from "../components/LogoBouleDisco";
import BlocEnLecture from "../components/BlocEnLecture";
import CarteProgramme from "../components/CarteProgramme";
import PastilleConnexion from "../components/PastilleConnexion";
import FondRayons from "../components/FondRayons";
import EtatVideProgramme from "../components/EtatVideProgramme";
import { useProgrammesStore } from "../stores/useProgrammesStore";
import { useFeuStore } from "../stores/useFeuStore";
import { useReglagesStore } from "../stores/useReglagesStore";
import { couleurs, espacements, rayons, typo, tactile } from "../theme";
import { allumerFeu, eteindreFeu, configurerIP } from "../services/feu";
import {
  lancerProgramme,
  arreterMoteur,
  pauseMoteur,
  reprendreMoteur,
} from "../services/moteurLecture";

function IconeEngrenage() {
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

function PictogramFeu() {
  return (
    <Svg width={18} height={22} viewBox="0 0 18 22">
      <Rect x={2} y={2} width={14} height={18} rx={4} fill="#1F1400" />
      <Circle cx={9} cy={6.5} r={2.2} fill="#E24B4A" />
      <Circle cx={9} cy={11} r={2.2} fill="#FF9500" />
      <Circle cx={9} cy={15.5} r={2.2} fill="#7ACB2B" />
    </Svg>
  );
}

function PlayIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Polygon points="4,3 13,7 4,11" fill="#FFD60A" />
    </Svg>
  );
}

export default function Accueil() {
  const router = useRouter();
  const bouleDisco = useRef<LogoRef>(null);

  const { programmes, supprimer, dupliquer, incrementerLancements } =
    useProgrammesStore();
  const {
    etat,
    setAllume,
    setProgrammeEnCours,
    setEtapeIndex,
    setProgression,
    setEnPause,
    setDernierProgrammeLanceId,
    reset,
  } = useFeuStore();
  const { reglages } = useReglagesStore();

  useEffect(() => {
    configurerIP(reglages.ipFeu);
  }, [reglages.ipFeu]);

  const vibrer = () => {
    if (reglages.vibrations)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleAllumer = () => {
    vibrer();
    setAllume(true);
    allumerFeu().catch(() => {});
  };

  const handleEteindre = () => {
    vibrer();
    arreterMoteur();
    reset();
    eteindreFeu().catch(() => {});
  };

  const handleLancer = (id: string) => {
    vibrer();
    const prog = programmes.find((p) => p.id === id);
    if (!prog || prog.etapes.length === 0) return;
    if (!etat.allume) {
      setAllume(true);
      allumerFeu().catch(() => {});
    }
    setProgrammeEnCours(id);
    setEtapeIndex(0);
    setProgression(0);
    setEnPause(false);
    setDernierProgrammeLanceId(id);
    incrementerLancements(id);
    bouleDisco.current?.exploser();
    lancerProgramme(
      prog,
      (etapeIndex, progression) => {
        setEtapeIndex(etapeIndex);
        setProgression(progression);
      },
      () => reset()
    );
    if (reglages.pleinEcranAuto) router.push("/miroir");
  };

  const handlePause = () => {
    vibrer();
    if (etat.enPause) {
      reprendreMoteur();
      setEnPause(false);
    } else {
      pauseMoteur();
      setEnPause(true);
    }
  };

  const handleStop = () => {
    vibrer();
    arreterMoteur();
    reset();
  };

  const progEnCours = etat.programmeEnCours
    ? (programmes.find((p) => p.id === etat.programmeEnCours) ?? null)
    : null;

  const etapeActuelle = progEnCours
    ? (progEnCours.etapes[etat.etapeIndex] ?? null)
    : null;

  const dernierProg =
    !etat.programmeEnCours && etat.dernierProgrammeLanceId
      ? (programmes.find((p) => p.id === etat.dernierProgrammeLanceId) ?? null)
      : null;

  const programmesAffiches = [...programmes].sort(
    (a, b) => b.nbLancements - a.nbLancements
  );
  const favorisIds = new Set(
    programmesAffiches
      .filter((p) => p.nbLancements > 0)
      .slice(0, 2)
      .map((p) => p.id)
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Fond décoratif */}
      <FondRayons />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── En-tête ─────────────────────────────────── */}
        <View style={styles.entete}>
          {/* Spacer gauche */}
          <View style={styles.spacerGauche} />

          {/* Titre centré */}
          <View style={styles.titreCentre}>
            <Text style={styles.bonjour}>Bonjour</Text>
            <Text style={styles.prenom}>Benoit</Text>
          </View>

          {/* Bouton réglages */}
          <TouchableOpacity
            onPress={() => router.push("/reglages")}
            style={styles.btnReglages}
            accessibilityLabel="Ouvrir les réglages"
            accessibilityRole="button"
          >
            <IconeEngrenage />
          </TouchableOpacity>
        </View>

        {/* Logo boule disco */}
        <View style={styles.logoConteneur}>
          <LogoBouleDisco
            ref={bouleDisco}
            size={130}
            anime={reglages.animationLogo}
            lampeActive={etapeActuelle?.lampe}
          />
        </View>

        {/* Pastille connexion */}
        <PastilleConnexion connexion={etat.connexionFeu} />

        {/* Message d'erreur */}
        {etat.erreur && (
          <View style={styles.erreurBandeau}>
            <Text style={styles.erreurTexte}>{etat.erreur}</Text>
          </View>
        )}

        {/* ── Section Le feu ───────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.titreSectionRow}>
            <PictogramFeu />
            <Text style={styles.titreSection}>Le feu</Text>
          </View>
          <View style={styles.boutonsFeu}>
            {/* Allumer */}
            <TouchableOpacity
              onPress={handleAllumer}
              style={[
                styles.btnFeu,
                etat.allume ? styles.btnFeuAllumerActif : styles.btnFeuAllumerInactif,
              ]}
              accessibilityLabel="Allumer le feu"
              accessibilityRole="button"
            >
              <View style={styles.btnFeuInner}>
                <View
                  style={[
                    styles.dotVert,
                    Platform.OS === "ios" && etat.allume && {
                      shadowColor: "#7ACB2B",
                      shadowRadius: 6,
                      shadowOpacity: 1,
                      shadowOffset: { width: 0, height: 0 },
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.btnFeuTexte,
                    etat.allume ? styles.txtFeuActif : styles.txtFeuInactif,
                  ]}
                >
                  Allumer
                </Text>
              </View>
            </TouchableOpacity>

            {/* Éteindre */}
            <TouchableOpacity
              onPress={handleEteindre}
              style={[
                styles.btnFeu,
                !etat.allume ? styles.btnFeuEteindreActif : styles.btnFeuEteindreInactif,
              ]}
              accessibilityLabel="Éteindre le feu"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.btnFeuTexte,
                  !etat.allume ? styles.txtEteindreActif : styles.txtEteindreInactif,
                ]}
              >
                Éteindre
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Bloc programme en cours / état vide ─────── */}
        {etat.programmeEnCours !== null ? (
          <BlocEnLecture
            etat={etat}
            programme={progEnCours}
            onPause={handlePause}
            onStop={handleStop}
          />
        ) : (
          <EtatVideProgramme />
        )}

        {/* ── Relancer dernier programme ───────────────── */}
        {dernierProg && (
          <TouchableOpacity
            onPress={() => handleLancer(dernierProg.id)}
            style={styles.btnRelancer}
            accessibilityLabel={`Relancer ${dernierProg.nom}`}
            accessibilityRole="button"
          >
            <View style={styles.relancerPlay}>
              <PlayIcon />
            </View>
            <View style={styles.relancerTextes}>
              <Text style={styles.relancerSurtitre}>RELANCER</Text>
              <Text style={styles.relancerNom} numberOfLines={1}>
                {dernierProg.nom}
              </Text>
            </View>
            <Text style={styles.relancerChevron}>›</Text>
          </TouchableOpacity>
        )}

        {/* ── Mes programmes ───────────────────────────── */}
        <View style={styles.titreProgrammesRow}>
          <Text style={styles.titreProgrammes}>Mes programmes</Text>
          <View style={styles.separateurDeg} />
          <Text style={styles.compteurProgrammes}>{programmes.length}</Text>
        </View>

        <View style={styles.listeProgrammes}>
          {programmes.length === 0 ? (
            <Text style={styles.vide}>Aucun programme. Crée-en un ci-dessous.</Text>
          ) : (
            programmesAffiches.map((p) => (
              <CarteProgramme
                key={p.id}
                programme={{ ...p, epingle: favorisIds.has(p.id) }}
                onLancer={() => handleLancer(p.id)}
                onOuvrir={() => router.push(`/programme/${p.id}`)}
                onDupliquer={() => dupliquer(p.id)}
                onSupprimer={() => supprimer(p.id)}
              />
            ))
          )}
        </View>

        {/* ── Bouton créer ─────────────────────────────── */}
        <TouchableOpacity
          onPress={() => {
            vibrer();
            router.push("/programme/new");
          }}
          style={styles.btnCreer}
          accessibilityLabel="Créer un nouveau programme"
          accessibilityRole="button"
        >
          <Text style={styles.btnCreerTexte}>+ Créer un programme</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: couleurs.fondEcran },
  scroll: {
    padding: espacements.md,
    gap: espacements.md,
    paddingBottom: espacements.xxl,
  },

  // En-tête
  entete: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  spacerGauche: { width: 40 },
  titreCentre: { flex: 1, alignItems: "center" },
  bonjour: { fontSize: 13, fontWeight: "500", color: couleurs.texteSecondaire },
  prenom: { fontSize: 28, fontWeight: "500", color: couleurs.textePrincipal, letterSpacing: -0.5 },
  btnReglages: {
    width: 40,
    height: 40,
    backgroundColor: couleurs.surfaceSecondaire,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    alignItems: "center",
    justifyContent: "center",
  },

  // Logo
  logoConteneur: { alignItems: "center" },

  // Erreur
  erreurBandeau: {
    backgroundColor: couleurs.destructif,
    borderRadius: rayons.carte,
    padding: espacements.sm,
  },
  erreurTexte: { ...typo.corps, color: couleurs.blanc, textAlign: "center" },

  // Section Le feu
  section: { gap: espacements.sm },
  titreSectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacements.xs,
  },
  titreSection: { fontSize: 17, fontWeight: "500", color: couleurs.textePrincipal },
  boutonsFeu: { flexDirection: "row", gap: 10 },
  btnFeu: {
    flex: 1,
    minHeight: tactile.min,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
  },
  btnFeuAllumerActif: {
    backgroundColor: couleurs.carte,
    borderColor: couleurs.textePrincipal,
  },
  btnFeuAllumerInactif: {
    backgroundColor: couleurs.carte,
    borderColor: couleurs.textePrincipal,
    ...Platform.select({
      ios: { shadowColor: couleurs.textePrincipal, shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  btnFeuEteindreActif: {
    backgroundColor: couleurs.textePrincipal,
    borderColor: couleurs.textePrincipal,
  },
  btnFeuEteindreInactif: {
    backgroundColor: couleurs.textePrincipal,
    borderColor: couleurs.textePrincipal,
    opacity: 0.5,
  },
  btnFeuInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  dotVert: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#7ACB2B" },
  btnFeuTexte: { fontSize: 16, fontWeight: "500" },
  txtFeuActif: { color: couleurs.textePrincipal },
  txtFeuInactif: { color: couleurs.textePrincipal },
  txtEteindreActif: { color: couleurs.boutonTexte },
  txtEteindreInactif: { color: couleurs.boutonTexte },

  // Relancer
  btnRelancer: {
    backgroundColor: couleurs.carte,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  relancerPlay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: couleurs.textePrincipal,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  relancerTextes: { flex: 1 },
  relancerSurtitre: {
    fontSize: 11,
    letterSpacing: 0.5,
    color: couleurs.texteSecondaire,
    fontWeight: "500",
  },
  relancerNom: { fontSize: 15, fontWeight: "500", color: couleurs.textePrincipal },
  relancerChevron: { fontSize: 18, color: couleurs.texteSecondaire },

  // Mes programmes
  titreProgrammesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacements.sm,
  },
  titreProgrammes: { fontSize: 17, fontWeight: "500", color: couleurs.textePrincipal },
  separateurDeg: {
    flex: 1,
    height: 1,
    backgroundColor: couleurs.bordure,
    opacity: 0.6,
  },
  compteurProgrammes: {
    fontSize: 12,
    fontWeight: "500",
    color: couleurs.texteSecondaire,
  },
  listeProgrammes: { gap: espacements.sm },
  vide: { ...typo.corpsSecondaire, textAlign: "center", padding: espacements.md },

  // Créer
  btnCreer: {
    backgroundColor: couleurs.boutonFond,
    borderRadius: rayons.boutonStandard,
    minHeight: tactile.min,
    alignItems: "center",
    justifyContent: "center",
    padding: espacements.md,
  },
  btnCreerTexte: { fontSize: 16, fontWeight: "500", color: couleurs.boutonTexte },
});
