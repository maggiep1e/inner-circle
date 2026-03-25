import { supabase } from "../lib/supabase";

export async function uploadFile(file, folder = "avatars") {
  if (!file) throw new Error("No file provided");

  const fileExt = file.name.split(".").pop();
  const filePath = `${folder}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(folder)
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(folder).getPublicUrl(filePath);
  return { path: filePath, url: data?.publicUrl || null };
}

export function getPublicUrl(path, folder = "avatars") {
  if (!path) return null;
  const { data } = supabase.storage.from(folder).getPublicUrl(path);
  return data?.publicUrl || null;
}