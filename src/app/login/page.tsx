// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "customer" | null>(null);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    if (!email || !role) {
      setMessage("Please enter email and select role.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`, // 👈 redirect here
        data: { role }, // 👈 save role in metadata
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Magic link sent! Check your email.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">Login</h1>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setRole("owner")}
            className={`flex-1 p-2 rounded ${
              role === "owner" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Login as Owner
          </button>
          <button
            onClick={() => setRole("customer")}
            className={`flex-1 p-2 rounded ${
              role === "customer" ? "bg-green-600 text-white" : "bg-gray-200"
            }`}
          >
            Login as Customer
          </button>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white p-2 rounded hover:bg-gray-800"
        >
          Send Magic Link
        </button>

        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </div>
    </div>
  );
}
