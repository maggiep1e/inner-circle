import { supabase } from "../lib/supabase";

// ----------------------
// CREATE SYSTEM JOURNAL
// ----------------------
export async function getSystemJournals(systemId) {
  const { data, error } = await supabase
    .from("journals")
    .select("*")
    .eq("system_id", systemId);
  if (error) throw error;
  return data;
}

export async function createSystemJournal(entry) {
  const { data, error } = await supabase.from("journals").insert([entry]);
  if (error) throw error;
  return data;
}




// ----------------------
// CREATE MEMBER JOURNAL
// ----------------------
export async function createMemberJournal(data) {

  const { data: userData } = await supabase.auth.getUser();

  const { data: result, error } = await supabase
    .from("journals")
    .insert([
      {
        ...data,
        user_id: userData.user.id
      }
    ])
    .select()
    .single();

  if (error) throw error;

  return result;
}

// ----------------------
// SEARCH MEMBER JOURNALS
// ----------------------
export async function searchMemberJournal(memberId) {

  const { data, error } = await supabase
    .from("journals")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}