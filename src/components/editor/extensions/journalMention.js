import Mention from "@tiptap/extension-mention";

export const JournalMention = Mention.extend({
  name: "journalMention",
}).configure({

  suggestion: {
    char: "[[",

    items: async ({ query }) => {

      const res = await fetch(
        `/api/journals/search?q=${query}`
      );

      return await res.json();

    },

    command: ({ editor, range, props }) => {

      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          {
            type: "journalMention",
            attrs: {
              id: props._id,
              label: props.title
            }
          }
        ])
        .run();

    }
  }
});