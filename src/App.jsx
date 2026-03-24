// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { useSessionStore } from "./store/sessionStore";

import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Friends from "./pages/Friends";
import Systems from "./pages/Systems";
import Folders from "./pages/Folders";
import Analytics from "./pages/Analytics";
import SystemJournal from "./pages/SystemJournal";
import MemberJournal from "./pages/MemberJournal";
import UserSettings from "./pages/User";
import ImportMembersPage from "./pages/ImportMembersPage";
import Auth from "./pages/auth";

export default function App() {
  const user = useSessionStore((s) => s.user);
  const mode = useSessionStore((s) => s.mode);

  // ❌ No Supabase auth calls here! AppGate handles auth
  // ❌ No getSession, no onAuthStateChange

  if (user === null) return <div>Loading...</div>;
  if (!user) return <Auth />;

  return (
    <Routes>
      {mode === "singlet" ? (
        <>
          <Route path="/friends" element={<Friends />} />
          <Route path="/user" element={<UserSettings />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/systems" element={<Systems />} />
          <Route path="/folders" element={<Folders />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/system-journal" element={<SystemJournal />} />
          <Route path="/member-journal" element={<MemberJournal />} />
          <Route path="/import" element={<ImportMembersPage />} />
          <Route path="/user" element={<UserSettings />} />
        </>
      )}
    </Routes>
  );
}