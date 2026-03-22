import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useSystemStore } from "../store/systemStore";

export function useFrontRealtime(systemId) {

  const setFront = useSystemStore(s => s.setFront);

  useEffect(() => {

    if (!systemId) return;

    const channel = supabase
      .channel("front-tracking")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "front_logs",
          filter: `system_id=eq.${systemId}`
        },
        async (payload) => {

          if (payload.new?.is_active) {
            setFront(payload.new.member_id);
          }

        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [systemId]);
}