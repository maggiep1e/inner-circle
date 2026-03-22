import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { MemberMention } from "./extensions/memberMention";
import { JournalMention } from "./extensions/journalMention";

import { useSystemStore } from "../../store/systemStore";

export default function JournalEditor({ value, onChange }) {

  const members = useSystemStore(s => s.members);

  const editor = useEditor({

    extensions: [
      StarterKit,
      MemberMention,
      JournalMention
    ],

    content: value,

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    }

  });

  editor.storage.members = members;

  return (

    <div className="border rounded p-4">

      <EditorContent editor={editor} />

    </div>

  );
}