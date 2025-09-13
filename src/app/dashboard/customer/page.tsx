"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState<any | null>(null);
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerData = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("⚠️ No logged in customer found");
      setLoading(false);
      return;
    }

    // Fetch customer record linked to this logged in user
    const { data: customerRow, error: customerError } = await supabase
      .from("customers")
      .select("id, full_name, email, phone")
      .eq("user_id", user.id)
      .single();

    if (customerError || !customerRow) {
      setError("⚠️ No customer profile found.");
      setLoading(false);
      return;
    }

    setCustomer(customerRow);

    // Fetch debts for this customer
    const { data: debtRows, error: debtError } = await supabase
      .from("debts")
      .select("id, principal, interest_rate, created_at")
      .eq("customer_id", customerRow.id);

    if (debtError) {
      setError(debtError.message);
    } else {
      setDebts(debtRows || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {customer ? (
        <div className="mb-6 border rounded p-4 bg-gray-50">
          <p className="font-semibold">{customer.full_name}</p>
          <p>Email: {customer.email}</p>
          <p>Phone: {customer.phone}</p>
        </div>
      ) : (
        <p>No customer record found.</p>
      )}

      <h2 className="text-lg font-semibold mb-2">My Debts</h2>
      {debts.length === 0 ? (
        <p>You have no debts assigned.</p>
      ) : (
        <ul className="space-y-3">
          {debts.map((d) => (
            <li key={d.id} className="border rounded p-3 bg-white shadow">
              <p>
                <span className="font-semibold">Principal:</span> ₹{d.principal}
              </p>
              <p>
                <span className="font-semibold">Interest Rate:</span>{" "}
                {d.interest_rate}%
              </p>
              <p className="text-sm text-gray-500">
                Added on {new Date(d.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
