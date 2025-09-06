"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function OwnerDashboard() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [debtPrincipal, setDebtPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [ownerId, setOwnerId] = useState<string | null>(null);

  // Fetch ownerId + customers
  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: owner } = await supabase
        .from("owners")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (owner) {
        setOwnerId(owner.id);

        const { data: custs } = await supabase
          .from("customers")
          .select("id, full_name, email, phone")
          .eq("owner_id", owner.id);
        setCustomers(custs || []);
      }
    };
    load();
  }, []);

  // Save new customer + debt
  const saveCustomer = async () => {
    if (!ownerId) return;

    const { data: newCustomer, error: custErr } = await supabase
      .from("customers")
      .insert([
        {
          owner_id: ownerId,
          full_name: fullName,
          email,
          phone,
        },
      ])
      .select("id")
      .single();

    if (custErr) {
      alert("❌ Error saving customer: " + custErr.message);
      return;
    }

    if (newCustomer) {
      const { error: debtErr } = await supabase.from("debts").insert([
        {
          owner_id: ownerId,
          customer_id: newCustomer.id,
          principal: parseFloat(debtPrincipal),
          interest_rate: parseFloat(interestRate),
        },
      ]);
      if (debtErr) {
        alert("❌ Error saving debt: " + debtErr.message);
        return;
      }
    }

    alert("✅ Customer + Debt saved successfully!");
    setFullName("");
    setEmail("");
    setPhone("");
    setDebtPrincipal("");
    setInterestRate("");

    const { data: custs } = await supabase
      .from("customers")
      .select("id, full_name, email, phone")
      .eq("owner_id", ownerId);
    setCustomers(custs || []);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Owner Dashboard</h1>

      <h2 className="text-lg font-semibold mb-2">Add New Customer</h2>
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
          value={debtPrincipal}
          onChange={(e) => setDebtPrincipal(e.target.value)}
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
      <ul className="space-y-2">
        {customers.map((c) => (
          <li key={c.id} className="border p-2 rounded">
            <p className="font-medium">{c.full_name}</p>
            <p className="text-sm">{c.email}</p>
            <p className="text-sm">{c.phone}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
