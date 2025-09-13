"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "customer">("owner");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    setMessage("Sending magic link...");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: { role }, // ✅ Save role metadata
      },
    });

    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setMessage("✅ Check your email for the login link!");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4">Login</h1>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2 mb-3"
        />

        {/* Role Selector */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "owner" | "customer")}
          className="w-full border rounded p-2 mb-3"
        >
          <option value="owner">Login as Owner</option>
          <option value="customer">Login as Customer</option>
        </select>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Send Magic Link
        </button>

        {message && <p className="mt-3 text-center">{message}</p>}
      </div>
    </div>
  );
}
