"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // ✅ Exchange the session from the URL fragment
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        router.replace("/login");
        return;
      }

      const user = data.session.user;
      const role = user.user_metadata?.role;

      if (role === "owner") {
        await supabase.from("owners").upsert({
          user_id: user.id,
          email: user.email,
        });
        router.replace("/dashboard/owner");
      } else if (role === "customer") {
        await supabase.from("customers").upsert({
          user_id: user.id,
          email: user.email,
          name: user.email?.split("@")[0] ?? "Customer",
        });
        router.replace("/dashboard/customer");
      } else {
        router.replace("/login");
      }
    };

    handleAuth();
  }, [router]);

  return <p className="p-4">Finishing login...</p>;
}
