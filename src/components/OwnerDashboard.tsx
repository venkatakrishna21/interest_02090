"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}

interface Debt {
  id: string;
  customer_id: string;
  principal: number;
  interest_rate: number;
  created_at: string;
}

export default function OwnerDashboard() {
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [debts, setDebts] = useState<{ [id: string]: Debt[] }>({});
  const [loading, setLoading] = useState(true);

  // form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: owner } = await supabase
        .from("owners")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!owner) return;
      setOwnerId(owner.id);

      const { data: cust } = await supabase
        .from("customers")
        .select("id, full_name, email, phone")
        .eq("owner_id", owner.id);
      setCustomers(cust || []);

      const { data: debtsData } = await supabase
        .from("debts")
        .select("id, customer_id, principal, interest_rate, created_at")
        .eq("owner_id", owner.id);

      const grouped: { [id: string]: Debt[] } = {};
      debtsData?.forEach((d) => {
        if (!grouped[d.customer_id]) grouped[d.customer_id] = [];
        grouped[d.customer_id].push(d);
      });
      setDebts(grouped);
      setLoading(false);
    };

    fetchData();
  }, []);

  const saveCustomer = async () => {
    if (!ownerId) return;
    const { error } = await supabase.from("customers").insert([
      { owner_id: ownerId, full_name: fullName, email, phone },
    ]);
    if (error) alert(error.message);
    else {
      setFullName("");
      setEmail("");
      setPhone("");
      alert("✅ Customer saved!");
    }
  };

  const saveDebt = async () => {
    if (!selectedCustomer || !ownerId) return;
    const { error } = await supabase.from("debts").insert([
      {
        customer_id: selectedCustomer,
        owner_id: ownerId,
        principal: parseFloat(principal),
        interest_rate: parseFloat(interestRate),
      },
    ]);
    if (error) alert(error.message);
    else {
      setPrincipal("");
      setInterestRate("");
      alert("✅ Debt saved!");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📊 Owner Dashboard</h1>

      {/* Add Customer */}
      <div className="mb-6 border p-4 rounded">
        <h2 className="font-semibold mb-2">Add New Customer</h2>
        <input className="border p-2 w-full mb-2" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <input className="border p-2 w-full mb-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border p-2 w-full mb-2" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button onClick={saveCustomer} className="bg-blue-600 text-white px-4 py-2 rounded">Save Customer</button>
      </div>

      {/* Add Debt */}
      <div className="mb-6 border p-4 rounded">
        <h2 className="font-semibold mb-2">Add Debt</h2>
        <select className="border p-2 w-full mb-2" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
          <option value="">-- Select Customer --</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.full_name}</option>
          ))}
        </select>
        <input className="border p-2 w-full mb-2" placeholder="Principal" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        <input className="border p-2 w-full mb-2" placeholder="Interest Rate (%)" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
        <button onClick={saveDebt} className="bg-green-600 text-white px-4 py-2 rounded">Save Debt</button>
      </div>

      {/* List Customers */}
      <div className="border p-4 rounded">
        <h2 className="font-semibold mb-2">My Customers</h2>
        {customers.map((c) => (
          <div key={c.id} className="mb-3 border p-2 rounded">
            <p><strong>{c.full_name}</strong> – {c.email}</p>
            <ul className="ml-4 list-disc">
              {debts[c.id]?.map((d) => (
                <li key={d.id}>₹{d.principal} at {d.interest_rate}%</li>
              )) || <p>No debts</p>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
