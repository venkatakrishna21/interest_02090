"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CustomerDashboard() {
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("customers")
      .select("full_name, email, debt_principal, interest_rate")
      .eq("user_id", user.id);

    if (!error) setDebts(data || []);
    setLoading(false);
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>

      {debts.length === 0 ? (
        <p>No debt records found.</p>
      ) : (
        <ul className="space-y-3">
          {debts.map((d, i) => (
            <li key={i} className="border p-3 rounded">
              <p className="font-medium">{d.full_name}</p>
              <p>{d.email}</p>
              <p>Debt: ₹{d.debt_principal} @ {d.interest_rate}%</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
