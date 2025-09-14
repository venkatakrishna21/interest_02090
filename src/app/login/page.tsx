"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (role: "owner" | "customer") => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: { role }, // ✅ Store role so callback knows
      },
    });

    setLoading(false);

    if (error) {
      alert("❌ " + error.message);
    } else {
      alert("✅ Magic link sent to " + email);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-96">
        <h1 className="text-xl font-bold mb-4 text-center">Login</h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full p-2 border rounded mb-4"
        />

        <div className="flex gap-2">
          <button
            onClick={() => handleLogin("owner")}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded"
          >
            {loading ? "Sending..." : "Login as Owner"}
          </button>

          <button
            onClick={() => handleLogin("customer")}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 rounded"
          >
            {loading ? "Sending..." : "Login as Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
