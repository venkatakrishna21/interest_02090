"use client";


import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login"); // send to login if not authenticated
        return;
      }

      // ✅ Check if Owner
      const { data: owner } = await supabase
        .from("owners")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (owner) {
        router.replace("/owner/dashboard");
        return;
      }

      // ✅ Check if Customer
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (customer) {
        router.replace("/customer/dashboard");
        return;
      }

      // ❌ No role
      router.replace("/no-role");
    };

    checkRole();
  }, [router]);

  return <p className="p-4">Checking role...</p>;
}
