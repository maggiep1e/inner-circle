import { supabase } from "../lib/supabase";

/**
 * Helper: get current user id safely
 */
async function getUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user.id;
}

/**
 * SEND FRIEND REQUEST
 */
export async function sendFriendRequest(friendId) {
  const userId = await getUserId();

  // prevent self-add
  if (userId === friendId) {
    throw new Error("You cannot add yourself.");
  }

  // check if already exists
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
        receiver_id: friendId, // ✅ fixed spelling
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * GET FRIENDS (accepted)
 * Includes BOTH users (requester + receiver)
 */
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

/**
 * GET INCOMING FRIEND REQUESTS
 */
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

/**
 * GET OUTGOING FRIEND REQUESTS
 */
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

/**
 * ACCEPT FRIEND REQUEST
 */
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

/**
 * REJECT / CANCEL FRIEND REQUEST
 */
export async function rejectRequest(id) {
  const { error } = await supabase
    .from("friends")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}

/**
 * HELPER: Get "other user" from a friend object
 */
export function getOtherUser(friend, userId) {
  return friend.requester_id === userId
    ? friend.receiver
    : friend.requester;
}

// Update a friend's note
export async function updateFriendNote(friendId, note) {
  const { error } = await supabase
    .from("friends")
    .update({ note })
    .eq("id", friendId);

  if (error) throw error;
  return true;
}

// Remove friend
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