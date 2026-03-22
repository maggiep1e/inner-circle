import { useEffect, useState } from "react";
import { useSessionStore } from "./store/sessionStore";
import { getSystems } from "./api/systems";

import Auth from "./pages/auth";
import Systems from "./pages/Systems";
import App from "./App";
import Sidebar from "./components/Sidebar";
import TopBar from "./layout/TopBar";
import { supabase } from "./lib/supabase";
import Members from "./pages/Members";

export default function AppGate() {

  const initSession = useSessionStore(s => s.initSession);
  const setUser = useSessionStore(s => s.setUser);

  const userId = useSessionStore(s => s.userId);
  const systemId = useSessionStore(s => s.systemId);

  const [loading, setLoading] = useState(true);
  const [hasSystems, setHasSystems] = useState(false);

  useEffect(() => {

    async function load() {

      try {

        console.log("🚀 init session...");

        // ✅ Get user from Supabase
        const { data } = await supabase.auth.getUser();

        if (data?.user) {
          setUser(data.user.id);
        }

        await initSession();

        console.log("👤 user:", data?.user?.id);

        // ✅ Fetch systems
        const systems = await getSystems();

        console.log("📦 systems:", systems);

        setHasSystems(systems.length > 0);

      } catch (err) {

        console.error("❌ AppGate error:", err);

      } finally {

        setLoading(false);

      }

    }

    load();

  }, []);

  // ----------------------
  // UI
  // ----------------------

  const Layout = ({ children }) => (
    <div className="flex h-screen w-screen bg-white dark:bg-zinc-900 text-black dark:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <TopBar />
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );

  if (loading) return <div>Loading...</div>;

  if (!userId) return <Layout><Auth /></Layout>;

  if (!hasSystems) return <Layout><Systems /></Layout>;

  return <Layout><App /></Layout>;
}