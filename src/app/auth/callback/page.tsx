"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      // Get active session
      const { data, error } = await supabase.auth.getSession();

      if (error || !data?.session) {
        console.error("❌ Auth failed:", error);
        router.replace("/login");
        return;
      }

      // Read role from query params
      const role = params.get("role");

      if (role === "owner") {
        router.replace("/dashboard/owner");
      } else if (role === "customer") {
        router.replace("/dashboard/customer");
      } else {
        router.replace("/login");
      }
    };

    handleAuth();
  }, [router, params]);

  return <p className="p-4">Logging you in...</p>;
}
