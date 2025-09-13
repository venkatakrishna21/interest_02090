"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Debt {
  id: string;
  principal: number;
  interest_rate: number;
  created_at: string;
}

export default function CustomerDashboard() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDebts = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: cust } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!cust) return;

      const { data: debtsData } = await supabase
        .from("debts")
        .select("id, principal, interest_rate, created_at")
        .eq("customer_id", cust.id);

      setDebts(debtsData || []);
      setLoading(false);
    };
    fetchDebts();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">💰 My Debts</h1>
      {debts.length === 0 ? (
        <p>No debts yet.</p>
      ) : (
        <ul className="space-y-2">
          {debts.map((d) => (
            <li key={d.id} className="border p-3 rounded">
              ₹{d.principal} at {d.interest_rate}% <br />
              <span className="text-sm text-gray-600">
                {new Date(d.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
