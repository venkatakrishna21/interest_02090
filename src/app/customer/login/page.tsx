'use client';
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function CustomerLogin() {
  const [email,setEmail]=useState('');
  const [msg,setMsg]=useState('');

  const onSubmit = async (e:any) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setMsg(error.message); else setMsg('Check your email for a magic link.');
  };

  return (
    <div style={{maxWidth:420,margin:'40px auto'}}>
      <h2>Customer Login</h2>
      <form onSubmit={onSubmit}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" className="block mb-2 w-full p-2 border rounded" />
        <button className="px-4 py-2 bg-green-600 text-white rounded">Send Magic Link</button>
      </form>
      {msg && <p style={{color:'green'}}>{msg}</p>}
    </div>
  );
}
