"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CustomerDashboard() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // ✅ Load customers for this owner
  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase.from("customers").select("*");
      if (error) {
        console.error("❌ Error fetching customers:", error.message);
      } else {
        setCustomers(data || []);
      }
    };

    fetchCustomers();
  }, []);

  // ✅ Save new customer
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("❌ Not logged in");
      return;
    }

    // Find owner for this user
    const { data: owner, error: ownerError } = await supabase
      .from("owners")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (ownerError || !owner) {
      console.error("❌ Error finding owner:", ownerError?.message);
      alert("No matching owner found");
      return;
    }

    const { error } = await supabase.from("customers").insert({
      owner_id: owner.id,
      full_name: fullName,
      email,
      phone,
      address,
    });

    if (error) {
      console.error("❌ Error saving customer:", error.message);
      alert("❌ " + error.message);
    } else {
      alert("✅ Customer saved!");
      setFullName("");
      setEmail("");
      setPhone("");
      setAddress("");

      const { data } = await supabase.from("customers").select("*");
      setCustomers(data || []);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Customer Dashboard</h1>

      {/* Add Customer Form */}
      <form onSubmit={handleSaveCustomer} className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <input
          type="email"
          placeholder="Customer Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="border p-2 w-full"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save Customer
        </button>
      </form>

      {/* List Customers */}
      <h2 className="text-lg font-semibold mb-2">Your Customers</h2>
      <ul className="space-y-2">
        {customers.map((c) => (
          <li key={c.id} className="border p-2 rounded">
            <p><strong>{c.full_name}</strong> ({c.email})</p>
            <p>{c.phone} | {c.address}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
