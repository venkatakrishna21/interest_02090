"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function OwnerDashboard() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("customers")
        .select("id, full_name, email, phone, address");

      if (!error && data) {
        setCustomers(data);
      }
      setLoading(false);
    };

    fetchCustomers();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📋 Owner Dashboard</h1>
      <p className="mb-4">Manage your customers and their debts.</p>

      <ul className="space-y-2">
        {customers.map((c) => (
          <li key={c.id} className="border p-3 rounded">
            <p className="font-semibold">{c.full_name}</p>
            <p>{c.email}</p>
            <p>{c.phone}</p>
            <p>{c.address}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
