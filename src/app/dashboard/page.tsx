"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import OwnerDashboard from "@/components/OwnerDashboard";
import CustomerDashboard from "@/components/CustomerDashboard";

export default function DashboardPage() {
  const [role, setRole] = useState<"owner" | "customer" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user is an owner
      const { data: owner } = await supabase
        .from("owners")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (owner) {
        setRole("owner");
        setLoading(false);
        return;
      }

      // Check if user is a customer
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (customer) {
        setRole("customer");
        setLoading(false);
        return;
      }

      setLoading(false);
    };

    checkRole();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;
  if (role === "owner") return <OwnerDashboard />;
  if (role === "customer") return <CustomerDashboard />;

  return <p className="p-4 text-red-500">⚠️ No role assigned to this user</p>;
}
