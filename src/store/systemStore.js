import { create } from "zustand";
import { supabase } from "../lib/supabase";

import {
  getMembers,
  createMember,
  updateMember as updateMemberApi,
  deleteMember as deleteMemberApi,
} from "../api/members";

import {
  getSystems,
  createSystem,
  updateSystem as updateSystemApi,
} from "../api/systems";

import { getFoldersBySystem } from "../api/folders";
import { getPublicUrl } from "../api/avatar";

export const useSystemStore = create((set, get) => ({
  // --------------------
  // STATE
  // --------------------
  systemId: null,
  systems: [],
  members: [],
  systemFolders: [],
  currentFront: [],
  currentSystem: null,

  // --------------------
  // HELPERS
  // --------------------
  resolveAvatar: (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return getPublicUrl(path);
  },

  // --------------------
  // SYSTEMS (PURE LOAD)
  // --------------------
  loadSystems: async (userId) => {
    if (!userId) return [];

    try {
      const data = await getSystems(userId);

      const systems = (data || []).map((s) => ({
        ...s,
        avatarUrl: get().resolveAvatar(s.avatar),
      }));

      set({ systems });

      return systems;
    } catch (err) {
      console.error("loadSystems error:", err);
      set({ systems: [] });
      return [];
    }
  },

  // --------------------
  // HYDRATE ONE SYSTEM (MAIN FIX)
  // --------------------
  hydrateSystem: async (systemId) => {
    if (!systemId) return;

    const system = get().systems.find((s) => s.id === systemId);

    set({
      systemId,
      currentSystem: system || null,
    });

    await Promise.all([
      get().loadMembers(systemId),
      get().loadCurrentFront(systemId),
      get().loadFolders(systemId),
    ]);
  },

  // --------------------
  // SYSTEM CRUD
  // --------------------
  addSystem: async (data) => {
    const created = await createSystem({
      ...data,
      avatar: data.avatar || null,
      display_name: data.name,
    });

    const system = {
      ...created,
      avatarUrl: get().resolveAvatar(created.avatar),
    };

    set((state) => ({
      systems: [...state.systems, system],
    }));

    return system;
  },

  updateSystem: async (id, updates) => {
    const updated = await updateSystemApi(id, updates);

    const system = {
      ...updated,
      avatarUrl: get().resolveAvatar(updated.avatar),
    };

    set((state) => ({
      systems: state.systems.map((s) =>
        s.id === id ? system : s
      ),
      currentSystem:
        state.currentSystem?.id === id
          ? system
          : state.currentSystem,
    }));

    return system;
  },

  // --------------------
  // MEMBERS (PURE)
  // --------------------
  loadMembers: async (systemId) => {
    if (!systemId) return;

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("system_id", systemId);

    if (error) {
      console.error(error);
      return;
    }

    const members = (data || []).map((m) => ({
      ...m,
      avatarUrl: get().resolveAvatar(m.avatar),
    }));

    set({ members });
  },

  addMember: async (data) => {
    const { data: created, error } = await supabase
      .from("members")
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      members: [...state.members, created],
    }));

    return created;
  },

  updateMember: async (id, updates) => {
    const updated = await updateMemberApi(id, updates);

    const member = {
      ...updated,
      avatarUrl: get().resolveAvatar(updated.avatar),
    };

    set((state) => ({
      members: state.members.map((m) =>
        m.id === id ? member : m
      ),
    }));

    return member;
  },

  deleteMember: async (id) => {
    await deleteMemberApi(id);

    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
    }));
  },

  // --------------------
  // FRONT SYSTEM
  // --------------------
  setFront: async (memberIds) => {
    const systemId = get().systemId;
    if (!systemId) return;

    const inserts = memberIds.map((id) => ({
      system_id: systemId,
      member_id: id,
    }));

    await supabase.from("front_logs").insert(inserts);

    set({ currentFront: memberIds });
  },

  loadCurrentFront: async (systemId) => {
    const id = systemId || get().systemId;
    if (!id) return;

    const { data, error } = await supabase
      .from("front_logs")
      .select("member_id")
      .eq("system_id", id);

    if (error) return console.error(error);

    set({
      currentFront: (data || []).map((f) => f.member_id),
    });
  },

  toggleFront: async (memberId) => {
    const current = get().currentFront;

    const updated = current.includes(memberId)
      ? current.filter((id) => id !== memberId)
      : [...current, memberId];

    await get().setFront(updated);
  },

  removeFromFront: (memberId) =>
    set((state) => ({
      currentFront: state.currentFront.filter(
        (id) => id !== memberId
      ),
    })),

  // --------------------
  // FOLDERS (PURE)
  // --------------------
  loadFolders: async (systemId) => {
    const id = systemId || get().systemId;
    if (!id) return;

    const folders = await getFoldersBySystem(id);

    set({ systemFolders: folders || [] });
  },
}));