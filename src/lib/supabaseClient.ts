import { createBrowserClient } from "@supabase/ssr";

// ✅ Use browser client for client-side authentication (magic links, sessions, etc.)
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
