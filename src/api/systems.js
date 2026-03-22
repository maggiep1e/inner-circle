import { supabase } from "../lib/supabase";

// GET systems
export async function getSystems() {
  const { data, error } = await supabase
    .from("systems")
    .select("*")
    .order("created_at");

  if (error) throw error;

  return data;
}

// CREATE";

export async function createSystem(name) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user) throw userError || new Error("User not authenticated");

  const { data, error } = await supabase
    .from("systems")
    .insert([{ name, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// UPDATE
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