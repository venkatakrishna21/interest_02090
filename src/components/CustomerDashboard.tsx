"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CustomerDashboard() {
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDebts = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("debts")
      .select("id, principal, interest_rate, created_at")
      .eq("customer_id", user.id);

    if (!error && data) setDebts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDebts();

    // Realtime subscription to debts table
    const channel = supabase
      .channel("debts-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "debts" },
        () => {
          fetchDebts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">💼 Customer Dashboard</h1>
      {debts.length === 0 ? (
        <p>No debts found</p>
      ) : (
        <ul className="space-y-2">
          {debts.map((d) => (
            <li key={d.id} className="border p-2 rounded bg-gray-50">
              <p>
                💰 Principal: {d.principal} | {d.interest_rate}%
              </p>
              <p>📅 Added: {new Date(d.created_at).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
