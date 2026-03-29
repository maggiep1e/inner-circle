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
  systemId: null,
  systems: [],
  members: [],
  systemFolders: [],
  currentFront: [],
  currentSystem: null,

  resolveAvatar: (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return getPublicUrl(path);
  },

// systems

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

  ensureCurrentSystem: async () => {
      const state = get();

      if (state.currentSystem?.id) return;

      if (!state.systems?.length) return;

      const first = state.systems[0];

      if (!first) return;

      set({ currentSystem: first });

      await state.loadMembers?.(first.id);
      await state.loadCurrentFront?.(first.id);
      await state.loadFolders?.(first.id);
    },

    deleteSystem: async (id) => {
      const { error } = await supabase
        .from("systems")
        .delete()
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        systems: state.systems.filter((s) => s.id !== id),
        currentSystem:
          state.currentSystem?.id === id ? null : state.currentSystem,
      }));
    },


//members 

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


//fronting 
setFront: async (systemId, memberIds) => {
  if (!systemId) return;

  const safeIds = Array.isArray(memberIds) ? memberIds : [];

  await supabase
    .from("systems")
    .update({ current_front: safeIds })
    .eq("id", systemId);

  set({ currentFront: safeIds });
},

loadCurrentFront: async (systemId) => {
  if (!systemId) return;

  const { data, error } = await supabase
    .from("systems")
    .select("current_front")
    .eq("id", systemId)
    .single();

  if (error) throw error;

  set({
    currentFront: data?.current_front || [],
  });
},

setCurrentFront: async (systemId, memberIds) => {
  await supabase
    .from("systems")
    .update({ current_front: memberIds })
    .eq("id", systemId);

  set({ currentFront: memberIds });
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
    }),

  ),

//folders 
  loadFolders: async (systemId) => {
    const id = systemId || get().systemId;
    if (!id) return;

    const folders = await getFoldersBySystem(id);

    set({ systemFolders: folders || [] });
  },
}));