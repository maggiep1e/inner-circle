import { create } from "zustand";
import { supabase } from "../lib/supabase";

import {
  updateMember as updateMemberApi,
  deleteMember as deleteMemberApi,
} from "../api/members";

import {
  getSystems,
  createSystem,
  updateSystem as updateSystemApi,
  deleteSystem as deleteSystemApi,
  getSubsystemsBySystem,
  createSubsystem,
  getAllSystems, getPolls, updatePollAnswer, createPoll, deletePoll
} from "../api/systems";

import { getFoldersBySystem } from "../api/folders";
import { getPublicUrl } from "../api/avatar";

function buildSystemTree(systems) {
  const map = new Map();
  const roots = [];

  systems.forEach((sys) => {
    map.set(sys.id, { ...sys, children: [] });
  });

  systems.forEach((sys) => {
    if (sys.parent_system_id) {
      const parent = map.get(sys.parent_system_id);
      if (parent) {
        parent.children.push(map.get(sys.id));
      }
    } else {
      roots.push(map.get(sys.id));
    }
  });

  return roots;
}

function findSystemById(tree, id) {
  for (const node of tree) {
    if (node.id === id) return node;

    if (node.children?.length) {
      const found = findSystemById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}


function insertIntoTree(tree, parentId, newNode) {
  return tree.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...(node.children || []), newNode],
      };
    }

    if (node.children?.length) {
      return {
        ...node,
        children: insertIntoTree(node.children, parentId, newNode),
      };
    }

    return node;
  });
}


export const useSystemStore = create((set, get) => ({
  systemId: null,
  systems: [],
  systemTree: [],
  systemMap: {},
  members: [],
  systemFolders: [],
  systemSubsystems: [],
  currentFront: [],
  currentSystem: null,
  polls: [],

  resolveAvatar: (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return getPublicUrl(path);
  },

// systems

 loadSystems: async (userId) => {
  if (!userId) return [];

  try {
    const data = await getAllSystems(userId);

    const systemsWithAvatar = (data || []).map((s) => ({
      ...s,
      avatarUrl: get().resolveAvatar(s.avatar),
    }));

    const tree = buildSystemTree(systemsWithAvatar);

    set({ systems: tree });

    return tree;
  } catch (err) {
    console.error("loadSystems error:", err);
    set({ systems: [] });
    return [];
  }
},

  hydrateSystem: async (systemId) => {
    if (!systemId) return;

    const system = findSystemById(get().systems, systemId);

    set({
      systemId,
      currentSystem: system || null,
    });

    await Promise.all([
      get().loadMembers(systemId),
      get().loadCurrentFront(systemId),
      get().loadFolders(systemId),
      get().getSubsystems(systemId),
      get().getPollsBySystem(systemId),
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

    getSubsystems: async (systemId) => {
      if (!systemId) return [];

      try {
        const data = await getSubsystemsBySystem(systemId);

        const subsystems = (data || []).map((s) => ({
          ...s,
          avatarUrl: get().resolveAvatar(s.avatar),
        }));
        set({ systemSubsystems: subsystems });
        return subsystems;
      } catch (err) {
        console.error("getSubsystems error:", err);
        set({ systemSubsystems: [] });
        return [];
      }
    },

  addSubsystem: async (data) => {
  const created = await createSubsystem({
    ...data,
    avatar: data.avatar || null,
  });

  const subsystem = {
    ...created,
    avatarUrl: get().resolveAvatar(created.avatar),
    children: [],
  };

  set((state) => ({
    systems: insertIntoTree(
      state.systems,
      data.parent_system_id,
      subsystem
    ),
  }));

  return subsystem;
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
loadCurrentFront: async (systemId) => {
  if (!systemId) return;

  const { data, error } = await supabase
    .from("front_logs")
    .select("*")
    .eq("id", systemId)
    .eq("is_active", true);

  if (error) throw error;

  set({
    currentFront: data || [],
  });
},


//folders 
  loadFolders: async (systemId) => {
    const id = systemId || get().systemId;
    if (!id) return;

    const folders = await getFoldersBySystem(id);

    set({ systemFolders: folders || [] });
  },

  //polls

  getPollsBySystem: async (systemId) => {
    if (!systemId) return;

    const data = await getPolls(systemId);

    set({ polls: data || [] });
  },

  updatePolls: async (pollId, systemId, userId, answers) => {
    if (!pollId || !systemId || !userId) return;

    await updatePollAnswer(pollId, systemId, userId, answers); 
    await get().getPollsBySystem(systemId);

     if (error) {
      console.error("updatePollAnswer error:", error);
    }
  },

  createPoll: async (data) => {
    const { data: created, error } = await createPoll(data);

     if (error) {
      console.error("createPoll error:", error);
    }
    return created;
  },

  deletePoll: async (pollId) => {
    await deletePoll(pollId);
    set((state) => ({
      polls: state.polls.filter((p) => p.id !== pollId),
    }));
  },
}));