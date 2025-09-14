"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CustomerDashboard() {
  const [debts, setDebts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) router.replace("/login");
    };

    const fetchDebts = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("debts")
        .select("id, amount, interest_rate, status")
        .eq("customer_id", user.id);

      if (!error) setDebts(data || []);
    };

    checkSession();
    fetchDebts();
  }, [router]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">💳 My Debts</h1>
      {debts.length === 0 ? (
        <p>You have no debts yet.</p>
      ) : (
        <ul className="space-y-3">
          {debts.map((d) => (
            <li key={d.id} className="p-4 border rounded bg-white">
              💰 {d.amount} @ {d.interest_rate}%
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
