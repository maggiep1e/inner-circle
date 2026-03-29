import { supabase } from "../lib/supabase";

const BUCKET = "avatars";

function sanitizeFileName(name) {
  return name
    .replace(/[{}]/g, "")     
    .replace(/\s/g, "_")       
    .replace(/[^a-zA-Z0-9._-]/g, "");
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


export function getPublicUrl(path) {
  if (!path) return null;

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return data?.publicUrl || null;
}

export async function uploadFileFromUrl(url, filename = "avatar") {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch file");

    const blob = await res.blob();

    const contentType = res.headers.get("content-type");
    const ext = contentType?.split("/")[1] || "png";

    const file = new File([blob], `${filename}.${ext}`, {
      type: contentType || "image/png",
    });

    return await uploadFile(file);
  } catch (err) {
    console.error("uploadFileFromUrl error:", err);
    throw err;
  }
}


  export function resolveAvatar(pathOrUrl) {
  if (!pathOrUrl) return "/default-avatar.png";

  if (pathOrUrl.startsWith("http")) return pathOrUrl;

  return getPublicUrl(pathOrUrl);
  };