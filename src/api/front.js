// src/api/fronts.js
import { supabase } from "../lib/supabase";

// Get all current fronters for a system
export async function getFronts(systemId) {
  const { data, error } = await supabase
    .from("front_logs")
    .select("member_id")
    .eq("system_id", systemId);

  if (error) {
    console.error("getFronts error:", error);
    return [];
  }

  return data.map((f) => f.member_id);
}

// Replace entire front
export async function setFronts(systemId, memberIds) {
  // remove old
  const { error: deleteError } = await supabase
    .from("front_logs")
    .delete()
    .eq("system_id", systemId);

  if (deleteError) {
    console.error("delete fronts error:", deleteError);
    throw deleteError;
  }

  // insert new
  if (!memberIds.length) return [];

  const inserts = memberIds.map((id) => ({
    system_id: systemId,
    member_id: id,
  }));

  const { error: insertError } = await supabase
    .from("front_logs")
    .insert(inserts);

  if (insertError) {
    console.error("insert fronts error:", insertError);
    throw insertError;
  }

  return memberIds;
}

// Toggle a single member
export async function toggleFront(systemId, memberId, currentFront) {
  let updated;

  if (currentFront.includes(memberId)) {
    updated = currentFront.filter((id) => id !== memberId);
  } else {
    updated = [...currentFront, memberId];
  }

  await setFronts(systemId, updated);
  return updated;
}