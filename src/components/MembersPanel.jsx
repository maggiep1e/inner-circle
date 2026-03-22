import Card from "./Card";
import { Link } from "react-router-dom";

export default function MembersPanel(){

  return(
    <Card>
      <div className="border-4 border-black rounded-3xl p-6">

        <h2 className="font-bold mb-4">
          MEMBERS
        </h2>

        <div className="flex gap-10">

          <Link to="/members">
            <button>LIST</button>
          </Link>

          <Link to="/members">
            <button>FOLDERS</button>
          </Link>

          <Link to="/members">
            <button>ADD NEW</button>
          </Link>

        </div>

      </div>
    </Card>
  );

}