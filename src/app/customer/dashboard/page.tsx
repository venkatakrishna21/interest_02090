"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
}

export default function CustomerDashboard() {
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // edit mode
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // customers list
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Fetch owner & customers on mount
  useEffect(() => {
    const getOwnerIdAndCustomers = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("⚠️ No logged in user found");
        setLoading(false);
        return;
      }

      // find owner row
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

      // fetch customers for this owner
      const { data: custs, error: custError } = await supabase
        .from("customers")
        .select("id, full_name, email, phone, address")
        .eq("owner_id", owner.id);

      if (custError) {
        console.error("❌ Error fetching customers:", custError.message);
        setError("❌ Error fetching customers: " + custError.message);
      } else {
        setCustomers(custs || []);
      }

      setLoading(false);

      // ✅ subscribe to realtime changes
      const channel = supabase
        .channel("realtime-customers")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "customers",
            filter: `owner_id=eq.${owner.id}`,
          },
          (payload) => {
            console.log("Realtime event:", payload);
            if (payload.eventType === "INSERT") {
              setCustomers((prev) => [...prev, payload.new as Customer]);
            } else if (payload.eventType === "UPDATE") {
              setCustomers((prev) =>
                prev.map((cust) =>
                  cust.id === payload.new.id ? (payload.new as Customer) : cust
                )
              );
            } else if (payload.eventType === "DELETE") {
              setCustomers((prev) =>
                prev.filter((cust) => cust.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    getOwnerIdAndCustomers();
  }, []);

  // Save or update customer
  const saveCustomer = async () => {
    if (!ownerId) {
      setError("⚠️ Owner not found. Cannot save customer.");
      return;
    }

    if (editingCustomer) {
      // update existing customer
      const { error } = await supabase
        .from("customers")
        .update({
          full_name: fullName,
          email,
          phone,
          address,
        })
        .eq("id", editingCustomer.id)
        .eq("owner_id", ownerId);

      if (error) {
        console.error("❌ Error updating customer:", error.message);
        setError("❌ Error updating customer: " + error.message);
      } else {
        resetForm();
      }
    } else {
      // insert new customer
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
        resetForm();
      }
    }
  };

  // Delete customer
  const deleteCustomer = async (id: string) => {
    if (!ownerId) return;

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id)
      .eq("owner_id", ownerId);

    if (error) {
      console.error("❌ Error deleting customer:", error.message);
      setError("❌ Error deleting customer: " + error.message);
    }
  };

  // reset form
  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setEditingCustomer(null);
    setError(null);
  };

  // edit customer
  const startEditing = (cust: Customer) => {
    setEditingCustomer(cust);
    setFullName(cust.full_name);
    setEmail(cust.email);
    setPhone(cust.phone);
    setAddress(cust.address);
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Add / Edit customer form */}
      <div className="space-y-3 border p-4 rounded bg-gray-50 mb-6">
        <h2 className="text-lg font-semibold">
          {editingCustomer ? "✏️ Edit Customer" : "➕ Add New Customer"}
        </h2>
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

        <div className="flex space-x-2">
          <button
            onClick={saveCustomer}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {editingCustomer ? "Update Customer" : "Save Customer"}
          </button>
          {editingCustomer && (
            <button
              onClick={resetForm}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List customers */}
      <div>
        <h2 className="text-lg font-semibold mb-3">📋 Your Customers</h2>
        {customers.length === 0 ? (
          <p>No customers added yet.</p>
        ) : (
          <ul className="space-y-2">
            {customers.map((cust) => (
              <li
                key={cust.id}
                className="border p-3 rounded bg-white shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{cust.full_name}</p>
                  <p className="text-sm text-gray-600">{cust.email}</p>
                  <p className="text-sm text-gray-600">{cust.phone}</p>
                  <p className="text-sm text-gray-600">{cust.address}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => startEditing(cust)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCustomer(cust.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
