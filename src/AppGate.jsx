// src/AppGate.jsx
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { useSessionStore } from "./store/sessionStore";
import { useSystemStore } from "./store/systemStore";

import Sidebar from "./layout/Sidebar";
import TopBar from "./layout/TopBar";
import Auth from "./pages/auth";
import App from "./App";

export default function AppGate() {
  const setUser = useSessionStore((s) => s.setUser);
  const setProfile = useSessionStore((s) => s.setProfile);
  const setProfileAvatarUrl = useSessionStore((s) => s.setProfileAvatarUrl);
  const setSystems = useSystemStore((s) => s.setSystems);
  const setCurrentSystem = useSystemStore((s) => s.setCurrentSystem);

  const user = useSessionStore((s) => s.user);
  const currentSystem = useSystemStore((s) => s.currentSystem);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const handleSession = async (session) => {
      if (!mounted) return;

      const userObj = session?.user;

      if (!userObj) {
        setUser(null);
        setProfile(null);
        setProfileAvatarUrl(null);
        setSystems([]);
        setCurrentSystem(null);
        setLoading(false);
        return;
      }

      setUser(userObj);

      try {
        // Try to fetch the profile by id (same as auth.user.id)
        let { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userObj.id)
          .limit(1);

        if (profileError) throw profileError;

        let profile = profiles?.[0];

        // If missing, create it safely with upsert
        if (!profile) {
          const baseUsername = userObj.email.split("@")[0];
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
            counter++;
          }

          // Upsert using id from auth.user
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .upsert(
              [
                {
                  id: userObj.id,       // use auth.user.id
                  type: "user",
                  owner_id: userObj.id,
                  display_name: userObj.email,
                  username,
                  mode: "system",
                  avatar: null,
                },
              ],
              { onConflict: "id", returning: "representation" } // conflict on primary key
            )
            .select()
            .single();

          if (insertError) throw insertError;
          profile = newProfile;
        }

        // Load avatar URL if exists
        let avatarUrl = null;
        if (profile.avatar) {
          const { data: urlData, error: urlError } = supabase
            .storage
            .from("avatars")
            .getPublicUrl(profile.avatar);
          if (!urlError) avatarUrl = urlData.publicUrl;
        }

        setProfile(profile);
        setProfileAvatarUrl(avatarUrl);

        // Load systems
        const { data: systemsData, error: systemsError } = await supabase
          .from("systems")
          .select("*")
          .eq("user_id", userObj.id);

        if (systemsError) throw systemsError;

        setSystems(systemsData || []);

        // Set default system
        if ((systemsData?.length || 0) > 0 && !currentSystem) {
          setCurrentSystem(systemsData[0]);
        }
      } catch (err) {
        console.error("AppGate error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

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
  }, [setUser, setProfile, setProfileAvatarUrl, setSystems, setCurrentSystem, currentSystem]);

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