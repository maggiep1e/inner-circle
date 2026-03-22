import { Suggestion } from "@tiptap/suggestion";

export const SlashCommands = {

  items: ({ query }) => {

    const commands = [
      { title: "Front", command: "front" },
      { title: "Mood", command: "mood" },
      { title: "Time marker", command: "time" }
    ];

    return commands.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );

  },

  command: ({ editor, props }) => {

    if (props.command === "front") {

      editor.insertContent("**Front:** ");

    }

    if (props.command === "mood") {

      editor.insertContent("**Mood:** ");

    }

  }

};