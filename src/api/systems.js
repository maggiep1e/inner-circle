// src/api/systems.js
import { supabase } from "../lib/supabase";

// Get all systems for a user
export async function getSystems(userId) {
  if (!userId) throw new Error("User ID is required");
  const { data, error } = await supabase
    .from("systems")
    .select("*")
    .eq("user_id", userId); // matches your table column
  if (error) throw error;
  return data;
}

// Get a single system
export async function getSystem(id) {
  const { data, error } = await supabase
    .from("systems")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

// Update a system
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

// CREATE a system using the userId from your app state
export async function createSystem({ name, user_id }) {
  if (!user_id) throw new Error("User ID is required to create a system");

  const { data, error } = await supabase
    .from("systems")
    .insert([{ display_name: name, user_id }]) // match your table column names
    .select()
    .single();

  if (error) throw error;
  return data;
}