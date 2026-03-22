// AppWrapper.jsx
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useIdStore } from "./store/idStore";
import { useSessionStore } from "./store/sessionStore";

import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Friends from "./pages/Friends";
import Systems from "./pages/Systems";
import Auth from "./pages/auth";
import Analytics from "./pages/Analytics";
import SystemJournal from "./pages/SystemJournal";
import MemberJournal from "./pages/MemberJournal";
import { getUser } from "./lib/auth";

export default function AppWrapper() {
  const [user, setUser] = useState(null);
  const setUserId = useIdStore.getState().setUserId;
  const initSession = useSessionStore((s) => s.initSession);

  // Load user on mount
  useEffect(() => {
    async function loadUser() {
      const u = await getUser();
      setUser(u);
      if (u) setUserId(u.id);
    }
    loadUser();
  }, [setUserId]);

  // Restore systemId from session/localStorage
  useEffect(() => {
    initSession();
  }, [initSession]);

  if (user === null) return <div>Loading...</div>;
  if (!user) return <Auth />;

  return (
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/systems" element={<Systems />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/system-journal" element={<SystemJournal />} />
        <Route path="/member-journal" element={<MemberJournal />} />
      </Routes>
  );
}