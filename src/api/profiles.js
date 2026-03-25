import { supabase } from "../lib/supabase";

export async function getProfiles(type, ownerId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("type", type)
    .eq("owner_id", ownerId);
  if (error) throw error;
  return data;
}

export async function updateProfile(profile) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert([profile])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProfile(id) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProfile(profileData) {
  const { data, error } = await supabase
    .from("profiles")
    .insert([profileData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProfile(id) {
  const { data, error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", id)
    .select();

  if (error) throw error;
  return data;
}

export async function uploadAvatar(file, userId) {
  const filePath = `avatars/${userId}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  return filePath;
}