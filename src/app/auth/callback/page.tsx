"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      // Check the session after redirect
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const role = session.user.user_metadata?.role;

        if (role === "owner") {
          router.replace("/owner");
        } else if (role === "customer") {
          router.replace("/customer");
        } else {
          router.replace("/login");
        }
      } else {
        router.replace("/login");
      }
    };

    handleAuth();
  }, [router, searchParams]);

  return <p>Finishing login...</p>;
}

// 🚨 Prevent Next.js from prerendering this page
export const dynamic = "force-dynamic";
