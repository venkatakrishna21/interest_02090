"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
        return;
      }

      // 👇 role should be inside user.user_metadata.role
      const role = user.user_metadata?.role;

      if (role === "owner") {
        router.replace("/dashboard/owner");
      } else if (role === "customer") {
        router.replace("/dashboard/customer");
      } else {
        router.replace("/login");
      }
    };

    checkUser();
  }, [router]);

  return <p className="p-4">Finishing login...</p>;
}
