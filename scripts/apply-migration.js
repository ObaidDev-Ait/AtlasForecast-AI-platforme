/**
 * apply-migration.js
 * Applies the role column migration to Supabase profiles table.
 */
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'backend', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const urlMatch = envContent.match(/^SUPABASE_URL=(.+)$/m);
const keyMatch = envContent.match(/^SUPABASE_SERVICE_ROLE_KEY=(.+)$/m);

if (!urlMatch || !keyMatch) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const serviceRoleKey = keyMatch[1].trim();
const ref = new URL(supabaseUrl).hostname.split('.')[0];

console.log('Project ref:', ref);

async function applyMigration() {
  const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
  const fn = await fetch;

  const sql = `
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
    UPDATE public.profiles SET role = 'user' WHERE role IS NULL OR role = '';
  `;

  // Try Supabase Management API
  const mgmtRes = await fn(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const mgmtText = await mgmtRes.text();
  console.log('Management API status:', mgmtRes.status);
  console.log('Response:', mgmtText.substring(0, 600));
}

applyMigration().catch((e) => {
  console.error('Migration error:', e.message);
  process.exit(1);
});
