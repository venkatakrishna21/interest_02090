"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function OwnerDashboard() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("customers")
        .select("id, full_name, email, phone, debts(amount, interest_rate)");

      if (!error && data) {
        setCustomers(data);
      }

      setLoading(false);
    };

    fetchCustomers();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📊 Owner Dashboard</h1>

      {customers.length === 0 ? (
        <p>No customers yet.</p>
      ) : (
        <ul className="space-y-3">
          {customers.map((c) => (
            <li
              key={c.id}
              className="p-4 border rounded shadow-sm bg-white"
            >
              <p className="font-semibold">{c.full_name}</p>
              <p className="text-sm text-gray-600">{c.email}</p>
              <p className="text-sm text-gray-600">{c.phone}</p>

              {c.debts && c.debts.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Debts:</p>
                  <ul className="list-disc ml-5 text-sm">
                    {c.debts.map((d: any, i: number) => (
                      <li key={i}>
                        💰 {d.amount} @ {d.interest_rate}%
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
