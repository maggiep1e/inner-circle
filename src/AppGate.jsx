import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

import { useSessionStore } from "./store/sessionStore";
import { useProfileStore } from "./store/profileStore";
import { useSystemStore } from "./store/systemStore";

import TopBar from "./layout/TopBar";
import Auth from "./pages/auth";
import App from "./App";

export default function AppGate() {
  const setUser = useSessionStore((s) => s.setUser);

  const loadProfile = useProfileStore((s) => s.loadProfile);
  const setProfile = useProfileStore((s) => s.setProfile);
  const setProfileAvatarUrl = useProfileStore((s) => s.setProfileAvatarUrl);

  const setSystems = useSystemStore((s) => s.setSystems);
  const setSystemAvatarUrl = useSystemStore((s) => s.setSystemAvatarUrl);
  const setSystemId = useSystemStore((s) => s.setSystemId);

  const user = useSessionStore((s) => s.user);
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
        setSystemAvatarUrl({});
        setSystemId(null);
        setLoading(false);
        return;
      }

      setUser(userObj);

      try {
        await loadProfile();

        // ensure local state is synced
        const profile = useProfileStore.getState().profile;

        if (profile?.avatar) {
          const { data } = supabase.storage
            .from("avatars")
            .getPublicUrl(profile.avatar);

          setProfileAvatarUrl(data.publicUrl);
        }

        const { data: systemsData } = await supabase
          .from("systems")
          .select("*")
          .eq("user_id", userObj.id);

        const systems = systemsData || [];
        setSystems(systems);

        const avatars = {};
        systems?.forEach((s) => {
          avatars[s.id] =
            supabase.storage.from("avatars").getPublicUrl(s.avatar).data
              .publicUrl || "/default-avatar.png";
        });

        setSystemAvatarUrl(avatars);

        if (systems?.length > 0) {
          setSystemId(systems[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data }) =>
      handleSession(data.session)
    );

    const { data: listener } =
      supabase.auth.onAuthStateChange((_e, session) =>
        handleSession(session)
      );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [
    setUser,
    loadProfile,
    setProfile,
    setProfileAvatarUrl,
    setSystems,
    setSystemAvatarUrl,
    setSystemId,
  ]);

  const Layout = ({ children }) => (
    <div className="flex h-screen w-screen bg-white dark:bg-zinc-900 text-black dark:text-white">
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