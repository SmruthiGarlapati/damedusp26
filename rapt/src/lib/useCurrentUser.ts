"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface CurrentUser {
  id: string;
  full_name: string;
  email: string;
  overall_rating: number;
  preferences: Record<string, unknown>;
  availability: Record<string, unknown>;
  sessionsCompleted: number;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setLoading(false);
        return;
      }

      const [profileRes, countRes] = await Promise.all([
        supabase.from("users").select("*").eq("id", authUser.id).single(),
        supabase
          .from("matches")
          .select("id", { count: "exact", head: true })
          .eq("status", "completed")
          .or(`requester_id.eq.${authUser.id},partner_id.eq.${authUser.id}`),
      ]);

      if (profileRes.data) {
        setUser({
          id: profileRes.data.id,
          full_name: profileRes.data.full_name,
          email: profileRes.data.email,
          overall_rating: Number(profileRes.data.overall_rating ?? 0),
          preferences: (profileRes.data.preferences as Record<string, unknown>) ?? {},
          availability: (profileRes.data.availability as Record<string, unknown>) ?? {},
          sessionsCompleted: countRes.count ?? 0,
        });
      }

      setLoading(false);
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => load());

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
