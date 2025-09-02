import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !serviceRole) {
  console.warn('Supabase admin env vars missing');
}

const supabaseAdmin = createClient(supabaseUrl || '', serviceRole || '');

export default supabaseAdmin;
