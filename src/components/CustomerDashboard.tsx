"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState<any | null>(null);
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("⚠️ No logged-in user");
        setLoading(false);
        return;
      }

      // fetch this customer row
      const { data: customerData } = await supabase
        .from("customers")
        .select("id, full_name, email, phone")
        .eq("user_id", user.id)
        .single();

      if (!customerData) {
        setError("⚠️ No matching customer found.");
        setLoading(false);
        return;
      }

      setCustomer(customerData);

      // fetch debts for this customer
      const { data: debtData, error: dError } = await supabase
        .from("debts")
        .select("id, principal, interest_rate, created_at")
        .eq("customer_id", customerData.id);

      if (dError) {
        setError(dError.message);
      } else {
        setDebts(debtData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Debt Details</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {customer && (
        <div className="border rounded p-4 mb-6">
          <p className="font-semibold">{customer.full_name}</p>
          <p className="text-sm">{customer.email}</p>
          <p className="text-sm">{customer.phone}</p>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">Debts</h2>
      <ul className="space-y-2">
        {debts.map((d) => (
          <li key={d.id} className="border rounded p-3">
            <p>Principal: ₹{d.principal}</p>
            <p>Interest Rate: {d.interest_rate}%</p>
            <p className="text-sm text-gray-600">
              Added: {new Date(d.created_at).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
