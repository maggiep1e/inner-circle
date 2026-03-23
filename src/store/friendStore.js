import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { getProfiles } from "../api/profiles";

export const useFriendsStore = create((set, get) => ({
  friends: [],
  requests: [],
  loadingFriends: false,
  loadingRequests: false,

  // Load all accepted friends for a profile
  loadFriends: async (profileId) => {
    if (!profileId) return;
    set({ loadingFriends: true });
    try {
      // Get all accepted friendships where this profile is requester or receiver
      const { data: friendLinks, error } = await supabase
        .from("friends")
        .select("*")
        .or(`requester_id.eq.${profileId},receiver_id.eq.${profileId}`)
        .eq("status", "accepted");
      if (error) throw error;

      // Get the IDs of the other profiles
      const friendIds = friendLinks.map((f) =>
        f.requester_id === profileId ? f.receiver_id : f.requester_id
      );

      if (friendIds.length === 0) {
        set({ friends: [] });
        return;
      }

      // Fetch the full profiles
      const profilePromises = friendIds.map((id) => getProfiles("user", id));
      const results = await Promise.all(profilePromises);
      const friendsList = results.flat().filter(Boolean);

      set({ friends: friendsList });
    } catch (err) {
      console.error("Failed to load friends:", err);
    } finally {
      set({ loadingFriends: false });
    }
  },

  // Load pending friend requests for this profile
  loadRequests: async (profileId) => {
    if (!profileId) return;
    set({ loadingRequests: true });
    try {
      const { data, error } = await supabase
        .from("friend_requests")
        .select("*")
        .eq("status", "pending")
        .eq("to_user_id", profileId);
      if (error) throw error;

      set({ requests: data || [] });
    } catch (err) {
      console.error("Failed to load friend requests:", err);
    } finally {
      set({ loadingRequests: false });
    }
  },
}));