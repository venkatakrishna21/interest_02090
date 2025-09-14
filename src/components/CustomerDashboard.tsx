"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState<any | null>(null);
  const [debts, setDebts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("⚠️ Not logged in");
        return;
      }

      const { data, error } = await supabase
        .from("customers")
        .select("id, full_name, email, phone, debts(principal, interest_rate)")
        .eq("user_id", user.id)
        .single();

      if (error) {
        setError("❌ " + error.message);
      } else {
        setCustomer(data);
        setDebts(data.debts || []);
      }
    };

    fetchCustomer();

    const channel = supabase
      .channel("realtime-customer-debts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "debts" },
        fetchCustomer
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!customer) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome, {customer.full_name}</h1>
      <p className="mb-2">{customer.email}</p>
      <p className="mb-4">{customer.phone}</p>

      <h2 className="text-xl font-semibold mb-2">Your Debts</h2>
      {debts.length === 0 ? (
        <p>No debts assigned yet.</p>
      ) : (
        <ul className="space-y-2">
          {debts.map((d, idx) => (
            <li key={idx} className="p-3 border rounded bg-white shadow">
              Principal: {d.principal} | Interest: {d.interest_rate}%
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
