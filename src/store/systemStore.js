import { create } from "zustand";
import { supabase } from "../lib/supabase";

import { getMembers, createMember, updateMember as updateMemberApi, deleteMember as deleteMemberApi } from "../api/members";
import { getSystems, createSystem, updateSystem as updateSystemApi } from "../api/systems";
import { getFoldersBySystem } from "../api/folders";
import { useSessionStore } from "./sessionStore";
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

  // avatar caches (optional performance layer)
  memberAvatarUrls: {},
  systemAvatarUrls: {},

  // --------------------
  // HELPERS
  // --------------------
  resolveAvatar: (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return getPublicUrl(path);
  },

  // --------------------
  // SYSTEMS
  // --------------------
  loadSystems: async () => {
    const { userId, user } = useSessionStore.getState();
    if (!userId) return;

    try {
      const data = await getSystems(userId);

      const limited =
        !user?.plan || user.plan !== "paid"
          ? data.slice(0, 1)
          : data;

      const systems = limited.map((s) => ({
        ...s,
        avatarUrl: get().resolveAvatar(s.avatar),
      }));

      set({
        systems,
        currentSystem: systems[0] || null,
        systemId: systems[0]?.id || null,
      });

      if (systems[0]) {
        await get().loadMembers(systems[0].id);
        await get().loadCurrentFront();
      }
    } catch (err) {
      console.error("loadSystems error:", err);
      set({ systems: [], currentSystem: null });
    }
  },

  saveSystem: async (id, form) => {
  const { error } = await supabase
    .from("systems")
    .update({
      display_name: form.name,
      description: form.description,
      color: form.color,
      avatar: form.avatar, // 🔥 REQUIRED
    })
    .eq("id", id);

  if (error) throw error;
}, 

setSystemAvatarUrl: (id, url) =>
  set((state) => ({
    systemAvatarUrls: {
      ...state.systemAvatarUrls,
      [id]: url,
    },
  })),

  setSystems: (systems) => { set({ systems }); 
  if (systems.length > 0 && !get().systemId) 
    { get().setSystemId(systems[0].id); } },

  setSystemId: async (id) => {
    const system = get().systems.find((s) => s.id === id);

    set({
      systemId: id,
      currentSystem: system || null,
    });

    if (id) {
      await get().loadMembers(id);
      await get().loadCurrentFront();
    }
  },

addSystem: async (data) => {
  console.log("ADDING SYSTEM:", data);

  const created = await createSystem({
    ...data,
    avatar: data.avatar || null,
    display_name: data.name
  });

  set((state) => ({
    systems: [
      ...state.systems,
      {
        ...created,
        avatarUrl: get().resolveAvatar(created.avatar),
      },
    ],
  }));

  return created;
},

  updateSystem: async (id, updates) => {
    const updated = await updateSystemApi(id, updates);

    set((state) => ({
      systems: state.systems.map((s) =>
        s.id === id
          ? { ...updated, avatarUrl: get().resolveAvatar(updated.avatar) }
          : s
      ),
      currentSystem:
        state.currentSystem?.id === id
          ? { ...updated, avatarUrl: get().resolveAvatar(updated.avatar) }
          : state.currentSystem,
    }));

    return updated;
  },

  // --------------------
  // MEMBERS
  // --------------------
  loadMembers: async (systemId) => {
    const id = systemId || get().systemId;
    if (!id) return;

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("system_id", id);

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
      id: updated._id || updated.id,
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

    const { error } = await supabase
      .from("front_logs")
      .insert(inserts);

    if (error) console.error(error);

    set({ currentFront: memberIds });
  },

  loadCurrentFront: async () => {
    const systemId = get().systemId;
    if (!systemId) return;

    const { data, error } = await supabase
      .from("front_logs")
      .select("member_id")
      .eq("system_id", systemId);

    if (error) return console.error(error);

    set({
      currentFront: data.map((f) => f.member_id),
    });
  },

  toggleFront: async (memberId) => {
    const current = get().currentFront;

    const updated = current.includes(memberId)
      ? current.filter((id) => id !== memberId)
      : [...current, memberId];

    await get().setFront(updated);
  },

  // --------------------
  // FOLDERS
  // --------------------
  loadFolders: async () => {
    const systemId = get().systemId;
    if (!systemId) return;

    const folders = await getFoldersBySystem(systemId);
    set({ systemFolders: folders || [] });
  },

  removeFromFront: (memberId) =>
  set((state) => ({
    currentFront: state.currentFront.filter((id) => id !== memberId),
  })),
}));