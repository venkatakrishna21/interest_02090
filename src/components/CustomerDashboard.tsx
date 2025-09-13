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
  principal: number;
  interest_rate: number;
  created_at: string;
}

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      setLoading(true);

      // 1. Get logged-in user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("No logged in user", userError);
        setLoading(false);
        return;
      }

      // 2. Get customer profile
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("id, full_name, email, phone")
        .eq("user_id", user.id)
        .single();

      if (customerError) {
        console.error("Error fetching customer", customerError);
        setLoading(false);
        return;
      }

      setCustomer(customerData);

      // 3. Get debts for this customer
      const { data: debtsData, error: debtsError } = await supabase
        .from("debts")
        .select("id, principal, interest_rate, created_at")
        .eq("customer_id", customerData.id);

      if (debtsError) {
        console.error("Error fetching debts", debtsError);
        setLoading(false);
        return;
      }

      setDebts(debtsData || []);
      setLoading(false);
    };

    fetchCustomerData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading your dashboard...</div>;
  }

  if (!customer) {
    return <div className="p-6 text-center text-red-500">No customer profile found.</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome, {customer.full_name}</h1>

      {/* Profile Section */}
      <div className="mb-6 p-4 border rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">My Profile</h2>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Phone:</strong> {customer.phone || "N/A"}</p>
      </div>

      {/* Debts Section */}
      <div className="p-4 border rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">My Debts</h2>
        {debts.length === 0 ? (
          <p className="text-gray-600">No debts found.</p>
        ) : (
          <ul className="space-y-4">
            {debts.map((debt) => {
              const interest = (debt.principal * debt.interest_rate) / 100;
              return (
                <li
                  key={debt.id}
                  className="p-3 border rounded-lg bg-gray-50 shadow-sm"
                >
                  <p><strong>Principal:</strong> ₹{debt.principal.toFixed(2)}</p>
                  <p><strong>Interest Rate:</strong> {debt.interest_rate}%</p>
                  <p><strong>Interest Amount:</strong> ₹{interest.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    Added on: {new Date(debt.created_at).toLocaleDateString()}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
