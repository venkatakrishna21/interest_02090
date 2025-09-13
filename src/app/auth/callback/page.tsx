"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // fetch role from public.users metadata or your "owners/customers" tables
      const role =
        (user.user_metadata?.role as string | undefined) ||
        (await getRoleFromDb(user.id));

      if (role === "owner") {
        router.replace("/dashboard/owner" as const);
      } else if (role === "customer") {
        router.replace("/dashboard/customer" as const);
      } else {
        router.replace("/login");
      }
    };

    handleRedirect();
  }, [router]);

  return <p className="p-6 text-lg">Finishing login...</p>;
}

// Utility to fetch role if not in metadata
async function getRoleFromDb(userId: string): Promise<string | undefined> {
  // Check in owners table
  const { data: owner } = await supabase
    .from("owners")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (owner) return "owner";

  // Check in customers table
  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (customer) return "customer";

  return undefined;
}
