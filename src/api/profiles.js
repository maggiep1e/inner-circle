import { supabase } from "../lib/supabase";

// --- Fetch a profile by owner_id / type ---
export async function getProfiles(type, ownerId) {
  if (!ownerId) throw new Error("Owner ID required");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", ownerId); // PK = id (auth user id)

  if (error) throw error;

  return data?.length ? data[0] : null;
}

// --- Create or update a profile safely ---
export async function updateProfile(profile) {
  if (!profile?.id) throw new Error("Profile must have an id");

  // Upsert using id as PK, safe for duplicates
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" }) // PK is 'id'
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- Explicit create if needed (rare now) ---
export async function createProfile(profileData) {
  if (!profileData?.id) throw new Error("Profile must have an id");

  const { data, error } = await supabase
    .from("profiles")
    .insert([profileData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- Delete a profile ---
export async function deleteProfile(id) {
  if (!id) throw new Error("Profile id required");

  const { data, error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", id)
    .select();

  if (error) throw error;
  return data;
}

// --- Upload avatar and return public URL ---
export async function uploadAvatar(file, userId) {
  if (!file || !userId) return null;

  const ext = file.name.split(".").pop();
  const path = `avatars/${userId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: urlData, error: urlError } = supabase.storage
    .from("avatars")
    .getPublicUrl(path);

  if (urlError) throw urlError;
  return urlData.publicUrl;
}