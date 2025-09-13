"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // Check if user is owner
      const { data: owner } = await supabase
        .from("owners")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (owner) {
        router.replace("/dashboard/owner");
        return;
      }

      // Else check if user is customer
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (customer) {
        router.replace("/dashboard/customer");
        return;
      }

      // default fallback
      router.replace("/login");
    };

    handleCallback();
  }, [router]);

  return <p className="p-6">Finishing login...</p>;
}
