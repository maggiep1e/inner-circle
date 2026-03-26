import { supabase } from "../lib/supabase";

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

export async function getMembersByFolder(folderId) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .contains("folders", [folderId]);

  if (error) {
    console.error("getMembersByFolder error:", error);
    return [];
  }

  return data || [];
}

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
};


export async function getFolderNamesByIds(folderIds) {
  if (!folderIds || folderIds.length === 0) return [];

  const { data, error } = await supabase
    .from("folders")
    .select("id, name")
    .in("id", folderIds);

  if (error) {
    console.error("Error fetching folders:", error);
    return [];
  }

  return data.map((f) => f.name);
};