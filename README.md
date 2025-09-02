# Interest - Full Featured

This project is a full-featured Next.js + Supabase template for tracking debts, owners and customers,
with monthly interest cron and email notifications via Resend.

Environment variables (.env.local or Vercel):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- RESEND_API_KEY
- EMAIL_FROM
- CRON_SECRET

Deploy on Vercel: push to GitHub, import project, add the above env vars, then deploy.
