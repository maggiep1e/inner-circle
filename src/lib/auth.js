import { supabase } from "./supabase";

export async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({ provider: "google" });
}

export async function signInWithDiscord() {
  await supabase.auth.signInWithOAuth({ provider: "discord" });
}

// Email/password signup & login
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getUser() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}