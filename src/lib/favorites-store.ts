"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavoriteState = { favorites: string[]; toggle: (code: string) => void };
export const useFavoriteStore = create<FavoriteState>()(persist((set) => ({
  favorites: [],
  toggle: (code) => set((state) => ({ favorites: state.favorites.includes(code) ? state.favorites.filter((item) => item !== code) : [...state.favorites, code] })),
}), { name: "safaria-favorites-v1", skipHydration: true, partialize: (state) => ({ favorites: state.favorites }) }));
