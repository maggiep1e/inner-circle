import CurrentFront from "../components/CurrentFront";
import MembersPanel from "../components/ProfilesPanel";
import JournalPanel from "../components/JournalPanel";
import FoldersPanel from "../components/FoldersPanel";

export default function Dashboard({userId}){

  return(
    <>

    <div className="grid grid-cols-2 gap-6">
      <CurrentFront />
      <MembersPanel />
      <FoldersPanel />
      <JournalPanel />

    </div>
    </>
  );

}