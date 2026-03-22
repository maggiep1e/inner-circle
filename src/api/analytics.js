import { supabase } from "../lib/supabase";

// GET FRONT TIME ANALYTICS
export async function getFrontAnalytics(systemId) {

  const { data, error } = await supabase
    .from("front_logs")
    .select("*")
    .eq("system_id", systemId);

  if (error) throw error;

  // optional: compute totals per member
  const totals = {};

  data.forEach(log => {
    if (!log.end_time) return;

    const duration =
      new Date(log.end_time) - new Date(log.start_time);

    if (!totals[log.member_id]) {
      totals[log.member_id] = 0;
    }

    totals[log.member_id] += duration;
  });

  return totals;
}