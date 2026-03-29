import { supabase } from "../lib/supabase";

export async function getProfiles(type, ownerId) {
  if (!ownerId) throw new Error("Owner ID required");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", ownerId); 

  if (error) throw error;

  return data?.length ? data[0] : null;
}

export async function updateProfile(profile) {
  if (!profile?.id) throw new Error("Profile must have an id");

  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

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

export async function getProfile(userId) {
  if (!userId) throw new Error("User ID required");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}


export async function upsertProfile(profile) {
  if (!profile?.id) throw new Error("Profile must have an id");

  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}





