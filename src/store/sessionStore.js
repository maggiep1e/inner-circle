// src/store/sessionStore.js
import { create } from "zustand";

export const useSessionStore = create((set) => ({
  userId: null,
  profile: null,
  mode: "system",
  systemId: null, 
  user: null,
  
  
  
  // currently active system
  setUser: (userObj) => set({ user: userObj, userId: userObj?.id || null }),


  setProfile: (profile) =>
  set({
    profile,
    mode: profile?.mode || "system",
  }),


  setSystem: (id) => {
    if (id) localStorage.setItem("systemId", id);
    set({ systemId: id });
  },


  logout: () => {
    localStorage.removeItem("systemId");
    set({ userId: null, profileId: null, systemId: null });
  },


  initSession: () => {
    const savedSystem = localStorage.getItem("systemId");
    if (savedSystem) set({ systemId: savedSystem });
  },

}));