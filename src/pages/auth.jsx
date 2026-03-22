import { useState } from "react";
import Card from "../components/Card";
import { signIn, signUp } from "../lib/auth";
import {
  signInWithGoogle,
  signInWithDiscord
} from "../lib/auth";

export default function Auth() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logon, setLogon] = useState("login");
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");

    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="
    h-screen w-full flex items-center justify-center min-h-screen
      bg-white dark:bg-zinc-900
      text-black dark:text-white
    ">

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
              className="
                border-4 border-black dark:border-zinc-600
                rounded-2xl px-3 py-2
                bg-white dark:bg-zinc-700
                outline-none
              "
            />

            {/* Password */}
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                border-4 border-black dark:border-zinc-600
                rounded-2xl px-3 py-2
                bg-white dark:bg-zinc-700
                outline-none
              "
            />

            {/* Error */}
            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="
                border-4 border-black dark:border-zinc-600
                rounded-2xl py-2 font-bold
                hover:bg-zinc-200 dark:hover:bg-zinc-700
              "
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
              {logon === "login"
                ? "CREATE ACCOUNT"
                : "BACK TO LOGIN"}
            </button>

          </div>
          <div className="flex flex-col gap-2">

  {/* Google */}
  <button
    onClick={signInWithGoogle}
    className="
      border-4 border-black dark:border-zinc-600
      rounded-2xl py-2 font-bold mt-8
      hover:bg-zinc-200 dark:hover:bg-zinc-700
    "
  >
    CONTINUE WITH GOOGLE
  </button>

  {/* Discord */}
  <button
    onClick={signInWithDiscord}
    className="
      border-4 border-black dark:border-zinc-600
      rounded-2xl py-2 font-bold
      hover:bg-zinc-200 dark:hover:bg-zinc-700
    "
  >
    CONTINUE WITH DISCORD
  </button>

</div>

        </Card>

      </div>
  );
}