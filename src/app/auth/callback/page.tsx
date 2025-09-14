"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const role = searchParams.get("role");

      // Wait for Supabase session to finalize
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      if (role === "owner") {
        router.replace("/dashboard/owner");
      } else if (role === "customer") {
        router.replace("/dashboard/customer");
      } else {
        router.replace("/login");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return <p className="p-6">Finishing login...</p>;
}
