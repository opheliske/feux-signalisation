import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Explicit favorites, chosen by the user via the star on the edit screen.
// Indexed by mode name (the light identifies a mode by its name).
// Persisted locally: the firmware does not store this notion.
type FavoritesStore = {
  favorites: string[];
  setFavorite: (name: string, favorite: boolean) => void;
  removeFavorite: (name: string) => void;
};

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set) => ({
      favorites: [],
      setFavorite: (name, favorite) =>
        set((s) => {
          const without = s.favorites.filter((n) => n !== name);
          return { favorites: favorite ? [...without, name] : without };
        }),
      removeFavorite: (name) =>
        set((s) => ({ favorites: s.favorites.filter((n) => n !== name) })),
    }),
    {
      // Storage key kept as-is to preserve favorites on existing installs.
      name: "favoris_benoit",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
