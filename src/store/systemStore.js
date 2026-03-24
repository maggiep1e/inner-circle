// src/store/systemStore.js
import { create } from "zustand";
import { getMembers, createMember, updateMember } from "../api/members";
import { getSystems, createSystem } from "../api/systems";
import { getFoldersBySystem } from "../api/folders";
import { useSessionStore } from "./sessionStore";

export const useSystemStore = create((set, get) => ({
  // --- State ---
  systemId: null,
  systems: [],
  members: [],
  systemFolders: [],
  currentFront: [],
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
  setCurrentFront: (memberIds) => set({ currentFront: memberIds }),

  // --- Front Management ---
  setFront: async (memberIds) => {
    const systemId = get().systemId;
    if (!systemId) return;

    const { supabase } = await import("../lib/supabase");

    // Insert one row per member
    const inserts = memberIds.map((id) => ({ system_id: systemId, member_id: id }));
    const { error } = await supabase.from("front_logs").insert(inserts);

    if (error) {
      console.error("Failed to set front:", error);
      return;
    }

    set({ currentFront: memberIds });
  },

  toggleFront: async (memberId) => {
    const current = get().currentFront;
    const updated = current.includes(memberId)
      ? current.filter((id) => id !== memberId)
      : [...current, memberId];

    await get().setFront(updated);
  },

  loadCurrentFront: async () => {
    const systemId = get().systemId;
    if (!systemId) return;

    const { supabase } = await import("../lib/supabase");
    const { data, error } = await supabase
      .from("front_logs")
      .select("member_id")
      .eq("system_id", systemId);

    if (error) {
      console.error("Failed to load front:", error);
      return;
    }

    set({ currentFront: data.map((f) => f.member_id) });
  },

  // --- Systems ---
  loadSystems: async () => {
    const { userId, user } = useSessionStore.getState();
    if (!userId) return;

    try {
      const data = await getSystems(userId);
      const filtered = !user?.plan || user.plan !== "paid" ? data.slice(0, 1) : data;

      set({ systems: filtered });

      if (filtered.length > 0) {
        get().setSystemId(filtered[0].id);
        set({ currentSystem: filtered[0] });
        await get().loadCurrentFront();
      } else {
        set({ currentSystem: null });
      }
    } catch (err) {
      console.error("Failed to load systems:", err);
      set({ systems: [], currentSystem: null });
    }
  },

  createAndSetSystem: async (name) => {
    const { data: { user } } = await import("../lib/supabase").then((m) =>
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
      const updated = await updateSystemApi(id, updates); // make sure updateSystemApi is imported
      set((state) => ({
        systems: state.systems.map((s) => (s.id === id ? updated : s)),
        currentSystem: state.currentSystem?.id === id ? updated : state.currentSystem,
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
    if (!systemId) return set({ members: [] });

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
      folders: Array.isArray(updates.folders) ? updates.folders.map((f) => f.trim()).filter(Boolean) : [],
      tags: Array.isArray(updates.tags) ? updates.tags.map((t) => t.trim()).filter(Boolean) : [],
    };

    const updated = await updateMember(id, normalizedUpdates);
    const normalized = {
      ...updated,
      id: updated._id || updated.id,
      folders: Array.isArray(updated.folders) ? updated.folders.map((f) => (typeof f === "string" ? f : f.name)).filter(Boolean) : [],
      tags: Array.isArray(updated.tags) ? updated.tags.map((t) => (typeof t === "string" ? t : t.name)).filter(Boolean) : [],
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