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

export async function createSystem(data) {
  const { data: created, error } = await supabase
    .from("systems")
    .insert([
      {
        name: data.name,
        description: data.description,
        color: data.color,
        avatar: data.avatar,
        user_id: data.user_id,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return created;
}