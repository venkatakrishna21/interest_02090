"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
        return;
      }

      // ✅ Check role from metadata
      const role = user.user_metadata?.role;

      if (role === "owner") {
        router.replace("/dashboard/owner");
      } else if (role === "customer") {
        router.replace("/dashboard/customer");
      } else {
        // fallback if no role set
        router.replace("/login");
      }
    };

    handleAuth();
  }, [router]);

  return <p className="p-4">Finishing login...</p>;
}
