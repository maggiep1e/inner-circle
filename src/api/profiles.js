import { supabase } from "../lib/supabase";



// type: "user" | "system"
// ownerId: supabase user id
export async function getProfiles(type, ownerId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("type", type)
    .eq("owner_id", ownerId);
  if (error) throw error;
  return data;
}

// Create or update a profile
export async function updateProfile(profile) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert([profile])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Get a single profile by ID
export async function getProfile(id) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Create a new profile
export async function createProfile(profileData) {
  const { data, error } = await supabase
    .from("profiles")
    .insert([profileData])
    .select()
    .single();

  if (error) throw error;
  return data;
}


// Optional: delete a profile
export async function deleteProfile(id) {
  const { data, error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", id)
    .select();

  if (error) throw error;
  return data;
}