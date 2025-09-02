import { NextResponse } from 'next/server';
import supabaseAdmin from '../../../../lib/supabaseAdmin';

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, name, owner_id } = body;

  if (!email || !password || !owner_id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const { data: user, error: userErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 });

  const userId = user.user?.id;

  const { error: insertErr } = await supabaseAdmin.from('customers').insert([{
    id: userId,
    owner_id,
    name,
    email
  }]);

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, user: user.user });
}
