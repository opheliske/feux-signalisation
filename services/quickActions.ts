// Home screen shortcuts (iOS 3D Touch / Android long press)
// Requires a native build with @bacons/expo-quick-actions
// Does not work in Expo Go — deep links do, though.

import * as Linking from "expo-linking";
import { Program } from "../theme";

export function openProgramViaDeepLink(id: string): void {
  Linking.openURL(`mes-feux://launch/${id}`).catch(() => {});
}

// To enable quick actions, install @bacons/expo-quick-actions
// then replace this file with:
//
// import * as QuickActions from 'expo-quick-actions';
// export async function updateQuickActions(
//   last: Program | null,
//   programs: Program[]
// ): Promise<void> {
//   const items = [];
//   if (last) items.push({
//     id: 'last', title: 'Launch the last one', subtitle: last.name,
//     params: { href: `/launch/${last.id}` },
//   });
//   programs.filter(p => p.pinned).slice(0, 2).forEach((p, i) => {
//     items.push({ id: `fav${i}`, title: p.name, params: { href: `/launch/${p.id}` } });
//   });
//   await QuickActions.setItems(items);
// }

export async function updateQuickActions(
  _last: Program | null,
  _programs: Program[]
): Promise<void> {
  // stub — enable via native build
}
