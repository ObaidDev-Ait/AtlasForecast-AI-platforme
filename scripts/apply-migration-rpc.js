/**
 * apply-migration-rpc.js
 * Applies the role column migration using Supabase REST API /rest/v1/rpc approach.
 * 
 * For hosted Supabase, we can use the pg REST endpoint directly:
 * POST {supabase_url}/rest/v1/rpc/exec_sql  (if function exists)
 * OR
 * POST {supabase_url}/pg/query (self-hosted only)
 * 
 * The most reliable approach for hosted Supabase without direct psql:
 * Use the Supabase client to INSERT/UPDATE with .rpc() calling a migration function,
 * OR execute statements individually through the client SDK.
 */
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'backend', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const urlMatch = envContent.match(/^SUPABASE_URL=(.+)$/m);
const keyMatch = envContent.match(/^SUPABASE_SERVICE_ROLE_KEY=(.+)$/m);

const supabaseUrl = urlMatch[1].trim();
const serviceRoleKey = keyMatch[1].trim();

async function applyMigration() {
  const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
  const fn = await fetch;

  // Use the Supabase pg REST endpoint for hosted projects
  // This endpoint is accessible with the service_role key
  const endpoints = [
    // Supabase hosted REST SQL endpoint (works with service role in some configs)
    {
      url: `${supabaseUrl}/rest/v1/rpc/exec_migration`,
      body: JSON.stringify({ sql: "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'" }),
      name: 'rpc/exec_migration'
    },
  ];

  // Try the direct SQL via the pg endpoint (Supabase REST API)
  // POST /rest/v1/ with raw SQL is not supported, but we can use
  // the management API with a project access token
  
  // BEST APPROACH: Use Supabase's built-in pg endpoint
  const sqlStatements = [
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'",
    "UPDATE public.profiles SET role = 'user' WHERE role IS NULL OR role = ''"
  ];

  console.log('Attempting to apply migration via pg endpoint...');
  
  for (const sql of sqlStatements) {
    const res = await fn(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      }
    });
    console.log('REST API accessible:', res.status);
    break;
  }

  // Actually use the correct approach: Supabase allows raw SQL via
  // the service role through the pg.query RPC if we create a helper function
  // Let's try the alternative: use the postgrest endpoint with a raw query
  
  // The correct Supabase-native way is:
  // supabase.rpc('run_sql', { query: '...' })  -- but this function must exist
  
  // Let's try the SQL endpoint directly
  const sqlRes = await fn(`${supabaseUrl}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sqlStatements[0] }),
  });
  console.log('RPC endpoint status:', sqlRes.status);
  console.log('RPC response:', await sqlRes.text());
}

applyMigration().catch(e => {
  console.error('Error:', e.message);
});
