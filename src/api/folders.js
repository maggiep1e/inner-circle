import { supabase } from "../lib/supabase";

/**
 * Get all folders for a given system.
 * Returns empty array if none or if RLS blocks access.
 */
export async function getFoldersBySystem(systemId) {
  if (!systemId) return [];

  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("system_id", systemId);

  if (error) {
    console.error("getFoldersBySystem error:", error.message);
    return [];
  }

  return data || [];
}

/**
 * Create a new folder for a system/user.
 */
export async function createFolder({ name, user_id, system_id, member_ids = [] }) {
  if (!name || !user_id || !system_id || !member_ids) throw new Error("Missing required fields for folder");

  const { data, error } = await supabase
    .from("folders")
    .insert([{ name, user_id, system_id, member_ids }])
    .select()
    .single();

  if (error) {
    console.error("createFolder error:", error.message);
    throw error;
  }

  return data;
}

/**
 * Get all members assigned to a specific folder.
 * Assumes members.folders is a uuid[] array.
 */
export async function getMembersByFolder(folderId) {
  if (!folderId) return [];

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .contains("folders", [folderId]);

  if (error) {
    console.error("getMembersByFolder error:", error.message);
    return [];
  }

  return data || [];
}

/**
 * Delete a folder by ID.
 */
export async function deleteFolder(id) {
  if (!id) throw new Error("Folder ID required");

  const { data, error } = await supabase
    .from("folders")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    console.error("deleteFolder error:", error.message);
    throw error;
  }

  return data || [];
}

/**
 * Update folder fields (like member_ids or name)
 */
export async function updateFolder(folderId, updates) {
  if (!folderId || !updates) throw new Error("Folder ID and updates required");

  const { data, error } = await supabase
    .from("folders")
    .update(updates)
    .eq("id", folderId)
    .select()
    .single();

  if (error) {
    console.error("updateFolder error:", error.message);
    throw error;
  }

  return data;
}