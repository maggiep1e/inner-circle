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
import UserSettingsPage from "./pages/User";
import { useProfileStore } from "./store/profileStore";

export default function App() {
  const user = useSessionStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile)
  const onboardingStep = useProfileStore((s)=> s.onboardingStep)

 if (user === null) return <div>Loading...</div>;
  if (!user) return <Auth />;
  if (!profile) return <UserSettingsPage />;
  if (onboardingStep === "profile") return <UserSettingsPage />

  return (
    <Routes> 
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
            <Route path="/user" element={<UserSettingsPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
    </Routes>
  );
}