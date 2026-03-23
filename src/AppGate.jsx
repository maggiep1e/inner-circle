import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { getProfiles } from "./api/profiles";
import { useSessionStore } from "./store/sessionStore";

import Sidebar from "./layout/Sidebar";
import TopBar from "./layout/TopBar";
import Auth from "./pages/auth";
import App from "./App";
import { useSystemStore } from "./store/systemStore";

export default function AppGate() {
  const setUser = useSessionStore((s) => s.setUser);
  const setProfile = useSessionStore((s) => s.setProfile);
  const setSystems = useSystemStore((s) => s.setSystems);
  const setCurrentSystem = useSystemStore((s) => s.setCurrentSystem);

  const user = useSessionStore((s) => s.user);
  const profile = useSessionStore((s) => s.profile);
  const currentSystem = useSystemStore((s) => s.currentSystem);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function handleSession(session) {
      if (!mounted) return;

      try {
        const userObj = session?.user;

        if (!userObj) {
          setUser(null);
          setProfile(null);
          setSystems([]);
          setCurrentSystem(null);
          setLoading(false);
          return;
        }

        // 1️⃣ store user object
        setUser(userObj);

        // 2️⃣ load or create user profile
        let userProfiles = await getProfiles("user", userObj.id);

        if (userProfiles.length === 0) {
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert([{
              type: "user",
              owner_id: userObj.id,
              display_name: userObj.email,
              username: userObj.email.split("@")[0],
              mode: "system" // default
            }])
            .select()
            .single();

          if (insertError) throw insertError;
          userProfiles = [newProfile];
        }

        setProfile(userProfiles[0]);

        // 3️⃣ load all systems for this user
        const { data: systemsData, error: systemsError } = await supabase
          .from("systems")
          .select("*")
          .eq("user_id", userObj.id);

        if (systemsError) throw systemsError;

        setSystems(systemsData || []);

        // 4️⃣ set default current system if none
        if ((systemsData?.length || 0) > 0 && !currentSystem) {
          setCurrentSystem(systemsData[0]);
        }

      } catch (err) {
        console.error("AppGate error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // 🔹 initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // 🔹 listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => handleSession(session)
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [setUser, setProfile, setSystems, setCurrentSystem]);

  // Layout wrapper
  const Layout = ({ children }) => (
    <div className="flex h-screen w-screen bg-white dark:bg-zinc-900 text-black dark:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <TopBar />
        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  );

  if (loading) return <div>Loading...</div>;
  if (!user) return <Layout><Auth /></Layout>;

  return <Layout><App /></Layout>;
}