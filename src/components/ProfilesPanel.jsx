import Card from "./Card";
import { Link } from "react-router-dom";

export default function ProfilesPanel(){

  return(
    <Card>
      <div className="border-4 border-black rounded-3xl p-6">

        <h2 className="font-bold mb-4">
          Profiles
        </h2>

        <div className="flex gap-10">

          <Link to="/user">
            <button>User</button>
          </Link>

          <Link to="/systems">
            <button>System</button>
          </Link>

          <Link to="/members">
            <button>Members</button>
          </Link>

        </div>

      </div>
    </Card>
  );

}