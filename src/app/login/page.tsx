"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const sendMagicLink = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
    });
    if (error) alert(error.message);
    else alert("Emailsent check macha.");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-96">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <input
          type="email"
          className="border p-2 w-full mb-4"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={sendMagicLink} className="bg-blue-600 text-white px-4 py-2 rounded">
          Send Magic Link
        </button>
      </div>
    </div>
  );
}
