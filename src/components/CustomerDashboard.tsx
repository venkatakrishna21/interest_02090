"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CustomerDashboard() {
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("⚠️ No logged in customer found");
        setLoading(false);
        return;
      }

      // find customer row for this user
      const { data: customer, error: custError } = await supabase
        .from("customers")
        .select("id, full_name")
        .eq("user_id", user.id)
        .single();

      if (custError || !customer) {
        setError("⚠️ No customer account found. Contact your owner.");
        setLoading(false);
        return;
      }

      // fetch debts for this customer
      const { data: debtsData, error: debtsError } = await supabase
        .from("debts")
        .select("id, principal, interest_rate, created_at")
        .eq("customer_id", customer.id);

      if (debtsError) {
        setError("❌ Error fetching debts: " + debtsError.message);
      } else {
        setDebts(debtsData || []);
      }

      setLoading(false);
    };

    load();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Debts</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {debts.length === 0 ? (
        <p className="text-gray-600">No debts found.</p>
      ) : (
        <ul className="space-y-3">
          {debts.map((d) => (
            <li key={d.id} className="border p-3 rounded">
              <p>
                <span className="font-semibold">Principal:</span> ₹
                {d.principal}
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
