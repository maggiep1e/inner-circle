export function mapMemberFields(source, member) {

  switch (source) {

    case "pk":
      return {
        name: member.name,
        displayName: member.display_name,
        avatar: member.avatar_url,
        tags: [],
      };

    case "simplyplural":
      return {
        name: member.name,
        displayName: member.displayName,
        avatar: member.avatar,
        tags: member.tags || []
      };

    default:
      return member;

  }
}