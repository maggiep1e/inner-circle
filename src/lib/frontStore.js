import { supabase } from "./supabase";

export async function getCurrentFront(systemId) {
  if (!systemId) return null;

  const { data, error } = await supabase
    .from("front_logs")
    .select("*")
    .eq("system_id", systemId)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Failed to fetch current front:", error);
    return null;
  }

  return data;
}