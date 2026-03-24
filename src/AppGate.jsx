// src/AppGate.jsx
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { useSessionStore } from "./store/sessionStore";
import { useProfileStore } from "./store/profileStore";
import { useSystemStore } from "./store/systemStore";

import Sidebar from "./layout/Sidebar";
import TopBar from "./layout/TopBar";
import Auth from "./pages/auth";
import App from "./App";

export default function AppGate() {
  const setUser = useSessionStore((s) => s.setUser);
  const setProfile = useSessionStore((s) => s.setProfile);
  const setSystems = useSystemStore((s) => s.setSystems);
  const setCurrentSystem = useSystemStore((s) => s.setCurrentSystem);

  const loadProfile = useProfileStore((s) => s.loadProfile);

  const user = useSessionStore((s) => s.user);
  const currentSystem = useSystemStore((s) => s.currentSystem);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function handleSession(session) {
      if (!mounted) return;

      const userObj = session?.user;

      if (!userObj) {
        setUser(null);
        setProfile(null);
        setSystems([]);
        setCurrentSystem(null);
        setLoading(false);
        return;
      }

      setUser(userObj);

      try {
        // 1️⃣ Load existing profile
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("owner_id", userObj.id);

        if (error) throw error;

        let profile = profiles?.[0];

        // 2️⃣ Create profile if none exists
        if (!profile) {
          // Default username from email
          let baseUsername = userObj.email.split("@")[0];
          let username = baseUsername;
          let counter = 1;

          // Ensure username uniqueness
          while (true) {
            const { data: existing } = await supabase
              .from("profiles")
              .select("id")
              .eq("username", username)
              .limit(1);

            if (!existing || existing.length === 0) break;
            username = `${baseUsername}_${counter}`;
            counter += 1;
          }

          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert([{
              type: "user",
              owner_id: userObj.id,
              display_name: userObj.email,
              username,
              mode: "system",
              avatar: null
            }])
            .select()
            .single();

          if (insertError) throw insertError;
          profile = newProfile;
        }

        // 3️⃣ Add avatar public URL if exists
        if (profile.avatar) {
          const { data: urlData, error: urlError } = supabase
            .storage
            .from("avatars")
            .getPublicUrl(profile.avatar);

          if (!urlError) profile.avatarUrl = urlData.publicUrl;
        }

        setProfile(profile);

        // 4️⃣ Load all systems for this user
        const { data: systemsData, error: systemsError } = await supabase
          .from("systems")
          .select("*")
          .eq("user_id", userObj.id);

        if (systemsError) throw systemsError;

        setSystems(systemsData || []);

        // 5️⃣ Set default system if none
        if ((systemsData?.length || 0) > 0 && !currentSystem) {
          setCurrentSystem(systemsData[0]);
        }
      } catch (err) {
        console.error("AppGate error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => handleSession(session));

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => handleSession(session)
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [setUser, setProfile, setSystems, setCurrentSystem, currentSystem]);

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