// src/store/systemStore.js
import { create } from "zustand";
import { getMembers, createMember, updateMember } from "../api/members";
import { getFolders, createFolder } from "../api/folders";
import { getSystems, createSystem } from "../api/systems";
import { useSessionStore } from "./sessionStore";

export const useSystemStore = create((set, get) => ({
  systemId: null,
  systems: [],
  members: [],
  folders: [],
  systemFolders: [],
  currentFront: null,
  memberId: null,
  currentSystem: null,
 

  // --- Setters ---
  setSystemId: (id) => set({ systemId: id }),
  setSystems: (systems) => {
    set({ systems });
    if (systems.length > 0) {
      if (!get().systemId) get().setSystemId(systems[0].id);
      if (!get().currentSystem) set({ currentSystem: systems[0] });
    }
  },
  setCurrentSystem: (system) => {
    if (!system) return;
    set({ currentSystem: system, systemId: system.id });
  },
  setCurrentFront: (memberId) => set({ currentFront: memberId }),

  // --- Load Systems ---
  loadSystems: async () => {
    const { userId, user } = useSessionStore.getState();
    if (!userId) return;

    try {
      const data = await getSystems(userId);
      const filteredData = !user?.plan || user.plan !== "paid" ? data.slice(0, 1) : data;

      set({ systems: filteredData });

      if (filteredData.length > 0) {
        get().setSystemId(filteredData[0].id);
        set({ currentSystem: filteredData[0] });
      } else {
        set({ currentSystem: null });
      }
    } catch (err) {
      console.error("Failed to load systems:", err);
      set({ systems: [], currentSystem: null });
    }
  },

  // --- Create and set a new system ---
  createAndSetSystem: async (name) => {
    const { data: { user } } = await import("../lib/supabase").then(m =>
      m.supabase.auth.getUser()
    );
    if (!user) throw new Error("User not authenticated");

    const currentSystems = get().systems;
    if ((!user.plan || user.plan !== "paid") && currentSystems.length >= 1) {
      alert("Free users can only have one system. Upgrade to create more.");
      return null;
    }

    const newSystem = await createSystem({ name, user_id: user.id });
    get().setSystems([...(currentSystems || []), newSystem]);
    get().setCurrentSystem(newSystem);
    await get().loadMembers();
    return newSystem;
  },

updateSystem: async (id, updates) => {
  try {
    const updated = await updateSystemApi(id, updates); // 👈 rename import (see below)

    set((state) => ({
      systems: state.systems.map((sys) =>
        sys.id === id ? updated : sys
      ),
      currentSystem:
        state.currentSystem?.id === id ? updated : state.currentSystem,
    }));

    return updated;
  } catch (err) {
    console.error("Failed to update system:", err);
    throw err;
  }
},


  // --- Members ---
  loadMembers: async () => {
    const systemId = get().systemId;
    if (!systemId) {
      console.warn("No systemId set, skipping loadMembers");
      set({ members: [] });
      return [];
    }

    try {
      const data = await getMembers(systemId);
      const normalized = data.map((m) => ({ ...m, id: m._id || m.id }));
      set({ members: normalized });
      return normalized;
    } catch (err) {
      console.error("Failed to load members:", err);
      set({ members: [] });
      return [];
    }
  },

  addMember: async (memberData) => {
    const systemId = get().systemId;
    if (!systemId) throw new Error("No system selected");

    const newMember = await createMember({ ...memberData, system_id: systemId });
    const normalized = { ...newMember, id: newMember._id || newMember.id };
    set((state) => ({ members: [normalized, ...state.members] }));
    return normalized;
  },

  updateMember: async (id, updates) => {
    const normalizedUpdates = {
      ...updates,
      folders: Array.isArray(updates.folders) ? updates.folders.map(f => f.trim()).filter(Boolean) : [],
      tags: Array.isArray(updates.tags) ? updates.tags.map(t => t.trim()).filter(Boolean) : [],
    };

    const updated = await updateMember(id, normalizedUpdates);
    const normalized = {
      ...updated,
      id: updated._id || updated.id,
      folders: Array.isArray(updated.folders) ? updated.folders.map(f => (typeof f === "string" ? f : f.name)).filter(Boolean) : [],
      tags: Array.isArray(updated.tags) ? updated.tags.map(t => (typeof t === "string" ? t : t.name)).filter(Boolean) : [],
    };

    set((state) => ({
      members: state.members.map((m) => (m.id === id ? normalized : m)),
    }));
  },

  // --- Folders ---
  loadFolders: async () => {
    const systemId = get().systemId;
    if (!systemId) return;

    try {
      const folders = await getFoldersBySystem(systemId);
      set({ systemFolders: folders || [] });
    } catch (err) {
      console.error("Failed to load folders:", err);
      set({ systemFolders: [] });
    }
  },

  addFolder: (folder) => {
    set((state) => ({ systemFolders: [...state.systemFolders, folder] }));
  },

  updateFolderMembers: (folderId, memberIds) => {
    // update members in folders locally
    const members = get().members.map((m) => {
      if (memberIds.includes(m.id)) {
        if (!m.folders.includes(folderId)) return { ...m, folders: [...m.folders, folderId] };
      } else {
        if (m.folders.includes(folderId)) return { ...m, folders: m.folders.filter((f) => f !== folderId) };
      }
      return m;
    });
    set({ members });
  },
}));
