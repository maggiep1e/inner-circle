import { supabase } from "../lib/supabase";

// Get all folders for a user
export async function getFolders(userId) {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load folders:", error);
    return [];
  }

  return data;
}

export async function getFoldersBySystem(systemId) {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("system_id", systemId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load folders:", error);
    return [];
  }
  return data;
}


// Get members inside a folder (folder.member_ids is a uuid[] array)
// api/folders.js


// Create a new folder
export async function createFolder({ name, user_id, member_ids = [] }) {
  const { data, error } = await supabase
    .from("folders")
    .insert([{ name, user_id, member_ids }])
    .select()
    .single();

  if (error) {
    console.error("Failed to create folder:", error);
    throw error;
  }

  return data;
}

export async function getMembersByFolder(folderId) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .contains("folders", [folderId]); // folderId must be UUID, folders column must be uuid[]

  if (error) {
    console.error("Failed to get members by folder:", error);
    return [];
  }
  return data;
}

// Optional: delete a folder
export async function deleteFolder(id) {
  const { data, error } = await supabase
    .from("folders")
    .delete()
    .eq("id", id)
    .select();

  if (error) throw error;
  return data;
}


// update folder to add a member
export async function updateFolder(folderId, updates) {
  const { data, error } = await supabase
    .from("folders")
    .update(updates)
    .eq("id", folderId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update folder:", error);
    throw error;
  }

  return data;
}