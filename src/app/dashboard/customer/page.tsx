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

  // Fetch debts for logged-in customer
  const fetchDebts = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("debts")
      .select("id, principal, interest_rate, created_at")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching debts:", error);
    } else {
      setDebts(data || []);
    }

    setLoading(false);
  };

  // Realtime subscription for debt updates
  useEffect(() => {
    fetchDebts();

    const channel = supabase
      .channel("debts-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "debts" },
        () => {
          fetchDebts(); // refresh whenever debts table changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Customer Dashboard</h1>

      <h2 className="text-lg font-semibold mb-4">My Debts</h2>

      {loading ? (
        <p>Loading...</p>
      ) : debts.length === 0 ? (
        <p>You don’t have any debts yet.</p>
      ) : (
        <ul className="space-y-2">
          {debts.map((d) => (
            <li
              key={d.id}
              className="p-3 border rounded-lg flex justify-between"
            >
              <div>
                <p className="font-semibold">
                  Principal: ₹{d.principal.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Interest Rate: {d.interest_rate}%
                </p>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(d.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
