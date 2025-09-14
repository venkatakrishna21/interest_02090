"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "customer">("owner");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // ✅ Ensure role metadata is saved with magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { role }, // 👈 This ensures role is saved on user_metadata
        },
      });

      if (error) {
        setMessage(`❌ Error: ${error.message}`);
      } else {
        setMessage("✅ Check your email for the magic link!");
      }
    } catch (err: any) {
      setMessage(`❌ Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border px-3 py-2"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "owner" | "customer")}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="owner">Login as Owner</option>
            <option value="customer">Login as Customer</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}
