import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  ids: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],

      toggleFavorite: (productId) => {
        const ids = get().ids;
        set({
          ids: ids.includes(productId)
            ? ids.filter((id) => id !== productId)
            : [...ids, productId],
        });
      },

      isFavorite: (productId) => get().ids.includes(productId),
    }),
    { name: "rising-chemicals-favorites" }
  )
);
