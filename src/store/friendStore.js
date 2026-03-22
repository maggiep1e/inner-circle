import { create } from "zustand";
import { getFriends, getRequests } from "../api/friends";

export const useFriendsStore = create((set) => ({

  friends: [],
  requests: [],

  setFriends: (friends) => set({ friends }),

  setRequests: (requests) => set({ requests }),

  loadFriends: async (userId, token) => {

    const friends = await getFriends(userId, token);

    set({ friends });

  },

  loadRequests: async (userId, token) => {

    const requests = await getRequests(userId, token);

    set({ requests });

  }

}));