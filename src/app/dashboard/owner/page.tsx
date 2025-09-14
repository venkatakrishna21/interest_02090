"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function OwnerDashboard() {
  const [customers, setCustomers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) router.replace("/login");
    };

    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, full_name, email, phone, debts(amount, interest_rate)");
      if (!error) setCustomers(data || []);
    };

    checkSession();
    fetchCustomers();
  }, [router]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Owner Dashboard</h1>
      {customers.length === 0 ? (
        <p>No customers yet.</p>
      ) : (
        <ul className="space-y-3">
          {customers.map((c) => (
            <li key={c.id} className="p-4 border rounded bg-white">
              <p className="font-semibold">{c.full_name}</p>
              <p>{c.email}</p>
              <p>{c.phone}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
