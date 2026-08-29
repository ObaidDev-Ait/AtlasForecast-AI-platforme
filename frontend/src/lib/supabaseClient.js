import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const cleanValue = (val) => {
  if (typeof val !== 'string') return undefined;
  let trimmed = val.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  return trimmed.replace(/\/+$/, '');
};

const SUPABASE_URL = cleanValue(rawUrl);
const SUPABASE_ANON_KEY = cleanValue(rawKey);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Do not crash the app — log only. Auth flows that depend on Supabase
  // will surface a clear error when they try to run.
  // eslint-disable-next-line no-console
  console.warn('Supabase client not configured: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing.');
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
