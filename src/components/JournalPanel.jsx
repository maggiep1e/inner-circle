import { Link } from "react-router-dom";
import Card from "./Card";

export default function JournalPanel(){

  return(
   <Card>
        <div className="border-4 border-black rounded-3xl p-6">

        <h2 className="font-bold mb-4">
          JOURNALS
        </h2>

        <div className="flex gap-10">

          <Link to="/system-journal">
            <button>SYSTEM JOURNAL</button>
          </Link>

          <Link to="/member-journal">
            <button>MEMBER JOURNAL</button>
          </Link>
        </div>
        </div>
   </Card>
);
}