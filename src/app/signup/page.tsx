"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "customer">("owner");
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    setMessage("Sending magic link...");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?role=${role}`,
      },
    });

    if (error) setMessage("❌ " + error.message);
    else setMessage("✅ Check your email for the login link");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4">Signup</h1>

        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2 mb-3"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "owner" | "customer")}
          className="w-full border rounded p-2 mb-3"
        >
          <option value="owner">Owner</option>
          <option value="customer">Customer</option>
        </select>

        <button
          onClick={handleSignup}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Signup
        </button>

        {message && <p className="mt-3">{message}</p>}
      </div>
    </div>
  );
}
