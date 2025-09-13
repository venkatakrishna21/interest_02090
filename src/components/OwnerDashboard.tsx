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

  // Fetch customers initially
  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("id, full_name, email, phone, debts(principal, interest_rate)");

    if (!error && data) setCustomers(data);
  };

  useEffect(() => {
    fetchCustomers();

    // Subscribe to customers table changes
    const customerChannel = supabase
      .channel("customers-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customers" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCustomers((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setCustomers((prev) =>
              prev.map((c) => (c.id === payload.new.id ? payload.new : c))
            );
          } else if (payload.eventType === "DELETE") {
            setCustomers((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Subscribe to debts table changes
    const debtsChannel = supabase
      .channel("debts-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "debts" },
        () => {
          fetchCustomers(); // refresh debts when changed
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(customerChannel);
      supabase.removeChannel(debtsChannel);
    };
  }, []);

  // Save new customer with debt
  const saveCustomer = async () => {
    if (!fullName || !email || !debtPrincipal) return;

    // Step 1: Insert customer
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert([{ full_name: fullName, email, phone }])
      .select("id")
      .single();

    if (customerError) {
      alert("❌ " + customerError.message);
      return;
    }

    // Step 2: Insert debt for this customer
    await supabase.from("debts").insert([
      {
        customer_id: customer.id,
        principal: parseFloat(debtPrincipal),
        interest_rate: parseFloat(interestRate),
      },
    ]);

    // Reset form
    setFullName("");
    setEmail("");
    setPhone("");
    setDebtPrincipal("");
    setInterestRate("");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📌 Owner Dashboard</h1>

      <div className="space-y-2 mb-6">
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
          value={debtPrincipal}
          onChange={(e) => setDebtPrincipal(e.target.value)}
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Customer
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">📋 My Customers</h2>
      <ul className="space-y-2">
        {customers.map((c) => (
          <li key={c.id} className="border p-2 rounded bg-gray-50">
            <p>
              <b>{c.full_name}</b> ({c.email})
            </p>
            <p>📞 {c.phone}</p>
            {c.debts?.map((d: any, i: number) => (
              <p key={i}>
                💰 {d.principal} @ {d.interest_rate}%
              </p>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
