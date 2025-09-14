"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  useEffect(() => {
    const handleCallback = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/signup");
        return;
      }

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
        });
        router.replace("/dashboard/customer");
      } else {
        router.replace("/signup");
      }
    };

    handleCallback();
  }, [role, router]);

  return <p className="p-6">Finishing login...</p>;
}
