/**
 * promote-admin.js
 * Secure script to promote a user to administrator.
 *
 * Usage:
 *   node scripts/promote-admin.js <email> [demote]
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const emailToPromote = process.argv[2];
const action = process.argv[3]; // 'demote' to set back to 'user'

if (!emailToPromote) {
  console.error('Error: Please specify the user email: node scripts/promote-admin.js <email>');
  process.exit(1);
}

const targetRole = action === 'demote' ? 'user' : 'admin';

const envPath = path.join(__dirname, '..', 'apps', 'api', '.env');
if (!fs.existsSync(envPath)) {
  console.error('Error: apps/api/.env file not found.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const urlMatch = envContent.match(/^SUPABASE_URL=(.+)$/m);
const keyMatch = envContent.match(/^SUPABASE_SERVICE_ROLE_KEY=(.+)$/m);

if (!urlMatch || !keyMatch) {
  console.error('Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in apps/api/.env.');
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const serviceRoleKey = keyMatch[1].trim();

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function main() {
  const normalizedEmail = emailToPromote.trim().toLowerCase();
  console.log(`Looking up user: ${normalizedEmail}...`);

  const { data, error } = await adminClient.auth.admin.listUsers();
  if (error) {
    console.error('Failed to list users from Supabase Auth:', error.message);
    process.exit(1);
  }

  const targetUser = data.users.find(
    (u) => (u.email || '').toLowerCase() === normalizedEmail
  );

  if (!targetUser) {
    console.error(`User not found with email: ${normalizedEmail}`);
    process.exit(1);
  }

  console.log(`Found user ID: ${targetUser.id}`);

  // 1. Update Supabase Auth app_metadata
  const existingAppMetadata = targetUser.app_metadata || {};
  const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(
    targetUser.id,
    {
      app_metadata: {
        ...existingAppMetadata,
        role: targetRole,
      },
    }
  );

  if (updateAuthError) {
    console.error('Failed to update user app_metadata:', updateAuthError.message);
  } else {
    console.log(`Updated Auth app_metadata to role="${targetRole}".`);
  }

  // 2. Update profiles table in Supabase
  try {
    const { error: updateProfileError } = await adminClient
      .from('profiles')
      .update({ role: targetRole })
      .eq('id', targetUser.id);

    if (updateProfileError) {
      console.log(`Note on profiles table: ${updateProfileError.message}`);
    } else {
      console.log(`Updated profiles table role to "${targetRole}".`);
    }
  } catch (e) {
    console.log('Profiles table update skipped:', e.message);
  }

  // 3. Update server-side persistent admin store
  const storePath = path.join(__dirname, '..', 'apps', 'api', 'admin-store.json');
  let store = { admins: [] };
  if (fs.existsSync(storePath)) {
    try {
      store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    } catch (_) {}
  }
  if (!Array.isArray(store.admins)) store.admins = [];

  if (targetRole === 'admin') {
    if (!store.admins.includes(targetUser.id)) store.admins.push(targetUser.id);
    if (!store.admins.includes(normalizedEmail)) store.admins.push(normalizedEmail);
  } else {
    store.admins = store.admins.filter(
      (entry) => entry !== targetUser.id && entry !== normalizedEmail
    );
  }

  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
  console.log(`Synchronized server-side admin store.`);

  console.log(`\nSUCCESS: User ${normalizedEmail} now has role="${targetRole}".`);
}

main().catch((err) => {
  console.error('Promotion error:', err.message);
  process.exit(1);
});
