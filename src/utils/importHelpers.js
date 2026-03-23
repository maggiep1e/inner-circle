// utils/importHelpers.js

import * as XLSX from "xlsx";

// --- Excel / CSV ---
export async function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        // Map to { name, displayName }
        const members = json.map((row) => ({
          name: row.name || row.Name || "",
          displayName: row.displayName || row.DisplayName || row.name || "",
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

// --- PluralKit ---
export async function fetchPluralkitMembers(apiKey) {
  if (!apiKey) throw new Error("PluralKit API key required");
  const res = await fetch("https://api.pluralkit.me/v2/members", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error("Failed to fetch PluralKit members");
  const data = await res.json();
  return data.map((m) => ({
    name: m.name,
    displayName: m.display_name || m.name,
  }));
}

// --- Simply Plural ---
export async function fetchSimplyPluralMembers(apiKey) {
  if (!apiKey) throw new Error("Simply Plural API key required");
  const res = await fetch("https://simplyplural.com/api/members", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Simply Plural members");
  const data = await res.json();
  return data.map((m) => ({
    name: m.name,
    displayName: m.display_name || m.name,
  }));
}

// --- Octocon ---
export async function fetchOctoconMembers(apiKey) {
  if (!apiKey) throw new Error("Octocon API key required");
  const res = await fetch("https://octocon.com/api/members", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Octocon members");
  const data = await res.json();
  return data.map((m) => ({
    name: m.name,
    displayName: m.display_name || m.name,
  }));
}