import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { supabase } from "./lib/supabase"; // ✅ FIX 1

import { useSessionStore } from "./store/sessionStore";

import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Friends from "./pages/Friends";
import Systems from "./pages/Systems";
import Auth from "./pages/auth";
import Folders from "./pages/Folders";
import Analytics from "./pages/Analytics";
import SystemJournal from "./pages/SystemJournal";
import MemberJournal from "./pages/MemberJournal";
import UserSettings from "./pages/User";
import ImportMembersPage from "./pages/ImportMembersPage"

export default function App() {
  const [userState, setUserState] = useState(null);

  const setUser = useSessionStore((s) => s.setUser);
  const userId = useSessionStore((s) => s.userId);
  const initSession = useSessionStore((s) => s.initSession);
  const mode = useSessionStore((s) => s.mode);

  useEffect(() => {
    // 1. Get initial session
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user || null;

      setUser(user?.id || null);     // ✅ FIX 2
      setUserState(user);            // ✅ FIX 3
    }

    init();

    // 2. Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const user = session?.user || null;

        setUser(user?.id || null);   // ✅ FIX 2
        setUserState(user);          // ✅ FIX 3
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [setUser]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  if (userState === null) return <div>Loading...</div>;
  if (!userState) return <Auth />;

  return (
    <Routes>
      {mode === "singlet" ? (
        <>
          <Route path="/friends" element={<Friends />} />
          <Route path="/user" element={<User />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/systems" element={<Systems />} />
          <Route path="/folders" element={<Folders  />} />
          <Route path="/analytics" element={<Analytics  />} />
          <Route path="/system-journal" element={<SystemJournal />} />
          <Route path="/member-journal" element={<MemberJournal  />} />
          <Route path="/import" element={<ImportMembersPage />} />
          <Route path="/user" element={<UserSettings />} />
        </>
      )}
    </Routes>
  );
}