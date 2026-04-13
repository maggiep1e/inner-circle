import { supabase } from "../lib/supabase";


export async function getSystems(userId) {
  if (!userId) throw new Error("User ID is required");
  const { data, error } = await supabase
    .from("systems")
    .select("*")
    .eq("user_id", userId)
    .is("parent_system_id", null);
  if (error) throw error;
  return data;
}

export async function getSystem(id) {
  const { data, error } = await supabase
    .from("systems")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateSystem(id, updates) {
  const { data, error } = await supabase
    .from("systems")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createSystem(data) {
  const { data: created, error } = await supabase
    .from("systems")
    .insert([
      {
        name: data.name,
        description: data.description,
        color: data.color,
        avatar: data.avatar,
        user_id: data.user_id,
      },
    ])
    .select()
    .single();

    await supabase
    .from("profiles")
    .update({ onboardingStep: "done" })
    .eq("id", data.user_id);

  if (error) throw error;

  return created;
}

export async function deleteSystem(id) {
  const { error } = await supabase
    .from("systems")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function getSubsystemsBySystem(systemId) {
  const { data, error } = await supabase
    .from("systems")
    .select("*")
    .eq("parent_system_id", systemId);

  if (error) throw error;

  return data;
}

export async function createSubsystem(data) {
  const { data: created, error } = await supabase
    .from("systems") 
    .insert([
      {
        name: data.name,
        description: data.description,
        color: data.color,
        avatar: data.avatar,
        user_id: data.user_id,
        parent_system_id: data.parent_system_id,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return created;
}


export async function getAllSystems(userId) {
  const { data, error } = await supabase
    .from("systems")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data;
}

export async function getPolls(systemId) {
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("system_id", systemId)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data;
}
export async function createPoll(data) {
  const { data: created, error } = await supabase
    .from("polls")
    .insert([
      {
        question: data.question,
        answers: data.answers,
        options: data.options,
        user_id: data.user_id,
        system_id: data.system_id,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return created;
}

export async function updatePollAnswer(pollId, systemId, userId, answers) {
  const { data: existing, error: existingError } = await supabase
    .from("polls")
    .select("*")
    .eq("id", pollId)
    .eq("user_id", userId)
    .eq("system_id", systemId)
    .single();

  if (existingError && existingError.code !== "PGRST116") {
    throw existingError;
  } 

  if (existing) {
    const { data, error } = await supabase
      .from("polls")
      .update({ answers: answers })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  
}

export async function deletePoll(pollId) {
  const { error } = await supabase
    .from("polls")
    .delete()
    .eq("id", pollId); 
  if (error) throw error;
}
