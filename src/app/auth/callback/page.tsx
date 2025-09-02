"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Auth error:", error);
      }
      if (data.session) {
        // Redirect after successful login
        router.push("/dashboard");
      } else {
        router.push("/customer/login");
      }
    };

    handleCallback();
  }, [router]);

  return <p className="p-4">Signing you in...</p>;
}
