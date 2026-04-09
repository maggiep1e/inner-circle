
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
  const cleaned = (members || [])
    .filter((m) => m?.name?.trim())
    .map((m) => ({
      ...m,
      display_name: m.display_name || m.name,
    }));

  return sortMembersAlphabetically(cleaned);
}

const sortMembersAlphabetically = (members) => {
  return [...members].sort((a, b) => {
    const nameA = (a.display_name || a.name || "").toLowerCase();
    const nameB = (b.display_name || b.name || "").toLowerCase();

    return nameA.localeCompare(nameB, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
};