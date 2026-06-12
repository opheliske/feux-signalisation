import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Favoris explicites, choisis par l'utilisateur via l'étoile de l'écran
// d'édition. Indexés par nom de mode (le feu identifie un mode par son nom).
// Persistés localement : le firmware ne stocke pas cette notion.
type FavorisStore = {
  favoris: string[];
  definir: (nom: string, favori: boolean) => void;
  retirer: (nom: string) => void;
};

export const useFavorisStore = create<FavorisStore>()(
  persist(
    (set) => ({
      favoris: [],
      definir: (nom, favori) =>
        set((s) => {
          const sansNom = s.favoris.filter((n) => n !== nom);
          return { favoris: favori ? [...sansNom, nom] : sansNom };
        }),
      retirer: (nom) =>
        set((s) => ({ favoris: s.favoris.filter((n) => n !== nom) })),
    }),
    {
      name: "favoris_benoit",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
