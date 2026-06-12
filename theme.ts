// ─── Types ────────────────────────────────────────────────────────────────────

export type Lampe = "vert" | "orange" | "rouge" | "eteint";

export type Etape = {
  id: string;
  lampes: Lampe[]; // une ou plusieurs lampes allumées en même temps
  dureeSecondes: number; // 1..60
};

export type Programme = {
  id: string;
  nom: string;
  etapes: Etape[];
  epingle: boolean;
  nbLancements: number;
  derniereExecution?: number; // rang de récence (croissant), 0 si jamais lancé
  creeA: number;
  modifieA: number;
};

export type EtatFeu = {
  allume: boolean;
  programmeEnCours: string | null;
  etapeIndex: number;
  enPause: boolean;
  connexionFeu: "connecte" | "deconnecte" | "inconnu";
  dernierProgrammeLanceId: string | null;
  finMinuterie: number | null; // timestamp ms
  erreur: string | null;
};

export type Reglages = {
  ipFeu: string | null;
  vibrations: boolean;
  animationLogo: boolean;
  sons: boolean;
  ledFlash: boolean;
  pleinEcranAuto: boolean;
};

// ─── Couleurs ─────────────────────────────────────────────────────────────────

export const couleurs = {
  fondEcran: "#FFD60A",
  surfaceSecondaire: "#FFEA5A",
  carte: "#FFFFFF",
  bordure: "#F2B600",
  bordureForte: "#C99200",
  textePrincipal: "#1F1400",
  texteSecondaire: "#6B3D00",
  texteDoux: "#8B5A10",
  boutonFond: "#1F1400",
  boutonTexte: "#FFD60A",
  stop: "#A32D2D",
  stopTexte: "#FFFFFF",
  or: "#E8A814",
  reflet: "#FFF7D6",
  vert: { allumee: "#7ACB2B", eteinte: "#0E3A04" },
  orange: { allumee: "#FF9500", eteinte: "#3D2A03" },
  rouge: { allumee: "#E24B4A", eteinte: "#4A0E0E" },
  eteint: { allumee: "#888888", eteinte: "#2A2A2A" },
  destructif: "#A32D2D",
  blanc: "#FFFFFF",
  noir: "#000000",
  transparent: "transparent",
  vertPastille: "#2BA84A",
} as const;

// ─── Helpers lampe ────────────────────────────────────────────────────────────

export const labelLampe: Record<Lampe, string> = {
  vert: "Vert",
  orange: "Orange",
  rouge: "Rouge",
  eteint: "Éteint",
};

export function couleurLampe(lampe: Lampe, active: boolean): string {
  return active ? couleurs[lampe].allumee : couleurs[lampe].eteinte;
}

export function couleurPastille(lampe: Lampe): string {
  return couleurs[lampe].allumee;
}

export function couleurFondMiroir(lampe: Lampe): string {
  const map: Record<Lampe, string> = {
    vert: "#0A2E00",
    orange: "#3D1A00",
    rouge: "#3D0000",
    eteint: "#0A0A0A",
  };
  return map[lampe];
}

export function libelleLampes(lampes: Lampe[]): string {
  if (lampes.length === 0) return labelLampe.eteint;
  return lampes.map((l) => labelLampe[l]).join(" + ");
}

// Affiche une durée (en secondes, éventuellement fractionnaire) en s ou min.
// Les durées viennent du feu en millisecondes ; on les montre en secondes
// (ex : 0.5 s) ou en minutes au-delà de 60 s (ex : 1 min 30 s).
export function formatDuree(secondes: number): string {
  if (secondes >= 60) {
    const min = Math.floor(secondes / 60);
    const s = Math.round(secondes % 60);
    return s === 0 ? `${min} min` : `${min} min ${s} s`;
  }
  const arrondi = Math.round(secondes * 10) / 10;
  return `${arrondi} s`;
}

export function resumeProgramme(etapes: Etape[]): string {
  if (etapes.length === 0) return "Aucune étape";
  return etapes
    .map((e) => `${libelleLampes(e.lampes)} ${formatDuree(e.dureeSecondes)}`)
    .join(", puis ");
}

export function dureeTotaleCycle(etapes: Etape[]): number {
  return etapes.reduce((acc, e) => acc + e.dureeSecondes, 0);
}

// ─── Rayons ───────────────────────────────────────────────────────────────────

export const rayons = {
  carte: 12,
  carteLarge: 14,
  conteneur: 28,
  boutonPlay: 9999,
  boutonStandard: 10,
  pastille: 9999,
} as const;

// ─── Espacements ──────────────────────────────────────────────────────────────

export const espacements = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ─── Typographie ──────────────────────────────────────────────────────────────

export const typo = {
  titreLarge: { fontSize: 24, fontWeight: "500" as const, color: couleurs.textePrincipal },
  titre: { fontSize: 20, fontWeight: "500" as const, color: couleurs.textePrincipal },
  titreMoyen: { fontSize: 17, fontWeight: "500" as const, color: couleurs.textePrincipal },
  corps: { fontSize: 16, fontWeight: "400" as const, color: couleurs.textePrincipal },
  corpsSecondaire: { fontSize: 14, fontWeight: "400" as const, color: couleurs.texteSecondaire },
  bouton: { fontSize: 16, fontWeight: "500" as const },
  petit: { fontSize: 12, fontWeight: "400" as const, color: couleurs.texteSecondaire },
} as const;

// ─── Tactile & animation ──────────────────────────────────────────────────────

export const tactile = {
  min: 56,
  boutonPlay: 64,
  logoTaille: 54,
} as const;

export const animation = {
  rotationBouleDisco: 20000,
  rotationBouleProgramme: 4000,
  rotationBoulExplosion: 1500,
} as const;
