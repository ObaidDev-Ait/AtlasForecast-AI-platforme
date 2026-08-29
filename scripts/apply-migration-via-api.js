/**
 * apply-migration-via-api.js
 * 
 * Applies the role column migration using the Supabase Admin REST API.
 * The service-role JWT allows calling PostgREST with bypassed RLS,
 * but for DDL (ALTER TABLE) we need to use the pg.query endpoint
 * which is available at /rest/v1/rpc/{function_name} if a function exists.
 * 
 * This script uses a workaround: insert a record with a 'role' column
 * attempt that reveals whether the column exists, then applies the migration
 * via the Supabase SQL API endpoint.
 */
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'backend', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const urlMatch = envContent.match(/^SUPABASE_URL=(.+)$/m);
const keyMatch = envContent.match(/^SUPABASE_SERVICE_ROLE_KEY=(.+)$/m);

const supabaseUrl = urlMatch[1].trim();
const serviceRoleKey = keyMatch[1].trim();

async function main() {
  const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
  const fn = await fetch;

  // Step 1: Verify role column doesn't exist
  const checkRes = await fn(`${supabaseUrl}/rest/v1/profiles?select=role&limit=1`, {
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
    }
  });

  const checkText = await checkRes.text();
  
  if (checkRes.ok) {
    console.log('✅ ROLE_COLUMN_EXISTS — migration already applied.');
    console.log('Current data sample:', checkText.substring(0, 200));
    return;
  }

  if (!checkText.includes('role') && !checkText.includes('column')) {
    console.log('Unexpected check response:', checkText);
    return;
  }

  console.log('❌ role column missing. Applying migration...');

  // Step 2: Use Supabase SQL API (pg.query via REST)
  // For hosted Supabase, the SQL endpoint is at /rest/v1/rpc/pg_query 
  // or we need to use the pg connection string directly
  
  // Try the Supabase pg query endpoint (available on some versions)
  const sqlRes = await fn(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sql: "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'"
    })
  });
  
  console.log('exec_sql status:', sqlRes.status);
  console.log('exec_sql response:', (await sqlRes.text()).substring(0, 300));
}

main().catch(e => {
  console.error('Error:', e.message);
});
