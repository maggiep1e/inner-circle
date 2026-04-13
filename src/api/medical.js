import { supabase } from "../lib/supabase";

export async function createMedicalEntry(data) {
  const { data: created, error } = await supabase
    .from("medical_entries")
    .insert([data])
    .select()
    .single();
    if (error) throw error;
    return created;
}

export async function getMedicalEntriesByUser(userId) {
  const { data, error } = await supabase
    .from("medical_entries")
    .select("*")
    .eq("user_id", userId)
    .order("for_date", { ascending: false });
  if (error) throw error;
  return data;
}