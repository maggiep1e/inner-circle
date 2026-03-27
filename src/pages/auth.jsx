import { useState } from "react";
import Card from "../components/Card";
import {
  signIn,
  signUp,
  signInWithGoogle,
  signInWithDiscord,
} from "../lib/auth";
import { createProfile, getProfiles } from "../api/profiles";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logon, setLogon] = useState("login"); // "login" or "register"
  const [error, setError] = useState("");
  const [mode, setMode] = useState("system"); // "system" or "singlet"
  const navigate = useNavigate()

  // --- Email / Password login / register ---
  async function handleSubmit() {
    setError("");
    try {
      if (logon === "login") {
        await signIn(email, password);
      } else {
        // Register
        await signUp(email, password);

        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        if (!user) {
          console.log("No session yet (likely email confirmation required)");
          return;
        }

        // Create profile if not exists
        const existingProfile = await getProfiles("user", user.id);
        if (!existingProfile) {
          await createProfile({
            id: user.id, // PK = auth user id
            type: "user",
            owner_id: user.id,
            email,
            mode,
            plan: "free",
          });
          navigate('/user')
        }
      }
    } catch (err) {
      setError(err.message);
    }
  }

  // --- OAuth login / register ---
  async function handleOAuthSignIn(provider) {
    setError("");
    try {
      let result;
      if (provider === "google") result = await signInWithGoogle();
      else if (provider === "discord") result = await signInWithDiscord();

      const user = result?.user;
      if (!user) return console.log("No user returned from OAuth");

      // Check if profile exists
      const existingProfile = await getProfiles("user", user.id);
      if (!existingProfile) {
        await createProfile({
          id: user.id,
          type: "user",
          owner_id: user.id,
          email: user.email,
          mode: "system",
          plan: "free",
        });
        navigate('/user')
      }
    } catch (err) {
      setError(err.message || "OAuth login failed");
    }
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-zinc-900 text-black dark:text-white">
      <Card>
        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-center">
            {logon === "login" ? "LOGIN" : "REGISTER"}
          </h2>

          <input
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-4 border-black dark:border-zinc-600 rounded-2xl px-3 py-2 bg-white dark:bg-zinc-700"
          />
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-4 border-black dark:border-zinc-600 rounded-2xl px-3 py-2 bg-white dark:bg-zinc-700"
          />

          {logon === "register" && (
            <div className="flex flex-col gap-2">
              <span className="text-sm opacity-70">Account Type</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("system")}
                  className={`flex-1 py-2 rounded-xl border ${
                    mode === "system"
                      ? "bg-purple-600 text-white"
                      : "bg-zinc-200 dark:bg-zinc-700"
                  }`}
                >
                  System
                </button>

                <button
                  onClick={() => setMode("singlet")}
                  className={`flex-1 py-2 rounded-xl border ${
                    mode === "singlet"
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-200 dark:bg-zinc-700"
                  }`}
                >
                  Singlet
                </button>
              </div>

              <div className="text-xs opacity-60">
                {mode === "system"
                  ? "Full app: members, fronting, folders"
                  : "Social only: friends + profile"}
              </div>
            </div>
          )}

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            onClick={handleSubmit}
            className="border-4 border-black dark:border-zinc-600 rounded-2xl py-2 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            {logon === "login" ? "LOGIN" : "CREATE ACCOUNT"}
          </button>

          <button
            onClick={() => setLogon(logon === "login" ? "register" : "login")}
            className="text-sm opacity-70 hover:opacity-100"
          >
            {logon === "login" ? "CREATE ACCOUNT" : "BACK TO LOGIN"}
          </button>
        </div>

        <div className="flex flex-col gap-2 mt-6">
          <button
            onClick={() => handleOAuthSignIn("google")}
            className="border-4 border-black dark:border-zinc-600 rounded-2xl py-2 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            CONTINUE WITH GOOGLE
          </button>

          <button
            onClick={() => handleOAuthSignIn("discord")}
            className="border-4 border-black dark:border-zinc-600 rounded-2xl py-2 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            CONTINUE WITH DISCORD
          </button>
        </div>
      </Card>
    </div>
  );
}