import { create } from "zustand";
import { getProfiles, createProfile, updateProfile } from "../api/profiles";
import { useSessionStore } from "./sessionStore";

export const useProfileStore = create((set, get) => ({
  profileId: null,       // currently active profile
  profiles: [],          // all loaded profiles

   loadProfile: async () => {
    const userId = useSessionStore.getState().userId;
    if (!userId) return;
    set({ loading: true });

    try {
      const profiles = await getProfiles("user", userId);
      if (profiles.length > 0) {
        set({ profile: profiles[0] });
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      set({ loading: false });
    }
  },

  saveProfile: async (updates) => {
    const userId = useSessionStore.getState().userId;
    if (!userId) return;

    const profile = get().profile || {};
    const data = { ...profile, ...updates, owner_id: userId };

    try {
      const saved = await upsertProfile(data);
      set({ profile: saved });
      return saved;
    } catch (err) {
      console.error("Failed to save profile:", err);
      throw err;
    }
  },

  addProfile: async (profileData) => {
    const ownerId = useSessionStore.getState().userId; // <-- use userId
    if (!ownerId) throw new Error("No user logged in");
    const newProfile = await createProfile({ ...profileData, owner_id: ownerId });
    set((state) => ({ profiles: [newProfile, ...state.profiles] }));
    return newProfile;
  },

  updateProfile: async (id, updates) => {
    const updated = await updateProfile(id, updates);
    set((state) => ({
      profiles: state.profiles.map((p) => (p.id === id ? updated : p)),
    }));
  },

  setActiveProfile: (id) => set({ profileId: id }),
}));