"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error in callback:", error);
        return;
      }

      if (data.session) {
        // redirect to dashboard or customer page after login
        router.push("/customer/dashboard");
      } else {
        router.push("/customer/login");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Signing you in...</p>
    </div>
  );
}
