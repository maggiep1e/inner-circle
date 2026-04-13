import { supabase } from "../lib/supabase";

export async function getFronts(systemId) {
  const { data, error } = await supabase
    .from("front_logs")
    .select("member_id, front_status")
    .eq("system_id", systemId)
    .eq("is_active", true);

  if (error) {
    console.error("getFronts error:", error);
    return [];
  }

  return data;
}


export async function addToFront(systemId, memberId, userId, status) {
    await supabase
    .from("members")
    .update({ is_fronting: true })
    .eq("system_id", systemId)
    .eq("id", memberId);

  return supabase.from("front_logs").insert({
    system_id: systemId,
    member_id: memberId,
    start_time: new Date().toISOString(),
    is_active: true,
    front_status: status || "",
    user_id: userId,
  });
}

export async function removeFromFront( memberId) {
      await supabase
    .from("members")
    .update({ is_fronting: false })
    .eq("id", memberId);


  return supabase
    .from("front_logs")
    .update({ is_active: false, end_time: new Date().toISOString() })
    .eq("member_id", memberId)
    .eq("is_active", true);
}

export async function updateFrontStatus(systemId, memberId, status) {
  return supabase
    .from("front_logs")
    .update({ front_status: status })
    .eq("system_id", systemId)
    .eq("member_id", memberId)
    .eq("is_active", true);
}
