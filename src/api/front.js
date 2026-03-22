import { supabase } from "../lib/supabase";

// START FRONT
export async function startFront(memberId, systemId) {

  const { data: userData } = await supabase.auth.getUser();

  // end any active front first
  await supabase
    .from("front_logs")
    .update({
      end_time: new Date(),
      is_active: false
    })
    .eq("user_id", userData.user.id)
    .eq("system_id", systemId)
    .eq("is_active", true);

  // start new front
  const { data, error } = await supabase
    .from("front_logs")
    .insert([
      {
        user_id: userData.user.id,
        system_id: systemId,
        member_id: memberId,
        start_time: new Date(),
        is_active: true
      }
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}