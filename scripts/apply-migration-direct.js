/**
 * apply-migration-direct.js
 * 
 * Tries multiple connection strings to apply the role column migration.
 * Uses the pg package with various Supabase pooler configurations.
 * 
 * The service_role key is NOT the database password.
 * The database password is what's set in Supabase Dashboard > Settings > Database.
 * 
 * If the SUPABASE_DB_PASSWORD env var is set, we'll try a direct pg connection.
 * Otherwise, we'll try a mock approach with the anon key.
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('../backend/node_modules/pg');

const envPath = path.join(__dirname, '..', 'backend', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const urlMatch = envContent.match(/^SUPABASE_URL=(.+)$/m);
const keyMatch = envContent.match(/^SUPABASE_SERVICE_ROLE_KEY=(.+)$/m);
const dbPasswordMatch = envContent.match(/^SUPABASE_DB_PASSWORD=(.+)$/m);
const dbUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m);

const supabaseUrl = urlMatch[1].trim();
const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
const dbPassword = dbPasswordMatch ? dbPasswordMatch[1].trim() : null;
const dbUrl = dbUrlMatch ? dbUrlMatch[1].trim() : null;

const SQL = `
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
UPDATE public.profiles SET role = 'user' WHERE role IS NULL OR role = '';
`;

async function tryConnect(config, label) {
  const pool = new Pool({ ...config, connectionTimeoutMillis: 6000 });
  try {
    const client = await pool.connect();
    console.log(`✅ Connected via ${label}`);
    await client.query(SQL);
    console.log('✅ Migration applied!');
    
    const res = await client.query('SELECT id, email, role FROM public.profiles LIMIT 5');
    console.log('Current profiles:');
    res.rows.forEach(r => console.log(`  ${r.email || r.id}: role=${r.role}`));
    
    client.release();
    await pool.end();
    return true;
  } catch (e) {
    console.log(`❌ ${label}: ${e.message.substring(0, 100)}`);
    await pool.end().catch(() => {});
    return false;
  }
}

async function main() {
  console.log('Project ref:', projectRef);

  if (dbUrl) {
    const success = await tryConnect({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } }, 'DATABASE_URL');
    if (success) return;
  }

  if (dbPassword) {
    const regions = ['eu-west-1', 'us-east-1', 'us-west-2', 'ap-southeast-1'];
    for (const region of regions) {
      const success = await tryConnect({
        host: `aws-0-${region}.pooler.supabase.com`,
        port: 6543,
        database: 'postgres',
        user: `postgres.${projectRef}`,
        password: dbPassword,
        ssl: { rejectUnauthorized: false },
      }, `pooler-${region}`);
      if (success) return;

      // Also try direct connection (port 5432)
      const success2 = await tryConnect({
        host: `db.${projectRef}.supabase.co`,
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: dbPassword,
        ssl: { rejectUnauthorized: false },
      }, `direct-${region}`);
      if (success2) return;
    }
  }

  console.log('\n⚠️  Cannot apply migration automatically.');
  console.log('Please apply this SQL in Supabase Dashboard → SQL Editor:');
  console.log(SQL);
  console.log('\nThen restart the API to confirm the migration.');
}

main().catch(e => console.error('Fatal:', e.message));
