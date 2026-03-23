import { supabase } from "../lib/supabase";

// GET members for selected system
export async function getMembers(systemId) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("system_id", systemId)
    .order("created_at");

  if (error) throw error;

  return data;
}


export async function addMemberToFolder(folderId, memberId) {
  const { data, error } = await supabase
    .from("folders")
    .update({
      member_ids: supabase.raw("array_append(member_ids, ?)", [memberId])
    })
    .eq("id", folderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// CREATE
export async function createMember(member) {

  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("members")
    .insert([
      {
        ...member,
        user_id: userData.user.id
      }
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}

// UPDATE
export async function updateMember(id, updates) {
  const { data, error } = await supabase
    .from("members")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// Optional: delete a profile
export async function deleteMember(id) {
  const { data, error } = await supabase
    .from("members")
    .delete()
    .eq("id", id)
    .select();

  if (error) throw error;
  return data;
}