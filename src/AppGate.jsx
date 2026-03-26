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
  const setSystemAvatarUrl = useSystemStore((s) => s.setSystemAvatarUrl);
  const setSystemId = useSystemStore((s) => s.setSystemId);

  const user = useSessionStore((s) => s.user);

  const [loading, setLoading] = useState(true);

 useEffect(() => {
  let mounted = true;

  const fetchAvatarUrl = (path) => {
    if (!path) return null;
    const { data: urlData, error } = supabase.storage.from("avatars").getPublicUrl(path);
    if (error) return null;
    return urlData.publicUrl;
  };

  const handleSession = async (session) => {
    if (!mounted) return;
    const userObj = session?.user;

    if (!userObj) {
      setUser(null);
      setProfile(null);
      setProfileAvatarUrl(null);
      setSystems([]);
      setSystemAvatarUrl({});
      setSystemId(null);
      setLoading(false);
      return;
    }

    setUser(userObj);

    try {
      // --- Load or create profile ---
      let { data: profiles } = await supabase.from("profiles").select("*").eq("id", userObj.id).limit(1);
      let profile = profiles?.[0];

      if (!profile) {
        const baseUsername = userObj.email.split("@")[0];
        let username = baseUsername;
        let counter = 1;
        while (true) {
          const { data: existing } = await supabase.from("profiles").select("id").eq("username", username).limit(1);
          if (!existing || existing.length === 0) break;
          username = `${baseUsername}_${counter}`;
          counter++;
        }

        const { data: newProfile } = await supabase
          .from("profiles")
          .upsert([{ id: userObj.id, type: "user", owner_id: userObj.id, display_name: userObj.email, username, mode: "system", avatar: null }], { onConflict: "id", returning: "representation" })
          .select()
          .single();
        profile = newProfile;
      }

      const profileAvatarUrl = fetchAvatarUrl(profile.avatar);
      setProfile(profile);
      setProfileAvatarUrl(profileAvatarUrl);

      // --- Load systems ---
      const { data: systemsData } = await supabase.from("systems").select("*").eq("user_id", userObj.id);
      const systems = systemsData || [];
      setSystems(systems);

      // --- Load system avatars ---
      const systemAvatars = {};
      systems.forEach((s) => {
        systemAvatars[s.id] = fetchAvatarUrl(s.avatar) || "/default-avatar.png";
      });
      setSystemAvatarUrl(systemAvatars);

      // --- Set first system as current ---
      if (systems.length > 0) setSystemId(systems[0].id);

    } catch (err) {
      console.error("AppGate error:", err);
    } finally {
      if (mounted) setLoading(false);
    }
  };

  supabase.auth.getSession().then(({ data: { session } }) => handleSession(session));

  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => handleSession(session));
  return () => {
    mounted = false;
    listener.subscription.unsubscribe();
  };
}, [setUser, setProfile, setProfileAvatarUrl, setSystems, setSystemAvatarUrl, setSystemId]);

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