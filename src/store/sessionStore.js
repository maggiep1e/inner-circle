import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { getUser } from "../lib/auth";

export const useSessionStore = create((set) => ({
  userId: null,
  profile: null,
  mode: "system",
  systemId: null,
  user: null,

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

  logout: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      userId: null,
      profile: null,
      systemId: null,
      mode: "system",
    });
    localStorage.removeItem("systemId");
  },

  initSession: async () => {
    const savedSystem = localStorage.getItem("systemId");
    if (savedSystem) set({ systemId: savedSystem });

    const user = await getUser();
    if (user) set({ user, userId: user.id });
  },
}));

