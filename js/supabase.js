// Supabase browser client for AI Campus Copilot.
// The UMD build is loaded by index.html/login.html before this module.
const SUPABASE_URL = 'https://psvqvwdaifieeohegqtd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_dbZHUBXPgIom0CPFqWtcDA_RuEguXc7';

if (!window.supabase || typeof window.supabase.createClient !== 'function') {
  throw new Error('Supabase browser library did not load.');
}

export const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
