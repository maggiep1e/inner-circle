import { supabase } from "../lib/supabase";
import { uploadAvatarFromUrl } from "./avatar";


export async function getMembers(systemId) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("system_id", systemId)
    .order("created_at");

  if (error) throw error;

  return data;
}

export async function addMemberToFolder(folderId, memberId) {
  const { data, error } = await supabase
    .from("folders")
    .update({
      member_ids: supabase.raw("array_append(member_ids, ?)", [memberId])
    })
    .eq("id", folderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createMember(member) {

  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("members")
    .insert([
      {
        ...member,
        user_id: userData.user.id
      }
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateMember(id, updates) {
  const { data, error } = await supabase
    .from("members")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteMember(id) {
  const { data, error } = await supabase
    .from("members")
    .delete()
    .eq("id", id)
    .select();

  if (error) throw error;
  return data;
}
const normalize = (n) => (n || "").toLowerCase().trim();

const isSameMember = (a, b) => {
  return (
    normalize(a.display_name || a.name) ===
      normalize(b.display_name || b.name) &&
    normalize(a.description) === normalize(b.description) &&
    normalize(a.pronouns) === normalize(b.pronouns) &&
    normalize(a.avatar || a.avatar_url) ===
      normalize(b.avatar || b.avatar_url)
  );
};

export async function importMembers({
  systemId,
  rawMembers = [],
  existingMembers = [],
  onProgress,
}) {
  if (!systemId) throw new Error("Missing systemId");
  if (!rawMembers.length) throw new Error("No members to import");

  const added = [];
  const skipped = [];

  let completed = 0;

  const seen = [];

  for (const m of rawMembers) {
    try {
  
      const duplicateExisting = existingMembers.some((e) =>
        isSameMember(e, m)
      );

      if (duplicateExisting) {
        skipped.push({ ...m, reason: "identical duplicate" });
        completed++;
        onProgress({ completed, total: rawMembers.length });
        continue;
      }

   
      const duplicateBatch = seen.some((s) => isSameMember(s, m));

      if (duplicateBatch) {
        skipped.push({ ...m, reason: "duplicate in import file" });
        completed++;
        onProgress({ completed, total: rawMembers.length });
        continue;
      }

      let avatarUrl = null;

      if (m.avatar_url) {
        try {
          avatarUrl = await uploadAvatarFromUrl(
            m.avatar_url,
            `${systemId}-${crypto.randomUUID()}`
          );
        } catch (err) {
          console.warn("Avatar failed, continuing...");
        }
      }

      const newMember = await createMember({
        system_id: systemId,
        name: m.name,
        display_name: m.display_name,
        color: m.color,
        description: m.description,
        avatar: avatarUrl,
        pronouns: m.pronouns,
      });

      added.push(newMember);
      seen.push(m); 

    } catch (err) {
      console.error("Import error:", err);
      skipped.push({ ...m, reason: err.message });
    }

    completed++;
    onProgress({ completed, total: rawMembers.length });
  }

  return { added, skipped };
}