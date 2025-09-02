"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CustomerDashboard() {
  const [session, setSession] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        loadCustomer(data.session.user.id);
      }
    });
  }, []);

  async function loadCustomer(userId: string) {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!error) setCustomer(data);
  }

  async function saveCustomer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const { error } = await supabase.from("customers").upsert({
      user_id: session.user.id,
      full_name: form.get("full_name") as string,
      phone: form.get("phone") as string,
      address: form.get("address") as string,
    });

    if (error) {
      alert("❌ Error saving customer: " + error.message);
    } else {
      alert("✅ Customer info saved!");
      loadCustomer(session.user.id);
    }
  }

  if (!session) {
    return <p>Loading session...</p>;
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>
      <p className="mb-4">Welcome, {session.user.email} 🎉</p>

      <form onSubmit={saveCustomer} className="space-y-4">
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          defaultValue={customer?.full_name || ""}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          defaultValue={customer?.phone || ""}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          defaultValue={customer?.address || ""}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save Details
        </button>
      </form>
    </div>
  );
}
