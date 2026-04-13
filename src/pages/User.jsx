import { useState, useEffect } from "react";
import { useProfileStore } from "../store/profileStore";
import Card from "../components/Card";

export default function UserSettingsPage() {
  const profile = useProfileStore((s) => s.profile);
  const profileAvatarUrl = useProfileStore((s) => s.profileAvatarUrl);
  const saveProfile = useProfileStore((s) => s.saveProfile);
  const uploadAvatar = useProfileStore((s) => s.uploadAvatar);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    if (!profile) return;

    setUsername(profile.username || "")
    setDisplayName(profile.display_name || "");
    setDescription(profile.description || "");
    setColor(profile.color || "");
  }, [profile]);

  if (!profile) {
    return (
      <div className="p-6 text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-zinc-900 text-black dark:text-white">

      <h1 className="text-3xl font-bold mb-6">User Settings</h1>

      <div className="flex justify-center">

     <Card>

        <div className="flex flex-col items-center gap-3">
          <img
            src={profileAvatarUrl}
            className="w-32 h-32 rounded-full object-cover"
          />
          <button className="w-1/2 mt-2 mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadAvatar(file);
            }}
          /></button>
        </div>

        <div className="space-y-4">

           <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-2 border rounded"
          />

          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display Name"
            className="w-full p-2 border rounded"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-2 border rounded"
          />

          <div>
          <p>Colour: </p>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          /></div>

        </div>


        <div className="flex justify-end">
          <button
            onClick={() =>
              saveProfile({
                display_name: displayName,
                description,
                color,
                username
              })
            }
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save
          </button>
        </div>
      </Card>
</div>

      </div>
  );
}