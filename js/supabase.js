// Supabase browser client for AI Campus Copilot.
// Only the publishable key belongs in browser code.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://psvqvwdaifieeohegqtd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_dbZHUBXPgIom0CPFqWtcDA_RuEguXc7';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
