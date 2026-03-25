import { useEffect, useState } from "react";
import { getFrontAnalytics } from "../api/analytics";
import { useSystemStore } from "../store/systemStore";

export default function Analytics() {
  const systemId = useSystemStore((s) => s.systemId);

  const [data, setData] = useState({});

  useEffect(() => {

    async function load() {

      const result = await getFrontAnalytics(systemId);

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