import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing Supabase config. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.",
  );
}

// Initialize Supabase Client with service role key for admin privileges.
// Since the backend is a stateless API, auth session persistence and token auto-refresh are disabled.
const db = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default db;
