import { supabase } from "../lib/supabase";

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

export async function setFronts(systemId, memberIds) {
  const { error: deleteError } = await supabase
    .from("front_logs")
    .delete()
    .eq("system_id", systemId);

  if (deleteError) {
    console.error("delete fronts error:", deleteError);
    throw deleteError;
  }

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

export async function addToFront(systemId, memberId) {
  return supabase.from("system_front").insert({
    system_id: systemId,
    member_id: memberId,
  });
}

export async function removeFromFront(systemId, memberId) {
  return supabase
    .from("system_front")
    .delete()
    .eq("system_id", systemId)
    .eq("member_id", memberId);
}