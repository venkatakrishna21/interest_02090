"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
}

export default function OwnerDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    debt_principal: "",
    interest_rate: "",
  });

  // Fetch all customers for this owner
  const fetchCustomers = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching customers:", error);
    } else {
      setCustomers(data || []);
    }
    setLoading(false);
  };

  // Add new customer
  const handleAddCustomer = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("customers")
      .insert([
        {
          owner_id: user.id,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding customer:", error);
    } else {
      // also add debt
      const { error: debtError } = await supabase.from("debts").insert([
        {
          customer_id: data.id,
          owner_id: user.id,
          principal: Number(form.debt_principal),
          interest_rate: Number(form.interest_rate),
        },
      ]);

      if (debtError) console.error("Error adding debt:", debtError);
    }

    setForm({
      full_name: "",
      email: "",
      phone: "",
      debt_principal: "",
      interest_rate: "",
    });
  };

  // Setup realtime subscription
  useEffect(() => {
    fetchCustomers();

    const channel = supabase
      .channel("customers-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customers" },
        () => {
          fetchCustomers(); // Refresh whenever customers table changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Owner Dashboard</h1>

      <div className="bg-white shadow p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Customer</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
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
            value={form.debt_principal}
            onChange={(e) =>
              setForm({ ...form, debt_principal: e.target.value })
            }
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Interest Rate (%)"
            value={form.interest_rate}
            onChange={(e) =>
              setForm({ ...form, interest_rate: e.target.value })
            }
            className="border p-2 rounded"
          />
        </div>

        <button
          onClick={handleAddCustomer}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Customer
        </button>
      </div>

      <h2 className="text-lg font-semibold mb-4">My Customers</h2>

      {loading ? (
        <p>Loading...</p>
      ) : customers.length === 0 ? (
        <p>No customers yet.</p>
      ) : (
        <ul className="space-y-2">
          {customers.map((c) => (
            <li
              key={c.id}
              className="p-3 border rounded-lg flex justify-between"
            >
              <div>
                <p className="font-semibold">{c.full_name}</p>
                <p className="text-sm text-gray-600">{c.email}</p>
                <p className="text-sm text-gray-600">{c.phone}</p>
              </div>
              <p className="text-sm text-gray-500">
                Joined: {new Date(c.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
