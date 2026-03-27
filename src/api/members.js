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


export async function importMembers({
  systemId,
  rawMembers = [],
  existingMembers = [],
  onProgress
}) {
  if (!systemId) throw new Error("Missing systemId");
  if (!rawMembers.length) throw new Error("No members to import");

  const existingSet = new Set(
    (existingMembers || []).map((m) =>
      normalize(m.display_name || m.name)
    )
  );

  const added = [];
  const skipped = [];
let completed = 0;

for (const m of rawMembers) {
  const name = normalize(m.display_name || m.name);

  try {
    if (existingSet.has(name)) {
      skipped.push({ ...m, reason: "duplicate" });
    } else {
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
        pronouns: m.pronouns
      });

      added.push(newMember);
      existingSet.add(name);
    }
  } catch (err) {
    console.error("Import error:", err);
    skipped.push({ ...m, reason: err.message });
  }

  completed++;
  onProgress({ completed, total: rawMembers.length });
  }

  return { added, skipped };
}
