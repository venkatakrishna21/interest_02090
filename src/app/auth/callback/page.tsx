"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const processLogin = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Ensure Owner exists
        const { data: existing } = await supabase
          .from("owners")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!existing) {
          await supabase.from("owners").insert({
            user_id: user.id,
            email: user.email,
          });
        }

        router.replace("/dashboard/owner"); // ✅ Redirect owner
      } else {
        router.replace("/owner/login");
      }
    };

    processLogin();
  }, [router]);

  return <p>Loading...</p>;
}
