
import * as XLSX from "xlsx";
import { uploadFileFromUrl } from "../api/avatar";

async function normalizeAvatar(url) {
  if (!url) return null;

  if (!url.startsWith("http")) return url;

  try {
    const uploaded = await uploadFileFromUrl(url, "avatar");
    return uploaded?.path || null;
  } catch (err) {
    console.warn("avatar upload failed:", err);
    return url;
  }
}

function normalizeColor(c) {
  if (!c) return "#3b82f6";

  c = String(c).trim();

  if (c.startsWith("#")) return c;

  // Excel hex without #
  if (/^[0-9A-Fa-f]{6}$/.test(c)) return `#${c}`;

  return "#3b82f6";
}

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

          name: row.name || row.Name || "Unnamed",
          display_name: row.displayName || row["Display Name"] || row.name,

          color: normalizeColor(row.color),
          description: row.description || null,
          pronouns: row.pronouns || null,

          avatar_raw: row.avatar || row.avatar_url || null,
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
    { headers: { Authorization: token } }
  );

  if (!membersRes.ok) throw new Error("Failed to fetch members");

  const members = await membersRes.json();

  return members.map((m) => ({
    source: "pluralkit",

    name: m.name,
    display_name: m.display_name || m.name,

    color: normalizeColor(m.color),
    description: m.description ?? null,
    pronouns: m.pronouns ?? null,

    avatar_raw: m.avatar_url || null,
  }));
}