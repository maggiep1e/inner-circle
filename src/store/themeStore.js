import { create } from "zustand";

export const useThemeStore = create((set) => ({
  mode: "light" || "dark",


  setMode: (mode) => {
    const root = document.documentElement;
    root.classList.remove("dark");
    if (mode === "dark") root.classList.add("dark"); 
    set({ mode });
  },
}));