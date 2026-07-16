import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getMyRoles } from "@/lib/gate.functions";

export function useRoles() {
  const [roles, setRoles] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (!cancelled) setRoles([]);
        return;
      }
      try {
        const res = await getMyRoles({ data: { accessToken: data.session.access_token } });
        if (!cancelled) setRoles(res.roles);
      } catch {
        if (!cancelled) setRoles([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    roles: roles ?? [],
    loading: roles === null,
    isStaff: (roles ?? []).some((r) => r === "gate" || r === "admin"),
    isAdmin: (roles ?? []).includes("admin"),
  };
}