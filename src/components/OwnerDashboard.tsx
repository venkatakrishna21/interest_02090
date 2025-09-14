"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function OwnerDashboard() {
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch owner
  useEffect(() => {
    const fetchOwner = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("⚠️ No logged in user found");
        return;
      }

      const { data, error } = await supabase
        .from("owners")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (error) setError(error.message);
      else if (data) setOwnerId(data.id);
    };

    fetchOwner();
  }, []);

  // Fetch customers live
  useEffect(() => {
    if (!ownerId) return;

    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, full_name, email, phone, debts(principal, interest_rate)")
        .eq("owner_id", ownerId);

      if (error) setError(error.message);
      else setCustomers(data || []);
    };

    fetchCustomers();

    const channel = supabase
      .channel("realtime-customers")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customers" },
        fetchCustomers
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "debts" },
        fetchCustomers
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ownerId]);

  const saveCustomer = async () => {
    if (!ownerId) return;

    const { data: customer, error: custErr } = await supabase
      .from("customers")
      .insert([
        { owner_id: ownerId, full_name: fullName, email, phone },
      ])
      .select("id")
      .single();

    if (custErr) {
      setError("❌ " + custErr.message);
      return;
    }

    // Add debt for this customer
    const { error: debtErr } = await supabase.from("debts").insert([
      {
        customer_id: customer.id,
        principal: parseFloat(principal),
        interest_rate: parseFloat(interestRate),
      },
    ]);

    if (debtErr) setError("❌ " + debtErr.message);
    else {
      setFullName("");
      setEmail("");
      setPhone("");
      setPrincipal("");
      setInterestRate("");
      setError(null);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Owner Dashboard</h1>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <div className="mb-6 space-y-3 border p-4 rounded bg-gray-50">
        <h2 className="text-lg font-semibold">Add New Customer</h2>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Debt Principal"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Interest Rate (%)"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          onClick={saveCustomer}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save Customer
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">My Customers</h2>
      <ul className="space-y-2">
        {customers.map((c) => (
          <li key={c.id} className="p-3 border rounded bg-white shadow">
            <p className="font-semibold">{c.full_name}</p>
            <p>{c.email}</p>
            <p>{c.phone}</p>
            {c.debts?.length > 0 && (
              <p className="text-sm text-gray-700">
                Debt: {c.debts[0].principal} @ {c.debts[0].interest_rate}%
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
