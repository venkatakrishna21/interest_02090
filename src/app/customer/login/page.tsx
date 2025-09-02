"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function CustomerLogin() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Magic link sent! Please check your email.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleLogin} className="p-6 border rounded shadow">
        <h1 className="text-xl mb-4">Customer Login</h1>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Send Magic Link
        </button>
        {message && <p className="mt-4 text-sm">{message}</p>}
      </form>
    </div>
  );
}
