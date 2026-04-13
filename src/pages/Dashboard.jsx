import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSystemStore } from "../store/systemStore";
import { useProfileStore } from "../store/profileStore";
import { useSessionStore } from "../store/sessionStore";
import { getPublicUrl, resolveAvatar } from "../api/avatar";

import CurrentFront from "../components/CurrentFront";
import Card from "../components/Card";
import SelectSystem from "../components/SelectSystem";

export default function Dashboard() {
  const navigate = useNavigate();

  const systems = useSystemStore((s) => s.systems);
  const loadSystems = useSystemStore((s) => s.loadSystems);
  const hydrateSystem = useSystemStore((s) => s.hydrateSystem);
  const ensureCurrentSystem = useSystemStore((s) => s.ensureCurrentSystem);
  const profile = useProfileStore((s) => s.profile);
  const userId = useSessionStore((s) => s.userId);
  const currentSystem = useSystemStore((s)=> s.currentSystem)

  useEffect(() => {
    if (!userId) return;
    loadSystems(userId);
  }, [userId, loadSystems]);

  useEffect(() => {
    if (!systems?.length) return;

    const timeout = setTimeout(() => {
      ensureCurrentSystem();
    }, 0);

    return () => clearTimeout(timeout);
  }, [systems, ensureCurrentSystem]);

    const selectSystem = async (id) => {
    await hydrateSystem(id);
    navigate(`/systems/${id}`);
  };

  return (
   <div className="flex justify-center p-4 w-full justify-center">
    <div className="flex flex-wrap gap-6 max-w-7xl w-full ">

      <CurrentFront />

        <SelectSystem onSelect={selectSystem}/>

      <Card>
        <h2 className="text-xl font-bold p-2">Settings</h2>

        <img
          src={
            profile?.avatar
              ? getPublicUrl(profile.avatar)
              : "/default-avatar.png"
          }
          onClick={() => navigate("/user")}
          className="w-24 h-24 rounded-full object-cover shadow cursor-pointer"
        />
      </Card>
      <Card>
        <h2>Features</h2>
        <button className="mr-4 my-4" onClick={() => navigate('/medicaltracking')}>
          Medical Tracking
        </button>
        <button className="mr-4 my-4" onClick={() => navigate('/polls')}>
          Polls
        </button>
      </Card>
    </div>
    </div>
  );
}