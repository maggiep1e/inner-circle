import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";

import SystemView from "./pages/SystemView";
import SystemCreate from "./pages/SystemCreate";
import MemberCreate from "./pages/MemberCreate";
import MemberView from "./pages/MemberView";
import CreateFolder from "./pages/CreateFolder";
import EditFolder from "./pages/EditFolder";
import HomePage from "./pages/Home";
import Friends from "./pages/Friends";
import SystemJournal from "./pages/SystemJournal";
import ImportMembersPage from "./pages/ImportMembersPage";
import UserSettingsPage from "./pages/User";
import Dashboard from "./pages/Dashboard";
import FrontingPage from "./pages/FrontingPage";
import Auth from "./pages/auth";
import MedicalTrackingPage from "./pages/MedicalTracking";
import PollsPage from "./pages/Polls";

export default function App() {
  return (
    <Routes> 
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/systems/new" element={<SystemCreate />} />
            <Route path="/systems/:id/subsystems/new" element={<SystemCreate />} />
            <Route path="/systems/:id" element={<SystemView />} />
            <Route path="/systems/:systemId/members/new" element={<MemberCreate />}/>
            <Route path="/systems/:systemId/members/:memberId" element={<MemberView />} />
            <Route path="/systems/:systemId/folders/new" element={<CreateFolder />}/>
            <Route  path="/systems/:systemId/folders/:folderId/edit"  element={<EditFolder />}/>
            <Route  path="/systems/:systemId/journal"  element={<SystemJournal />}/>
            <Route path="/import/:systemId" element={<ImportMembersPage />} />
            <Route path="/user" element={<UserSettingsPage />} />
            <Route path="/medicaltracking" element={<MedicalTrackingPage />} />
            <Route path="/polls" element={<PollsPage />} />
            <Route path="/fronting" element={<FrontingPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
    </Routes>
  );
}