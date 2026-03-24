import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { getProfiles, updateProfile } from "../api/profiles";
import { useSessionStore } from "./sessionStore";

export const useProfileStore = create((set, get) => ({
  profileId: null,
  profile: null,
  profiles: [],
  loading: false,

  // Load the active profile for the logged-in user
  loadProfile: async () => {
    const userId = useSessionStore.getState().user?.id;
    if (!userId) return;

    set({ loading: true });
    try {
      const profiles = await getProfiles("user", userId);
      if (profiles.length > 0) set({ profile: profiles[0] });
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      set({ loading: false });
    }
  },

  // Save profile updates — removes username unless explicitly set via setUsername
  saveProfile: async (updates) => {
    const userId = useSessionStore.getState().user?.id;
    if (!userId) throw new Error("User not logged in");

    const profile = get().profile || {};

    // Only save username if explicitly set
    const { username: newUsername, ...rest } = updates;
    const safeProfile = { ...profile, ...rest, owner_id: userId };

    try {
      const saved = await updateProfile(safeProfile);
      set({ profile: saved });
      return saved;
    } catch (err) {
      console.error("Failed to save profile:", err);
      throw err;
    }
  },

  // Dedicated username update with uniqueness check
  setUsername: async (newUsername) => {
    if (!newUsername) throw new Error("Username cannot be empty");
    const userId = useSessionStore.getState().user?.id;
    if (!userId) throw new Error("User not logged in");

    // Check if username already exists
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", newUsername)
      .single();

    if (data) throw new Error("Username already taken");

    const profile = get().profile || {};
    const saved = await updateProfile({ ...profile, username: newUsername });
    set({ profile: saved });
    return saved;
  },

  // Upload avatar and update profile safely
  uploadAvatar: async (file) => {
    const userId = useSessionStore.getState().user?.id;
    if (!userId) throw new Error("User not logged in");

    const fileExt = file.name.split(".").pop();
    const filePath = `avatars/${userId}-${Date.now()}.${fileExt}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData, error: urlError } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    if (urlError) throw urlError;
    const publicUrl = urlData.publicUrl;

    // Update profile safely (username untouched)
    await get().saveProfile({ avatar: publicUrl });

    return publicUrl;
  },
}));