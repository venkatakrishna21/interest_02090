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
        emailRedirectTo: `${window.location.origin}/auth/callback?role=${role}`,
      },
    });

    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setMessage("✅ Check your email for the login link.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>

        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2 mb-3"
        />

        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={role === "owner"}
              onChange={() => setRole("owner")}
            />
            Owner
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={role === "customer"}
              onChange={() => setRole("customer")}
            />
            Customer
          </label>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send Magic Link
        </button>

        {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
