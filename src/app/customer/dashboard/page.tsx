"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CustomerDashboard() {
  const [session, setSession] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        loadCustomer(data.session.user.id);
      }
    });
  }, []);

  async function loadCustomer(userId: string) {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!error) setCustomer(data);
  }

  async function saveCustomer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const { error } = await supabase
      .from("customers")
      .upsert
