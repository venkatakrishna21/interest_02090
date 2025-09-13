"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function OwnerDashboard() {
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [principal, setPrincipal] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(0);

  // fetch owner + customers
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

      // find owner row
      const { data: owner } = await supabase
        .from("owners")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!owner) {
        setError("⚠️ No matching owner found.");
        setLoading(false);
        return;
      }

      setOwnerId(owner.id);

      // fetch customers
      const { data: customersData, error: cError } = await supabase
        .from("customers")
        .select("id, full_name, email, phone");

      if (cError) {
        setError(cError.message);
      } else {
        setCustomers(customersData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // add new customer with debt
  const saveCustomer = async () => {
    if (!ownerId) return;

    setError(null);

    const { data: insertedCustomer, error: cError } = await supabase
      .from("customers")
      .insert([
        {
          owner_id: ownerId,
          full_name: fullName,
          email,
          phone,
        },
      ])
      .select()
      .single();

    if (cError) {
      setError(cError.message);
      return;
    }

    // create debt for this customer
    if (insertedCustomer) {
      const { error: dError } = await supabase.from("debts").insert([
        {
          owner_id: ownerId,
          customer_id: insertedCustomer.id,
          principal,
          interest_rate: interestRate,
        },
      ]);

      if (dError) {
        setError(dError.message);
        return;
      }

      // ✅ instantly update local state (no refresh needed)
      setCustomers((prev) => [...prev, insertedCustomer]);

      // clear form
      setFullName("");
      setEmail("");
      setPhone("");
      setPrincipal(0);
      setInterestRate(0);

      alert("✅ Customer and debt saved!");
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Owner Dashboard</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Add Customer Form */}
      <div className="space-y-3 border p-4 rounded mb-6">
        <h2 className="text-lg font-semibold">Add New Customer</h2>
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
          onChange={(e) => setPrincipal(Number(e.target.value))}
          className="w-full border rounded p-2"
        />
        <input
          type="number"
          placeholder="Interest Rate (%)"
          value={interestRate}
          onChange={(e) => setInterestRate(Number(e.target.value))}
          className="w-full border rounded p-2"
        />

        <button
          onClick={saveCustomer}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save Customer
        </button>
      </div>

      {/* My Customers */}
      <h2 className="text-xl font-semibold mb-2">My Customers</h2>
      <ul className="space-y-2">
        {customers.map((c) => (
          <li key={c.id} className="border rounded p-3">
            <p className="font-medium">{c.full_name}</p>
            <p className="text-sm text-gray-600">{c.email}</p>
            <p className="text-sm text-gray-600">{c.phone}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
