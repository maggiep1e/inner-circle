// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { useSessionStore } from "./store/sessionStore";


import SystemsPage from "./pages/Systems";
import SystemView from "./pages/SystemView";
import SystemCreate from "./pages/SystemCreate";
import MemberCreate from "./pages/MemberCreate";
import MemberView from "./pages/MemberView";
import CreateFolder from "./pages/CreateFolder";
import EditFolder from "./pages/EditFolder";

import Friends from "./pages/Friends";
import SystemJournal from "./pages/SystemJournal";
import UserSettings from "./pages/User";
import ImportMembersPage from "./pages/ImportMembersPage";
import Auth from "./pages/auth";
import { Navigate } from "react-router-dom";

export default function App() {
  const user = useSessionStore((s) => s.user);
  const mode = useSessionStore((s) => s.mode);

 if (user === null || mode === null) return <div>Loading...</div>;
  if (!user) return <Auth />;

  return (
    <Routes>
      {mode === "singlet" ? (
          <>
            <Route path="/" element={<Navigate to="/friends" />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/user" element={<UserSettings />} />
            <Route path="*" element={<Navigate to="/friends" />} />
          </>
        ) : (
          <>
            <Route path="/" element={<SystemsPage />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/systems/new" element={<SystemCreate />} />
            <Route path="/systems/:id" element={<SystemView />} />
            <Route path="/systems/:systemId/members/new" element={<MemberCreate />}/>
            <Route path="/systems/:systemId/members/:memberId" element={<MemberView />} />
            <Route path="/systems/:systemId/folders/new" element={<CreateFolder />}/>
            <Route  path="/systems/:systemId/folders/:folderId/edit"  element={<EditFolder />}/>
            <Route  path="/systems/:systemId/journal"  element={<SystemJournal />}/>
            <Route path="/import/:systemId" element={<ImportMembersPage />} />
            <Route path="/user" element={<UserSettings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
    </Routes>
  );
}