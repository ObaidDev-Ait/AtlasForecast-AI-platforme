/**
 * apply-migration-pg.js
 * Applies the role column migration using the pg package directly.
 * Connects to Supabase's connection pooler using the service role key as password.
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('../apps/api/node_modules/pg');

const envPath = path.join(__dirname, '..', 'apps', 'api', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const urlMatch = envContent.match(/^SUPABASE_URL=(.+)$/m);
const keyMatch = envContent.match(/^SUPABASE_SERVICE_ROLE_KEY=(.+)$/m);

const supabaseUrl = urlMatch[1].trim();
const serviceRoleKey = keyMatch[1].trim();

// Extract the project ref from the URL
const projectRef = new URL(supabaseUrl).hostname.split('.')[0];

console.log(`Project ref: ${projectRef}`);

// Supabase connection pooler details
// Session pooler: port 5432, transaction pooler: port 6543
// Connection string: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
// For hosted Supabase, we can use the REST API to check/get the connection details

async function applyMigration() {
  // For Supabase hosted, try the IPv4 session pooler
  // The pooler accepts the service_role JWT as the password for 'postgres' user
  const poolConfig = {
    host: `aws-0-eu-west-2.pooler.supabase.com`, // default region - may vary
    port: 6543, // transaction pooler
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: serviceRoleKey,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  };

  console.log(`Connecting to Supabase via pooler: ${poolConfig.host}:${poolConfig.port}`);

  const pool = new Pool(poolConfig);

  try {
    const client = await pool.connect();
    console.log('Connected to Supabase!');

    // Check if role column already exists
    const checkRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'role'
    `);

    if (checkRes.rows.length > 0) {
      console.log('RESULT: role column already exists in profiles table');
    } else {
      console.log('role column does not exist, applying migration...');

      // Add the role column
      await client.query(`
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
      `);
      console.log('Added role column');

      // Add check constraint
      try {
        await client.query(`
          ALTER TABLE public.profiles 
          ADD CONSTRAINT check_profile_role CHECK (role IN ('user', 'admin'))
        `);
        console.log('Added check constraint');
      } catch (e) {
        console.log('Check constraint note:', e.message);
      }

      // Update existing NULL roles
      const updateRes = await client.query(`
        UPDATE public.profiles SET role = 'user' WHERE role IS NULL OR role = ''
      `);
      console.log(`Updated ${updateRes.rowCount} profiles to role='user'`);
    }

    // Verify final state
    const verifyRes = await client.query(`
      SELECT id, email, role FROM public.profiles ORDER BY created_at LIMIT 5
    `);
    console.log('Current profiles state:');
    verifyRes.rows.forEach(r => {
      console.log(`  ${r.email}: role=${r.role}`);
    });

    client.release();
  } catch (e) {
    console.error('Connection/migration error:', e.message);
    // Try alternative region
    if (e.message.includes('ENOTFOUND') || e.message.includes('connect')) {
      console.log('Trying US region...');
      await tryUsRegion(serviceRoleKey, projectRef);
    }
  } finally {
    await pool.end();
  }
}

async function tryUsRegion(serviceRoleKey, projectRef) {
  const regions = ['us-east-1', 'us-west-2', 'ap-southeast-1', 'eu-central-1', 'eu-west-1', 'eu-west-3'];
  for (const region of regions) {
    const pool = new Pool({
      host: `aws-0-${region}.pooler.supabase.com`,
      port: 6543,
      database: 'postgres',
      user: `postgres.${projectRef}`,
      password: serviceRoleKey,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    try {
      const client = await pool.connect();
      console.log(`Connected via region ${region}`);
      
      await client.query(`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'`);
      console.log('Migration applied!');
      
      const r = await client.query(`SELECT id, email, role FROM public.profiles LIMIT 3`);
      console.log('Profiles:', r.rows.map(x => `${x.email}:${x.role}`).join(', '));
      
      client.release();
      await pool.end();
      return;
    } catch (e) {
      console.log(`Region ${region} failed: ${e.message.substring(0, 80)}`);
      await pool.end().catch(() => {});
    }
  }
}

applyMigration().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
