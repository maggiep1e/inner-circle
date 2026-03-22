import { create } from "zustand";

export const useIdStore = create((set) => ({

  userId: null,
  systemId: null,

  setUserId: (id) => set({ userId: id }),

  setSystemId: (id) => set({ systemId: id }),

}));