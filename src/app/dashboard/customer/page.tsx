"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CustomerDashboard() {
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDebts = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch debts only for logged-in customer
      const { data, error } = await supabase
        .from("debts")
        .select("id, amount, interest_rate, status, due_date")
        .eq("customer_id", user.id);

      if (!error && data) {
        setDebts(data);
      }

      setLoading(false);
    };

    fetchDebts();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">💳 My Debts</h1>

      {debts.length === 0 ? (
        <p>You have no debts assigned yet.</p>
      ) : (
        <ul className="space-y-3">
          {debts.map((d) => (
            <li
              key={d.id}
              className="p-4 border rounded shadow-sm bg-white"
            >
              <p>
                💰 <strong>{d.amount}</strong> @ {d.interest_rate}%
              </p>
              <p>Status: {d.status}</p>
              <p>Due: {d.due_date ?? "N/A"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
