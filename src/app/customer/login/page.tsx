"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        router.push("/dashboard");
      } else {
        router.push("/customer/login");
      }
    };

    handleAuth();
  }, [router]);

  return <p>Loading...</p>;
}
