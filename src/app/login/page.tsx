"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "customer">("owner");
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setMessage("Sending magic link...");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?role=${role}`,
      },
    });

    if (error) {
      setMessage("❌ Error: " + error.message);
    } else {
      setMessage("✅ Magic link sent to " + email);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>

        {message && <p className="mb-2 text-sm">{message}</p>}

        <input
          type="email"
          placeholder="Enter your email"
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
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Send Magic Link
        </button>
      </div>
    </div>
  );
}
