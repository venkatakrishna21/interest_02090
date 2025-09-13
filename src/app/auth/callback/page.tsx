"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Get the logged-in user
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
        return;
      }

      // ✅ Read role from user_metadata
      const role = user.user_metadata?.role;

      if (role === "owner") {
        router.replace("/dashboard/owner");
      } else if (role === "customer") {
        router.replace("/dashboard/customer");
      } else {
        // fallback
        router.replace("/login");
      }
    };

    handleCallback();
  }, [router]);

  return <p className="p-6 text-center">Finishing login...</p>;
}
