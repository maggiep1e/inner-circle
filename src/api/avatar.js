import { supabase } from "../lib/supabase";

const BUCKET = "avatars";

function sanitizeFileName(name) {
  return name
    .replace(/[{}]/g, "")      // remove { }
    .replace(/\s/g, "_")       // spaces → _
    .replace(/[^a-zA-Z0-9._-]/g, ""); // remove weird chars
}

export async function uploadFile(file, folder = "avatars") {
  if (!file) throw new Error("No file provided");

  const cleanName = sanitizeFileName(file.name);

  const ext = cleanName.split(".").pop();
  const filePath = `${folder}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) throw error;

  return {
    path: filePath,
    url: getPublicUrl(filePath),
  };
}

/**
 * Convert storage path → public URL
 */
export function getPublicUrl(path) {
  if (!path) return null;

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return data?.publicUrl || null;
}

export async function uploadAvatarFromUrl(url, fileName) {
  if (!url) return null;

  try {
    // 1. download image
    const res = await fetch(url);
    const blob = await res.blob();

    // 2. upload to Supabase Storage
    const path = `avatars/${fileName}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, blob, {
        upsert: true,
        contentType: blob.type,
      });

    if (error) throw error;

    // 3. get public URL
    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    return data.publicUrl;
  } catch (err) {
    console.error("Avatar upload failed:", err);
    return null;
  }
}