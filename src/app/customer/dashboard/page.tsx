"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CustomerDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Customer Dashboard</h1>
      {user ? <p>Welcome, {user.email} 🎉</p> : <p>Loading...</p>}
    </div>
  );
}
