import { mapMemberFields } from "./importMapper";
import { useSystemStore } from "../../store/systemStore";

export function importPK(json) {

  const addMember = useSystemStore.getState().addMember;

  json.members.forEach((m) => {

    const mapped = mapMemberFields("simplyplural", m);

    addMember(mapped.name);

  });

}