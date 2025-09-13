"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function OwnerDashboard() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");

  // 🔹 Fetch customers
  const fetchCustomers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("⚠️ Not logged in");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("customers")
      .select("id, full_name, email, phone, debts(principal, interest_rate)")
      .eq("owner_id", user.id); // owner_id must match logged-in owner

    if (error) {
      setError(error.message);
    } else {
      setCustomers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 🔹 Save customer
  const saveCustomer = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("⚠️ Not logged in");
      return;
    }

    const { data: ownerRow } = await supabase
      .from("owners")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!ownerRow) {
      setError("⚠️ No owner profile found");
      return;
    }

    // Insert customer
    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert([
        {
          owner_id: ownerRow.id,
          full_name: fullName,
          email,
          phone,
        },
      ])
      .select()
      .single();

    if (customerError) {
      setError("❌ " + customerError.message);
      return;
    }

    // Insert debt
    const { error: debtError } = await supabase.from("debts").insert([
      {
        owner_id: ownerRow.id,
        customer_id: newCustomer.id,
        principal: Number(principal),
        interest_rate: Number(interestRate),
      },
    ]);

    if (debtError) {
      setError("❌ " + debtError.message);
      return;
    }

    // ✅ Refresh immediately without manual refresh
    fetchCustomers();

    // Reset form
    setFullName("");
    setEmail("");
    setPhone("");
    setPrincipal("");
    setInterestRate("");
    setError(null);
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Owner Dashboard</h1>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <h2 className="text-lg font-semibold mb-2">Add New Customer</h2>
      <div className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border rounded p-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
        />
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border rounded p-2"
        />
        <input
          type="number"
          placeholder="Debt Principal"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          className="w-full border rounded p-2"
        />
        <input
          type="number"
          placeholder="Interest Rate (%)"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          className="w-full border rounded p-2"
        />

        <button
          onClick={saveCustomer}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save Customer
        </button>
      </div>

      <h2 className="text-lg font-semibold mb-2">My Customers</h2>
      {customers.length === 0 ? (
        <p>No customers yet.</p>
      ) : (
        <ul className="space-y-2">
          {customers.map((c) => (
            <li key={c.id} className="border rounded p-3 bg-gray-50">
              <p className="font-semibold">{c.full_name}</p>
              <p>Email: {c.email}</p>
              <p>Phone: {c.phone}</p>
              {c.debts.length > 0 && (
                <p>
                  Debt: ₹{c.debts[0].principal} at {c.debts[0].interest_rate}%
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
