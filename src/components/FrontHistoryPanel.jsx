import { Link } from "react-router-dom";
import Card from "./Card";

export default function FrontHistoryPanel(){

  return(
<Card>
    <div className="border-4 border-black rounded-3xl p-6">

      <h2 className="font-bold mb-4">
        FRONT HISTORY
      </h2>

      <div className="flex gap-10">

      <Link to="/analytics">
        <button>VIEW</button>
      </Link>

      </div>

    </div>
    </Card>

  );

}