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
import LogoBouleDisco from "../components/LogoBouleDisco";
import type { LogoBouleDisco as LogoRef } from "../components/LogoBouleDisco";
import CarteProgramme from "../components/CarteProgramme";
import PastilleConnexion from "../components/PastilleConnexion";
import FondRayons from "../components/FondRayons";
import { useProgrammesStore } from "../stores/useProgrammesStore";
import { useFeuStore } from "../stores/useFeuStore";
import { useReglagesStore } from "../stores/useReglagesStore";
import { useFavorisStore } from "../stores/useFavorisStore";
import { Programme, couleurs, espacements, rayons, typo, tactile } from "../theme";
import { allumerFeu, configurerIP, MODE_OFF } from "../services/feu";
import { lancerProgramme, arreterMoteur, estActif } from "../services/moteurLecture";

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

function IconeStop() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Rect x={3} y={3} width={10} height={10} rx={2} fill={couleurs.stopTexte} />
    </Svg>
  );
}

function IconeRafraichir() {
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

export default function Accueil() {
  const router = useRouter();
  const bouleDisco = useRef<LogoRef>(null);

  const {
    programmes,
    supprimer,
    dupliquer,
    incrementerLancements,
    charger,
    lancer,
    chargement,
    erreur: erreurModes,
    modeActif,
  } = useProgrammesStore();
  const {
    etat,
    setAllume,
    setProgrammeEnCours,
    setEtapeIndex,
    setEnPause,
    setDernierProgrammeLanceId,
    reset,
  } = useFeuStore();
  const { reglages } = useReglagesStore();
  const favoris = useFavorisStore((s) => s.favoris);

  useEffect(() => {
    configurerIP(reglages.ipFeu);
  }, [reglages.ipFeu]);

  // Recharge la liste des modes depuis le feu à chaque fois que l'écran reprend
  // le focus (retour depuis l'éditeur, les réglages…) ou quand l'IP change.
  useFocusEffect(
    React.useCallback(() => {
      configurerIP(reglages.ipFeu);
      charger();
    }, [reglages.ipFeu, charger])
  );

  // Synchronise l'affichage (boule disco, miroir, bloc en lecture) avec le mode
  // réellement actif sur le feu — y compris quand il change tout seul via le
  // bouton physique, détecté par le heartbeat. On adopte le mode rapporté sans
  // le renvoyer au feu ni compter un lancement.
  useEffect(() => {
    // Aucun mode actif (ou mode OFF) → on arrête l'aperçu local.
    if (!modeActif || modeActif === MODE_OFF) {
      if (estActif()) {
        arreterMoteur();
        reset();
      }
      return;
    }
    const prog = programmes.find((p) => p.nom === modeActif);
    if (!prog || prog.etapes.length === 0) return;
    if (etat.programmeEnCours === prog.id) return; // déjà affiché
    setProgrammeEnCours(prog.id);
    setEnPause(false);
    lancerProgramme(
      prog,
      // Aperçu : on ne met à jour le store qu'au changement d'étape (pour la
      // couleur de la boule disco / le miroir). La progression n'est plus
      // affichée, donc on évite un re-render de tout l'écran toutes les 100 ms
      // — sinon les rendus s'accumulent et l'app ralentit progressivement.
      (etapeIndex) => {
        const feu = useFeuStore.getState();
        if (feu.etat.etapeIndex !== etapeIndex) feu.setEtapeIndex(etapeIndex);
      },
      () => reset()
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeActif, programmes]);

  const vibrer = () => {
    if (reglages.vibrations)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleLancer = (id: string) => {
    vibrer();
    const prog = programmes.find((p) => p.id === id);
    if (!prog || prog.etapes.length === 0) return;
    // Active le mode sur le feu (le matériel exécute lui-même la séquence).
    lancer(prog.nom);
    if (!etat.allume) {
      setAllume(true);
      allumerFeu().catch(() => {});
    }
    setProgrammeEnCours(id);
    setEtapeIndex(0);
    setEnPause(false);
    setDernierProgrammeLanceId(id);
    incrementerLancements(id);
    bouleDisco.current?.exploser();
    lancerProgramme(
      prog,
      // Aperçu : on ne met à jour le store qu'au changement d'étape (pour la
      // couleur de la boule disco / le miroir). La progression n'est plus
      // affichée, donc on évite un re-render de tout l'écran toutes les 100 ms
      // — sinon les rendus s'accumulent et l'app ralentit progressivement.
      (etapeIndex) => {
        const feu = useFeuStore.getState();
        if (feu.etat.etapeIndex !== etapeIndex) feu.setEtapeIndex(etapeIndex);
      },
      () => reset()
    );
    if (reglages.pleinEcranAuto) router.push("/miroir");
  };

  // Arrêt : on lance le mode OFF sur le feu. L'effet d'adoption ci-dessus
  // détectera le changement de mode actif et stoppera l'aperçu local.
  const handleArreter = () => {
    vibrer();
    lancer(MODE_OFF);
  };

  const progEnCours = etat.programmeEnCours
    ? (programmes.find((p) => p.id === etat.programmeEnCours) ?? null)
    : null;

  const etapeActuelle = progEnCours
    ? (progEnCours.etapes[etat.etapeIndex] ?? null)
    : null;

  // Favoris : les programmes marqués d'une étoile.
  const favorisProgs = programmes.filter((p) => favoris.includes(p.nom));

  // Récents : les 3 derniers programmes lancés depuis l'app (rang de récence).
  const recentsProgs = [...programmes]
    .filter((p) => (p.derniereExecution ?? 0) > 0)
    .sort((a, b) => (b.derniereExecution ?? 0) - (a.derniereExecution ?? 0))
    .slice(0, 3);

  const renderCarte = (p: Programme) => (
    <CarteProgramme
      key={p.id}
      programme={{ ...p, epingle: favoris.includes(p.nom) }}
      actif={modeActif === p.nom && modeActif !== MODE_OFF}
      onLancer={() => handleLancer(p.id)}
      onArreter={handleArreter}
      onOuvrir={() => router.push(`/programme/${p.id}`)}
      onDupliquer={() => dupliquer(p.id)}
      onSupprimer={() => supprimer(p.id)}
    />
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
            lampeActive={
              etapeActuelle?.lampes.find((l) => l !== "eteint") ??
              etapeActuelle?.lampes[0]
            }
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

        {/* ── Mode actuel (rapporté par le feu) ───────── */}
        <View style={styles.modeActuel}>
          <Text style={styles.modeActuelLabel}>Mode actuel</Text>
          <Text style={styles.modeActuelNom} numberOfLines={1}>
            {modeActif ?? "Aucun"}
          </Text>
          {modeActif && modeActif !== MODE_OFF && (
            <TouchableOpacity
              onPress={handleArreter}
              style={styles.btnStopTile}
              accessibilityLabel="Arrêter le mode (éteindre le feu)"
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <IconeStop />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Favoris (uniquement s'il y en a) ─────────── */}
        {favorisProgs.length > 0 && (
          <>
            <Text style={styles.titreProgrammes}>Favoris</Text>
            <View style={styles.listeProgrammes}>
              {favorisProgs.map(renderCarte)}
            </View>
          </>
        )}

        {/* ── Récents (3 max, par dernier lancement) ───── */}
        {recentsProgs.length > 0 && (
          <>
            <Text style={styles.titreProgrammes}>Récents</Text>
            <View style={styles.listeProgrammes}>
              {recentsProgs.map(renderCarte)}
            </View>
          </>
        )}

        {/* ── Tous les programmes ──────────────────────── */}
        <View style={styles.titreProgrammesRow}>
          <Text style={styles.titreProgrammes}>Tous les programmes</Text>
          <TouchableOpacity
            onPress={() => {
              vibrer();
              charger();
            }}
            disabled={chargement}
            style={[styles.btnRafraichir, chargement && styles.btnRafraichirActif]}
            accessibilityLabel="Rafraîchir les modes depuis le feu"
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconeRafraichir />
          </TouchableOpacity>
          <View style={styles.separateurDeg} />
          <Text style={styles.compteurProgrammes}>{programmes.length}</Text>
        </View>

        <View style={styles.listeProgrammes}>
          {erreurModes && (
            <TouchableOpacity
              onPress={() => charger()}
              style={styles.erreurModes}
              accessibilityLabel="Réessayer de charger les modes du feu"
              accessibilityRole="button"
            >
              <Text style={styles.erreurModesTexte}>
                {erreurModes}{"\n"}Touche pour réessayer.
              </Text>
            </TouchableOpacity>
          )}
          {chargement && programmes.length === 0 ? (
            <Text style={styles.vide}>Chargement des modes du feu…</Text>
          ) : programmes.length === 0 ? (
            !erreurModes && (
              <Text style={styles.vide}>
                Aucun mode sur le feu. Crée-en un ci-dessous.
              </Text>
            )
          ) : (
            programmes.map(renderCarte)
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

  // Mode actuel
  modeActuel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: couleurs.carte,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: espacements.sm,
  },
  modeActuelLabel: { fontSize: 13, fontWeight: "500", color: couleurs.texteSecondaire },
  modeActuelNom: {
    flex: 1,
    textAlign: "right",
    fontSize: 16,
    fontWeight: "500",
    color: couleurs.textePrincipal,
  },
  btnStopTile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: couleurs.stop,
    alignItems: "center",
    justifyContent: "center",
  },

  // Mes programmes
  titreProgrammesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacements.sm,
  },
  titreProgrammes: { fontSize: 17, fontWeight: "500", color: couleurs.textePrincipal },
  btnRafraichir: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: couleurs.surfaceSecondaire,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    alignItems: "center",
    justifyContent: "center",
  },
  btnRafraichirActif: { opacity: 0.5 },
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
  erreurModes: {
    backgroundColor: couleurs.surfaceSecondaire,
    borderRadius: rayons.carte,
    borderWidth: 1,
    borderColor: couleurs.destructif,
    padding: espacements.md,
  },
  erreurModesTexte: {
    ...typo.corpsSecondaire,
    color: couleurs.destructif,
    textAlign: "center",
  },

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
