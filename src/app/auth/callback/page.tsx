"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error.message);
        router.replace("/customer/login" as const);
      } else if (session) {
        router.replace("/customer/dashboard" as const);
      } else {
        router.replace("/customer/login" as const);
      }
    };

    handleSession();
  }, [router]);

  return <p>Redirecting...</p>;
}
