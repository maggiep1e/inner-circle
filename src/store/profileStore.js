import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { getProfiles, updateProfile } from "../api/profiles";
import { useSessionStore } from "./sessionStore";

function getAvatarUrl(path) {
  if (!path) return "/default-avatar.png";

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data?.publicUrl || "/default-avatar.png";
}

export const useProfileStore = create((set, get) => ({
  profile: null,
  loading: false,
  profileAvatarUrl: null,


  setProfile: (profile) => {
    set({
      profile,
      profileAvatarUrl: getAvatarUrl(profile?.avatar),
    });
  },

  loadProfile: async () => {
    const userId = useSessionStore.getState().user?.id;
    if (!userId) return;

    set({ loading: true });

    try {
      const profileData = await getProfiles("user", userId);

      if (profileData) {
        set({
          profile: profileData,
          profileAvatarUrl: getAvatarUrl(profileData?.avatar),
        });
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      set({ loading: false });
    }
  },


  saveProfile: async (updates) => {
    const userId = useSessionStore.getState().user?.id;
    if (!userId) throw new Error("User not logged in");

    const currentProfile =
      get().profile || { id: userId, type: "user", owner_id: userId };

    const profileToSave = {
      ...currentProfile,
      ...updates,
      id: userId,
      owner_id: userId,
    };

    try {
      const saved = await updateProfile(profileToSave);

      set({
        profile: saved,
        profileAvatarUrl: getAvatarUrl(saved?.avatar),
      });

      return saved;
    } catch (err) {
      console.error("Failed to save profile:", err);
      throw err;
    }
  },

  uploadAvatar: async (file) => {
    const userId = useSessionStore.getState().user?.id;
    if (!userId) throw new Error("User not logged in");

    const ext = file.name.split(".").pop();
    const path = `avatars/${userId}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const publicUrl = getAvatarUrl(path);


    await get().saveProfile({ avatar: path });

    return publicUrl;
  },


  setProfileAvatarUrl: (url) => {
    set({ profileAvatarUrl: url });
  },
}));