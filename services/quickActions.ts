// Raccourcis écran d'accueil (iOS 3D Touch / Android long press)
// Nécessite un build natif avec @bacons/expo-quick-actions
// Ne fonctionne pas dans Expo Go — les deep links fonctionnent, eux.

import * as Linking from "expo-linking";
import { Programme } from "../theme";

export function ouvrirProgrammeViaDeepLink(id: string): void {
  Linking.openURL(`mes-feux://lancer/${id}`).catch(() => {});
}

// Pour activer les quick actions, installe @bacons/expo-quick-actions
// puis remplace ce fichier par :
//
// import * as QuickActions from 'expo-quick-actions';
// export async function mettreAJourQuickActions(
//   dernier: Programme | null,
//   programmes: Programme[]
// ): Promise<void> {
//   const items = [];
//   if (dernier) items.push({
//     id: 'dernier', title: 'Lancer le dernier', subtitle: dernier.nom,
//     params: { href: `/lancer/${dernier.id}` },
//   });
//   programmes.filter(p => p.epingle).slice(0, 2).forEach((p, i) => {
//     items.push({ id: `fav${i}`, title: p.nom, params: { href: `/lancer/${p.id}` } });
//   });
//   await QuickActions.setItems(items);
// }

export async function mettreAJourQuickActions(
  _dernier: Programme | null,
  _programmes: Programme[]
): Promise<void> {
  // stub — activer via build natif
}
