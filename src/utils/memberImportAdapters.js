import { normalizeMember } from "./memberAdapters";
import * as XLSX from "xlsx";

export async function importFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        const members = json.map((row) => ({
  source: "excel",

  name: row.name || row.Name,
  display_name: row.displayName || row["Display Name"] || row.name,

  color: row.color || null,
  description: row.description || null,
  pronouns: row.pronouns || null,
  avatar_url: row.avatar_url || null,
}));

        resolve(members);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export async function importFromPluralKit(token) {
  if (!token) throw new Error("Missing PluralKit token");

  const systemRes = await fetch("https://api.pluralkit.me/v2/systems/@me", {
    headers: { Authorization: token },
  });

  if (!systemRes.ok) throw new Error("Invalid PluralKit token");

  const system = await systemRes.json();

  const membersRes = await fetch(
    `https://api.pluralkit.me/v2/systems/${system.id}/members`,
    {
      headers: { Authorization: token },
    }
  );

  if (!membersRes.ok) throw new Error("Failed to fetch members");

  const members = await membersRes.json();

  return members.map((m) => ({
    source: "pluralkit",

    name: m.name,
    display_name: m.display_name || m.name,

    color: m.color ?? null,
    description: m.description ?? null,
    pronouns: m.pronouns ?? null,
    avatar_url: m.avatar_url ?? null,
  }));
}
