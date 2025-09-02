'use client';
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function OwnerLogin() {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [msg,setMsg]=useState('');

  const onSubmit = async (e:any) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg(error.message);
    else window.location.href = '/dashboard/owner';
  };

  return (
    <div style={{maxWidth:420,margin:'40px auto'}}>
      <h2>Owner Sign in</h2>
      <form onSubmit={onSubmit}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" className="block mb-2 w-full p-2 border rounded" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" className="block mb-2 w-full p-2 border rounded" />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Sign in</button>
      </form>
      {msg && <p style={{color:'red'}}>{msg}</p>}
    </div>
  );
}
