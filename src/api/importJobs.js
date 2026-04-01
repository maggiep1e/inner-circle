import { supabase } from "../lib/supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function createImportJob({ systemId, userId, toAdd, toUpdate }) {
  const { data, error } = await supabase
    .from("import_jobs")
    .insert({
      system_id: systemId,
      user_id: userId,
      payload: { toAdd, toUpdate },
    })
    .select();

  if (error) {
    console.error("createImportJob error:", error);
    throw error;
  }

  return data?.[0];
}

export async function startImportJob(jobId) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/import-members`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ jobId }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("startImportJob error:", text);
    throw new Error("Failed to start import job");
  }

  return res.json();
}


export async function getImportJob(jobId) {
  const { data, error } = await supabase
    .from("import_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error) {
    console.error("getImportJob error:", error);
    throw error;
  }

  return data;
}