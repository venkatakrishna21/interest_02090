"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Customer = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
};

type Debt = {
  id: string;
  customer_id: string;
  amount: number;
  reason: string;
  created_at: string;
};

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [debts, setDebts] = useState<Record<string, Debt[]>>({});

  // Customer form
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Debt form
  const [debtAmount, setDebtAmount] = useState("");
  const [debtReason, setDebtReason] = useState("");
  const [debtCustomerId, setDebtCustomerId] = useState<string | null>(null);

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("customers").select("*");
    setLoading(false);

    if (error) {
      console.error("❌ Error fetching customers:", error.message);
      setError("❌ Error fetching customers: " + error.message);
    } else {
      setCustomers(data || []);
    }
  };

  // Fetch debts for customers
  const fetchDebts = async (customerId: string) => {
    const { data, error } = await supabase
      .from("debts")
      .select("*")
      .eq("customer_id", customerId);

    if (error) {
      console.error("❌ Error fetching debts:", error.message);
    } else {
      setDebts((prev) => ({ ...prev, [customerId]: data || [] }));
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Save customer (new or update)
  const saveCustomer = async () => {
    setLoading(true);

    if (editingCustomer) {
      const { error } = await supabase
        .from("customers")
        .update({
          full_name: fullName,
          email,
          phone,
          address,
        })
        .eq("id", editingCustomer);

      setLoading(false);

      if (error) {
        setError("❌ Error updating customer: " + error.message);
      } else {
        resetCustomerForm();
        fetchCustomers();
      }
    } else {
      const { error } = await supabase.from("customers").insert([
        {
          full_name: fullName,
          email,
          phone,
          address,
        },
      ]);

      setLoading(false);

      if (error) {
        setError("❌ Error saving customer: " + error.message);
      } else {
        resetCustomerForm();
        fetchCustomers();
      }
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm("Delete this customer and all debts?")) return;

    const { error } = await supabase.from("customers").delete().eq("id", id);

    if (error) {
      setError("❌ Error deleting customer: " + error.message);
    } else {
      fetchCustomers();
    }
  };

  const editCustomer = (c: Customer) => {
    setEditingCustomer(c.id);
    setFullName(c.full_name);
    setEmail(c.email);
    setPhone(c.phone);
    setAddress(c.address);
  };

  const resetCustomerForm = () => {
    setEditingCustomer(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setAddress("");
  };

  // Save debt
  const saveDebt = async () => {
    if (!debtCustomerId) return;

    const { error } = await supabase.from("debts").insert([
      {
        customer_id: debtCustomerId,
        amount: parseFloat(debtAmount),
        reason: debtReason,
      },
    ]);

    if (error) {
      setError("❌ Error saving debt: " + error.message);
    } else {
      setDebtAmount("");
      setDebtReason("");
      setDebtCustomerId(null);
      fetchDebts(debtCustomerId);
    }
  };

  // Delete debt
  const deleteDebt = async (id: string, customerId: string) => {
    const { error } = await supabase.from("debts").delete().eq("id", id);

    if (error) {
      setError("❌ Error deleting debt: " + error.message);
    } else {
      fetchDebts(customerId);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Add/Edit Customer Form */}
      <div className="mb-6 p-4 border rounded bg-white shadow">
        <h2 className="text-xl font-semibold mb-3">
          {editingCustomer ? "Edit Customer" : "Add New Customer"}
        </h2>
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

          <div className="flex gap-3">
            <button
              onClick={saveCustomer}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {editingCustomer ? "Update" : "Save"}
            </button>
            {editingCustomer && (
              <button
                onClick={resetCustomerForm}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customer List */}
      <h2 className="text-xl font-semibold mb-3">My Customers</h2>
      {customers.length === 0 ? (
        <p>No customers yet.</p>
      ) : (
        <div className="space-y-4">
          {customers.map((c) => (
            <div
              key={c.id}
              className="p-4 border rounded bg-gray-50 shadow space-y-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{c.full_name}</p>
                  <p>{c.email}</p>
                  <p>{c.phone}</p>
                  <p>{c.address}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editCustomer(c)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCustomer(c.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Debts Section */}
              <div className="mt-3">
                <h3 className="font-semibold">Debts</h3>
                <button
                  onClick={() => fetchDebts(c.id)}
                  className="text-blue-500 underline text-sm"
                >
                  Load Debts
                </button>

                {/* Add Debt Form */}
                {debtCustomerId === c.id ? (
                  <div className="mt-2 space-y-2">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={debtAmount}
                      onChange={(e) => setDebtAmount(e.target.value)}
                      className="w-full border rounded p-2"
                    />
                    <input
                      type="text"
                      placeholder="Reason"
                      value={debtReason}
                      onChange={(e) => setDebtReason(e.target.value)}
                      className="w-full border rounded p-2"
                    />
                    <button
                      onClick={saveDebt}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Save Debt
                    </button>
                    <button
                      onClick={() => setDebtCustomerId(null)}
                      className="bg-gray-500 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDebtCustomerId(c.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded mt-2"
                  >
                    + Add Debt
                  </button>
                )}

                {/* Debt List */}
                <div className="mt-2 space-y-2">
                  {debts[c.id]?.length ? (
                    debts[c.id].map((d) => (
                      <div
                        key={d.id}
                        className="p-2 border rounded bg-white flex justify-between"
                      >
                        <div>
                          <p>
                            💰 {d.amount} — {d.reason}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(d.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteDebt(d.id, c.id)}
                          className="bg-red-400 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No debts</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
