"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function OwnerDashboard() {
  const [session, setSession] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    principal: "",
    interest_rate: "",
  });
  const [message, setMessage] = useState("");

  // ✅ Load session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
  }, []);

  // ✅ Load customers of this owner
  useEffect(() => {
    if (!session?.user) return;
    const loadCustomers = async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("owner_id", session.user.id);

      if (!error) setCustomers(data || []);
    };
    loadCustomers();
  }, [session]);

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    // Insert customer
    const { data: customer, error: custErr } = await supabase
      .from("customers")
      .insert([
        {
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          owner_id: session.user.id,
        },
      ])
      .select()
      .single();

    if (custErr) {
      setMessage(`❌ Error saving customer: ${custErr.message}`);
      return;
    }

    // Insert initial debt
    const { error: debtErr } = await supabase.from("debts").insert([
      {
        customer_id: customer.id,
        principal: form.principal,
        interest_rate: form.interest_rate,
        owner_id: session.user.id,
        status: "active",
      },
    ]);

    if (debtErr) {
      setMessage(`❌ Error saving debt: ${debtErr.message}`);
    } else {
      setMessage("✅ Customer + Debt added successfully!");
      setCustomers([...customers, customer]);
      setForm({
        full_name: "",
        email: "",
        phone: "",
        principal: "",
        interest_rate: "",
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Owner Dashboard</h1>

      {/* Add Customer Form */}
      <div className="mb-8 bg-white shadow p-4 rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Add New Customer</h2>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <input
            type="text"
            placeholder="Full Name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
            className="border p-2 rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Debt Principal"
            value={form.principal}
            onChange={(e) => setForm({ ...form, principal: e.target.value })}
            required
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Interest Rate (%)"
            value={form.interest_rate}
            onChange={(e) =>
              setForm({ ...form, interest_rate: e.target.value })
            }
            required
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded py-2 hover:bg-blue-700"
          >
            Save Customer
          </button>
        </form>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </div>

      {/* List Customers */}
      <h2 className="text-xl font-semibold mb-2">My Customers</h2>
      <ul className="space-y-2">
        {customers.map((c) => (
          <li
            key={c.id}
            className="p-3 bg-gray-100 rounded border border-gray-300"
          >
            {c.full_name} ({c.email}) - {c.phone}
          </li>
        ))}
      </ul>
    </div>
  );
}
