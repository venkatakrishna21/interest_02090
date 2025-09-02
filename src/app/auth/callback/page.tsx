"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error in callback:", error.message);
        router.replace("/customer/login");
      } else if (data?.session) {
        // Redirect after successful login
        router.replace("/customer/dashboard");
      } else {
        router.replace("/customer/login");
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Finishing sign-in, please wait...</p>
    </div>
  );
}
