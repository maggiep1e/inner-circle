import { supabase } from "../lib/supabase";

async function getUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user.id;
}

export async function sendFriendRequest(friendId) {
  const userId = await getUserId();

  if (userId === friendId) {
    throw new Error("You cannot add yourself.");
  }

  const { data: existing } = await supabase
    .from("friends")
    .select("*")
    .or(
      `and(requester_id.eq.${userId},receiver_id.eq.${friendId}),and(requester_id.eq.${friendId},receiver_id.eq.${userId})`
    )
    .maybeSingle();

  if (existing) {
    throw new Error("Friend request already exists.");
  }

  const { data, error } = await supabase
    .from("friends")
    .insert([
      {
        requester_id: userId,
        receiver_id: friendId,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getFriends() {
  const userId = await getUserId();

 const { data, error } = await supabase
  .from("friends")
  .select(`
    id,
    status,
    note,
    requester:profiles!fk_requester(id, username, avatar, bio),
    receiver:profiles!fk_receiver(id, username, avatar, bio)
  `)
  .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
  .eq("status", "accepted");

  if (error) throw error;

  return data;
}

export async function getIncomingRequests() {
  const userId = await getUserId();

const { data, error } = await supabase
  .from("friends")
  .select(`
    id,
    status,
    note,
    requester:profiles!fk_requester(id, username, avatar, bio),
    receiver:profiles!fk_receiver(id, username, avatar, bio)
  `)
  .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
  .eq("status", "accepted");

  if (error) throw error;

  return data;
}


export async function getOutgoingRequests() {
  const userId = await getUserId();

    const { data, error } = await supabase
  .from("friends")
  .select(`
    id,
    status,
    note,
    requester:profiles!fk_requester(id, username, avatar, bio),
    receiver:profiles!fk_receiver(id, username, avatar, bio)
  `)
  .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
  .eq("status", "accepted");
  if (error) throw error;

  return data;
}


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

export async function rejectRequest(id) {
  const { error } = await supabase
    .from("friends")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}


export function getOtherUser(friend, userId) {
  return friend.requester_id === userId
    ? friend.receiver
    : friend.requester;
}


export async function updateFriendNote(friendId, note) {
  const { error } = await supabase
    .from("friends")
    .update({ note })
    .eq("id", friendId);

  if (error) throw error;
  return true;
}

export async function removeFriend(friendId) {
  const { error } = await supabase
    .from("friends")
    .delete()
    .eq("id", friendId);

  if (error) throw error;
  return true;
}

export async function getRequests() {
  return getIncomingRequests();
}