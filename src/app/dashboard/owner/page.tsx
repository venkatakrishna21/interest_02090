'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import type { Debt, Customer } from '../../../types/database';
import DebtChart from '../../../components/DebtChart';

export default function OwnerDashboard() {
  const [customers,setCustomers]=useState<Customer[]>([]);
  const [debts,setDebts]=useState<Debt[]>([]);
  const [total,setTotal]=useState(0);

  useEffect(()=>{
    const load = async ()=>{
      const { data: c } = await supabase.from('customers').select('id,name,email');
      setCustomers(c || []);
      const { data: d } = await supabase.from('debts').select('id,principal,interest_rate,updated_at,customer_id,status');
      setDebts(d || []);
      let t=0; (d||[]).forEach((x:any)=> t+=Number(x.principal||0)); setTotal(t);
    };
    load();
  },[]);

  return (
    <div style={{padding:20}}>
      <h1>Owner Dashboard</h1>
      <div style={{display:'flex',gap:20}}>
        <div style={{flex:1}}>
          <h3>Customers ({customers.length})</h3>
          <ul>{customers.map(c=> <li key={c.id}>{c.name} - {c.email}</li>)}</ul>
        </div>
        <div style={{flex:1}}>
          <h3>Debts ({debts.length})</h3>
          <ul>{debts.map(d=> <li key={d.id}>CID:{d.customer_id} ₹{d.principal} ({d.status})</li>)}</ul>
          <p>Total: ₹{total}</p>
        </div>
      </div>

      <div style={{marginTop:20}}>
        <h3>Debt Chart</h3>
        <DebtChart debts={debts} />
      </div>
    </div>
  );
}
