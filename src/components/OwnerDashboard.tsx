"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function OwnerDashboard() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("customers").select("*");
    if (error) setError(error.message);
    else setCustomers(data || []);
    setLoading(false);
  };

  const saveCustomer = async () => {
    const { error } = await supabase.from("customers").insert([
      {
        full_name: fullName,
        email,
        phone,
        debt_principal: principal,
        interest_rate: rate,
      },
    ]);

    if (error) {
      setError("❌ " + error.message);
    } else {
      setFullName("");
      setEmail("");
      setPhone("");
      setPrincipal("");
      setRate("");
      fetchCustomers();
      alert("✅ Customer added!");
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Owner Dashboard</h1>

      {error && <p className="text-red-500">{error}</p>}

      <h2 className="text-xl font-semibold mt-4 mb-2">Add New Customer</h2>
      <div className="space-y-2 mb-6">
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
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="w-full border rounded p-2"
        />
        <button
          onClick={saveCustomer}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Customer
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">My Customers</h2>
      {customers.length === 0 ? (
        <p>No customers yet.</p>
      ) : (
        <ul className="space-y-2">
          {customers.map((c) => (
            <li key={c.id} className="border p-3 rounded">
              <p className="font-medium">{c.full_name}</p>
              <p>{c.email}</p>
              <p>Debt: ₹{c.debt_principal} @ {c.interest_rate}%</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
