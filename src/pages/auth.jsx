import { useState } from "react";
import Card from "../components/Card";
import { signIn, signUp, signInWithGoogle, signInWithDiscord } from "../lib/auth";
import { createProfile } from "../api/profiles";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logon, setLogon] = useState("login"); // login | register
  const [error, setError] = useState("");

  // NEW: system vs singlet
  const [mode, setMode] = useState("system");

 async function handleSubmit() {
  setError("");

  try {
    if (logon === "login") {
      await signIn(email, password);
    } else {
      // 1. Create auth user
      await signUp(email, password);

      // 2. Get session safely (REPLACE getUser with this)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      if (!user) {
        console.log("No session yet (likely email confirmation required)");
        return; // stop here, profile will be created later
      }

      // 3. Create profile
      await createProfile({
        type: "user",
        owner_id: user.id,
        email,
        mode,
        plan: "free",
      });
    }
  } catch (err) {
    setError(err.message);
  }
}

  return (
    <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-zinc-900 text-black dark:text-white">
      <Card>
        <div className="flex flex-col gap-4">

          <h2 className="font-bold text-center">
            {logon === "login" ? "LOGIN" : "REGISTER"}
          </h2>

          {/* Email */}
          <input
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-4 border-black dark:border-zinc-600 rounded-2xl px-3 py-2 bg-white dark:bg-zinc-700"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-4 border-black dark:border-zinc-600 rounded-2xl px-3 py-2 bg-white dark:bg-zinc-700"
          />

          {/* 🆕 Mode selector (ONLY on register) */}
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

          {/* Error */}
          {error && <div className="text-red-500 text-sm">{error}</div>}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="border-4 border-black dark:border-zinc-600 rounded-2xl py-2 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            {logon === "login" ? "LOGIN" : "CREATE ACCOUNT"}
          </button>

          {/* Switch */}
          <button
            onClick={() =>
              setLogon(logon === "login" ? "register" : "login")
            }
            className="text-sm opacity-70 hover:opacity-100"
          >
            {logon === "login" ? "CREATE ACCOUNT" : "BACK TO LOGIN"}
          </button>
        </div>

        {/* OAuth */}
        <div className="flex flex-col gap-2 mt-6">
          <button
            onClick={signInWithGoogle}
            className="border-4 border-black dark:border-zinc-600 rounded-2xl py-2 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            CONTINUE WITH GOOGLE
          </button>

          <button
            onClick={signInWithDiscord}
            className="border-4 border-black dark:border-zinc-600 rounded-2xl py-2 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            CONTINUE WITH DISCORD
          </button>
        </div>
      </Card>
    </div>
  );
}