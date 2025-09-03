"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CustomerDashboard() {
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Fetch owner ID for the logged-in user
  useEffect(() => {
    const getOwnerId = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("⚠️ No logged in user found");
        setLoading(false);
        return;
      }

      // Find owner row for this user
      const { data: owner, error: ownerError } = await supabase
        .from("owners")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (ownerError || !owner) {
        setError("⚠️ No matching owner found. Please relogin.");
        setLoading(false);
        return;
      }

      setOwnerId(owner.id);
      setLoading(false);
    };

    getOwnerId();
  }, []);

  // Save new customer
  const saveCustomer = async () => {
    if (!ownerId) {
      setError("⚠️ Owner not found. Cannot save customer.");
      return;
    }

    const { error } = await supabase.from("customers").insert([
      {
        owner_id: ownerId,
        full_name: fullName,
        email,
        phone,
        address,
      },
    ]);

    if (error) {
      console.error("❌ Error saving customer:", error.message);
      setError("❌ Error saving customer: " + error.message);
    } else {
      setError(null);
      setFullName("");
      setEmail("");
      setPhone("");
      setAddress("");
      alert("✅ Customer saved successfully!");
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="space-y-3">
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
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border rounded p-2"
        />

        <button
          onClick={saveCustomer}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save Customer
        </button>
      </div>
    </div>
  );
}
