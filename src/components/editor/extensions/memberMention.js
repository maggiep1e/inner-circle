import Mention from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";

export const MemberMention = Mention.extend({
  name: "memberMention",
}).configure({
  HTMLAttributes: {
    class: "member-mention",
  },

  suggestion: {
    char: "@",

    items: ({ query, editor }) => {

      const members =
        editor.storage.members || [];

      return members
        .filter(m =>
          (m.displayName || m.name)
            .toLowerCase()
            .includes(query.toLowerCase())
        )
        .slice(0, 5);

    },

    command: ({ editor, range, props }) => {

      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          {
            type: "memberMention",
            attrs: {
              id: props._id,
              label: props.displayName || props.name
            }
          }
        ])
        .run();

    }
  }
});