"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // ✅ cast to string so TS stops complaining
        router.replace("/customer/dashboard" as string);
      } else {
        router.replace("/customer/login" as string);
      }
    };

    handleAuth();
  }, [router]);

  return <p>Redirecting...</p>;
}
