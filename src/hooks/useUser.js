import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const { data: userData, error } = await supabase.auth.getUser();
      if (error) {
        console.error(error);
        return;
      }
      setUser(userData.user);
    }
    loadUser();
  }, []);

  return { user };
}