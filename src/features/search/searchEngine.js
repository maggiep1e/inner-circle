export function filterMembers({
  members,
  search,
  tag,
  folder
}) {

  return members.filter((m) => {

    if (search) {
      const s = search.toLowerCase();

      if (
        !m.name.toLowerCase().includes(s) &&
        !m.displayName?.toLowerCase().includes(s)
      ) return false;
    }

    if (tag && !m.tags.includes(tag)) {
      return false;
    }

    if (folder && !m.folders.includes(folder)) {
      return false;
    }

    if (m.archived) return false;

    return true;

  });

}