import { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabase";

import { useSessionStore } from "./store/sessionStore";
import { useProfileStore } from "./store/profileStore";
import { useSystemStore } from "./store/systemStore";

import TopBar from "./layout/TopBar";
import Auth from "./pages/auth";
import App from "./App";

export default function AppGate() {
  const setUser = useSessionStore((s) => s.setUser);
  const user = useSessionStore((s) => s.user);

  const loadProfile = useProfileStore((s) => s.loadProfile);
  const setProfile = useProfileStore((s) => s.setProfile);
  const setProfileAvatarUrl = useProfileStore((s) => s.setProfileAvatarUrl);

  const loadSystems = useSystemStore((s) => s.loadSystems);

  const [loading, setLoading] = useState(true);

  // prevents double bootstrap (IMPORTANT FIX)
  const bootedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async (session) => {
      const userObj = session?.user ?? null;

      setUser(userObj);

      if (!userObj) {
        setProfile(null);
        setProfileAvatarUrl(null);
        setLoading(false);
        return;
      }

      try {
        // guard against double execution
        if (!bootedRef.current) {
          bootedRef.current = true;

          await loadProfile(userObj.id);
          await loadSystems(userObj.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // 1. initial session
    supabase.auth.getSession().then(({ data }) => {
      bootstrap(data.session);
    });

    // 2. auth changes
    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        bootstrap(session);
      });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [setUser, loadProfile, setProfile, setProfileAvatarUrl, loadSystems]);

  // ---------------- UI WRAPPER ----------------
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