"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CustomerDashboard() {
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDebts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (error || !data) return;

      const { data: debtsData } = await supabase
        .from("debts")
        .select("amount, reason, created_at")
        .eq("customer_id", data.id);

      if (debtsData) setDebts(debtsData);
      setLoading(false);
    };

    fetchDebts();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">💰 My Debts</h1>
      {debts.length === 0 ? (
        <p>No debts found 🎉</p>
      ) : (
        <ul className="space-y-3">
          {debts.map((d, idx) => (
            <li key={idx} className="border p-3 rounded">
              <p>Amount: <strong>₹{d.amount}</strong></p>
              <p>Reason: {d.reason}</p>
              <p className="text-sm text-gray-500">
                Date: {new Date(d.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
