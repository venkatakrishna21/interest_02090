import { NextResponse } from 'next/server';
import supabaseAdmin from '../../../../lib/supabaseAdmin';

export async function POST(req: Request) {
  const body = await req.json();
  const { customer_id, principal, interest_rate } = body;
  if (!customer_id || !principal) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const { data, error } = await supabaseAdmin.from('debts').insert([{
    customer_id, principal, interest_rate, status: 'active'
  }]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, debt: data?.[0] });
}
