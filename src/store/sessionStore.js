import { create } from "zustand";
import { supabase } from "../lib/supabase";

export const useSessionStore = create((set, get) => ({
  user: null,
  profile: null,
  profileAvatarUrl: null,
  mode: "system",

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setProfileAvatarUrl: (url) => set({ profileAvatarUrl: url }),
  setMode: (mode) => set({ mode }),

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      set({ user: null, profile: null, profileAvatarUrl: null, mode: "user" });
    }
  },

  loadSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      set({ user: null, profile: null, profileAvatarUrl: null, mode: "user", onboardingStep: 'profile' });
      return null;
    }

    const userObj = session.user;
    set({ user: userObj });

    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("owner_id", userObj.id);

      if (error) throw error;

      let profile = profiles?.[0];

      if (profile) {
        set({ profile });


        if (profile.avatar) {
          const { data: urlData, error: urlError } = supabase
            .storage
            .from("avatars")
            .getPublicUrl(profile.avatar);

          if (!urlError) set({ profileAvatarUrl: urlData.publicUrl });
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }

    return session;
  },

}));