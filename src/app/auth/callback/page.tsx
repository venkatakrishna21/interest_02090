"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
        return;
      }

      const role = user.user_metadata?.role;

      // Auto-create DB rows if missing
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
