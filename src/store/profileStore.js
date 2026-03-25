import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { getProfiles, updateProfile, uploadAvatar } from "../api/profiles";
import { useSessionStore } from "./sessionStore";

export const useProfileStore = create((set, get) => ({
  profile: null,
  loading: false,
  profileAvatarUrl: null,

  setProfile: (profile) => {
    set({ profile });

    if (profile?.avatar) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(profile.avatar);
      set({ profileAvatarUrl: data.publicUrl });
    }
  },

  // --- Load the current user's profile ---
  loadProfile: async () => {
    const userId = useSessionStore.getState().user?.id;
    if (!userId) return;

    set({ loading: true });

    try {
      const profileData = await getProfiles("user", userId);
      if (profileData) {
        set({ profile: profileData });
        
        if (profileData.avatar) {
          const { data } = supabase.storage.from("avatars").getPublicUrl(profileData.avatar);
          set({ profileAvatarUrl: data.publicUrl });
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      set({ loading: false });
    }
  },

  // --- Save/update profile safely ---
  saveProfile: async (updates) => {
    const userId = useSessionStore.getState().user?.id;
    if (!userId) throw new Error("User not logged in");

    const currentProfile = get().profile || { id: userId, type: "user", owner_id: userId };
    const profileToSave = { ...currentProfile, ...updates, id: userId, owner_id: userId };

    try {
      const saved = await updateProfile(profileToSave);
      set({ profile: saved });

      // Update avatar URL if present
      if (saved.avatar) {
        const { data } = supabase.storage.from("avatars").getPublicUrl(saved.avatar);
        set({ profileAvatarUrl: data.publicUrl });
      }

      return saved;
    } catch (err) {
      console.error("Failed to save profile:", err);
      throw err;
    }
  },

  // --- Upload avatar and save automatically ---
uploadAvatar: async (file) => {
  const userId = useSessionStore.getState().user?.id;
  if (!userId) throw new Error("User not logged in");

  const ext = file.name.split(".").pop();
  const relativePath = `avatars/${userId}-${Date.now()}.${ext}`;

  // Upload file
  const { error } = await supabase.storage
    .from("avatars")
    .upload(relativePath, file, { upsert: true });
  if (error) throw error;

  // Get public URL
  const { data } = supabase.storage.from("avatars").getPublicUrl(relativePath);
  if (!data?.publicUrl) throw new Error("Failed to get public URL");

  // Save relative path in profile
  await get().saveProfile({ avatar: relativePath });
  get().setProfileAvatarUrl(data.publicUrl);

  return data.publicUrl;
},
  
  setProfileAvatarUrl: (url) => {
    set({ profileAvatarUrl: url });
  },

}));