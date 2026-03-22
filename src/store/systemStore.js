import { create } from "zustand";
import { getMembers, createMember, updateMember } from "../api/members";
import { getSystems, createSystem } from "../api/systems";
import { useSessionStore } from "./sessionStore";

export const useSystemStore = create((set, get) => ({
  systemId: null,
  systems: [],          // <-- add systems array
  members: [],
  currentFront: null,
  memberId: null,

  updateCurrentFront: (memberId) => set({ currentFront: memberId }),

  setSystemId: (id) => {
    useSessionStore.getState().setSystem(id); // sync with session store
    set({ systemId: id });
  },

  loadSystems: async () => {
    try {
      const data = await getSystems(); // fetch all systems for user
      set({ systems: data });
    } catch (err) {
      console.error("Failed to load systems:", err);
      set({ systems: [] });
    }
  },

  loadMembers: async () => {
    const systemId = get().systemId;
    if (!systemId) return;

    const data = await getMembers(systemId);
    const normalized = data.map((m) => ({ ...m, id: m._id || m.id }));
    set({ members: normalized });
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
    const updated = await updateMember(id, updates);
    const normalized = { ...updated, id: updated._id || updated.id };

    set((state) => ({
      members: state.members.map((m) => (m.id === id ? normalized : m)),
    }));
  },

  createAndSetSystem: async (name) => {
    const { data: { user } } = await import("../lib/supabase").then(m =>
      m.supabase.auth.getUser()
    );
    if (!user) throw new Error("User not authenticated");

    const newSystem = await createSystem(name);
    get().setSystemId(newSystem.id);
    await get().loadMembers();
    await get().loadSystems(); // also refresh systems
    return newSystem;
  },
}));