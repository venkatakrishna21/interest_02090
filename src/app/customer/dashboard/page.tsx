"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function CustomerDashboard() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch logged-in owner's customers
  useEffect(() => {
    const fetchCustomers = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/owner/login");
        return;
      }

      // Find owner row
      const { data: owner } = await supabase
        .from("owners")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!owner) {
        console.error("❌ No matching owner found");
        return;
      }

      // Fetch customers for this owner
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("owner_id", owner.id);

      if (error) console.error(error);
      else setCustomers(data || []);
    };

    fetchCustomers();
  }, [router]);

  // ✅ Add new customer
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Not logged in");
      setLoading(false);
      return;
    }

    // Find owner row
    const { data: owner, error: ownerError } = await supabase
      .from("owners")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (ownerError || !owner) {
      alert("❌ No matching owner found for current user");
      setLoading(false);
      return;
    }

    // Insert customer
    const { error } = await supabase.from("customers").insert({
      full_name: fullName,
      email,
      phone,
      address,
      owner_id: owner.id,
    });

    if (error) {
      console.error("❌ Error saving customer:", error.message);
      alert("Error saving customer: " + error.message);
    } else {
      alert("✅ Customer added successfully!");
      setFullName("");
      setEmail("");
      setPhone("");
      setAddress("");
    }

    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Owner Dashboard</h1>

      {/* ➕ Add Customer Form */}
      <form onSubmit={handleAddCustomer} className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="Customer Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add Customer"}
        </button>
      </form>

      {/* 📋 List Customers */}
      <h2 className="text-xl font-semibold mb-2">Your Customers</h2>
      <ul className="space-y-2">
        {customers.map((c) => (
          <li
            key={c.id}
            className="border rounded p-3 bg-gray-50 flex justify-between"
          >
            <span>
              <strong>{c.full_name}</strong> – {c.email}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
