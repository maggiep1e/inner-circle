import { supabase } from "../lib/supabase";


export async function getSystems(userId) {
  if (!userId) throw new Error("User ID is required");
  const { data, error } = await supabase
    .from("systems")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}

export async function getSystem(id) {
  const { data, error } = await supabase
    .from("systems")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateSystem(id, updates) {
  const { data, error } = await supabase
    .from("systems")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createSystem({ name, user_id }) {
  if (!user_id) throw new Error("User ID is required to create a system");

  const { data, error } = await supabase
    .from("systems")
    .insert([{ display_name: name, user_id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}