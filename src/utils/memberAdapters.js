
export function normalizeMember(input, source) {
  return {
    id: input.id || null,
    name: (input.name || "").trim(),
    display_name: (input.display_name || input.name || "").trim(),
    avatar: input.avatar || null,
    color: input.color || null,
    source,
  };
}

export function validateMembers(members) {
  return (members || [])
    .filter((m) => m?.name?.trim())
    .map((m) => ({
      ...m,
      display_name: m.display_name || m.name,
    }));
}