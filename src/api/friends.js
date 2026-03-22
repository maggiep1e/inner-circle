import { supabase } from "../lib/supabase";

// SEND REQUEST
export async function sendFriendRequest(friendId) {

  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("friends")
    .insert([
      {
        user_id: userData.user.id,
        friend_id: friendId,
        status: "pending"
      }
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}

// GET FRIENDS (accepted)
export async function getFriends() {

  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("friends")
    .select("*")
    .or(`user_id.eq.${userData.user.id},friend_id.eq.${userData.user.id}`)
    .eq("status", "accepted");

  if (error) throw error;

  return data;
}

// GET REQUESTS
export async function getRequests() {

  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("friends")
    .select("*")
    .eq("friend_id", userData.user.id)
    .eq("status", "pending");

  if (error) throw error;

  return data;
}

// ACCEPT REQUEST
export async function acceptRequest(id) {
  const { data, error } = await supabase
    .from("friends")
    .update({ status: "accepted" })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}