import { NextResponse } from 'next/server';
import supabaseAdmin from '../../../lib/supabaseAdmin';
import { sendEmail } from '../../../lib/email';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization') || '';
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: debts, error } = await supabaseAdmin.from('debts').select('id,customer_id,principal,interest_rate,status');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const updates = [];
  for (const d of (debts || [])) {
    const newPrincipal = Number(d.principal) + (Number(d.principal) * (Number(d.interest_rate) || 0) / 100);
    updates.push({ id: d.id, principal: newPrincipal.toString() });
  }

  for (const u of updates) {
    await supabaseAdmin.from('debts').update({ principal: u.principal, updated_at: new Date().toISOString() }).eq('id', u.id);
  }

  const { data: customerRows } = await supabaseAdmin.from('customers').select('id,email');
  const custMap = (customerRows || []).reduce((acc, c) => ({ ...acc, [c.id]: c.email }), {} as any);

  for (const d of (debts || [])) {
    const email = custMap[d.customer_id];
    if (email && process.env.RESEND_API_KEY) {
      try {
        await sendEmail(email, 'Monthly interest applied', `<p>Your new balance is ₹${(Number(d.principal) * (1 + (Number(d.interest_rate)||0)/100)).toFixed(2)}</p>`);
      } catch(e) {
        console.error('email error', e);
      }
    }
  }

  return NextResponse.json({ ok: true, count: updates.length });
}
