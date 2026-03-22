import { create } from "zustand";

export const useThemeStore = create((set) => ({
  mode: "light",
  setMode: (mode) => {
    const root = document.documentElement;
    root.classList.remove("dark"); // only remove dark
    if (mode === "dark") root.classList.add("dark"); // add if dark
    set({ mode });
  },
}));