import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useIdStore } from "../store/idStore";
import { getFrontAnalytics } from "../api/analytics";

export default function Analytics({userId}) {

  const { getToken } = useAuth();
  const systemId = useIdStore((s) => s.systemId);

  const [data, setData] = useState({});

  useEffect(() => {

    async function load() {

      const token = await getToken();

      const result = await getFrontAnalytics(systemId, token);

      setData(result);

    }

    if (systemId) load();

  }, [systemId]);

  return (
    <>

    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Front Analytics
      </h1>

      <div className="space-y-2">

        {Object.entries(data).map(([memberId, time]) => (

          <div
            key={memberId}
            className="flex justify-between border p-3 rounded"
          >
            <span>{memberId}</span>

            <span>
              {Math.round(time / 60000)} minutes
            </span>

          </div>

        ))}

      </div>

    </div>
    </>
  );
}