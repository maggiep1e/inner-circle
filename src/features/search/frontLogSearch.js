export function filterFrontLogs(logs, members, search) {

  if (!search) return logs;

  const s = search.toLowerCase();

  return logs.filter((log) => {

    const member = members.find((m) => m.id === log.memberId);

    return member?.name?.toLowerCase().includes(s);

  });

}