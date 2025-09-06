"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/owner/login");
        return;
      }

      // Check if user is Owner
      const { data: owner } = await supabase
        .from("owners")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (owner) {
        router.replace("/owner/dashboard");
        return;
      }

      // Else check if Customer
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (customer) {
        router.replace("/customer/dashboard");
        return;
      }

      // If neither → send to login
      router.replace("/owner/login");
    };

    checkUser();
  }, [router]);

  return <p className="p-4">Redirecting...</p>;
}
