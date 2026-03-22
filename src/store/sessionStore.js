import { create } from "zustand";

export const useSessionStore = create((set) => ({
  userId: null,
  systemId: null, // start as null, will load from localStorage

  setUser: (id) => set({ userId: id }),

  setSystem: (id) => {
    localStorage.setItem("systemId", id);
    set({ systemId: id });
  },

  initSession: () => {
    const savedSystem = localStorage.getItem("systemId");
    if (savedSystem) {
      set({ systemId: savedSystem });
    }
  },

  logout: () => {
    localStorage.removeItem("systemId");
    set({ userId: null, systemId: null });
  },
}));