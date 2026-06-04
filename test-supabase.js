import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fxzqeoaajqqfcurfwtnk.supabase.co';
const supabaseAnonKey = 'sb_publishable_cK5gEmaT24RCcGYvXvSXsg_G_kAyKyO';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
    console.log('Testing Supabase Signup with realistic email...');
    const { data, error } = await supabase.auth.signUp({
        email: 'atlasforecast.test@gmail.com',
        password: 'Password123!',
        options: {
            data: {
                first_name: 'Test',
                last_name: 'Agent'
            }
        }
    });

    if (error) {
        console.error('SUPABASE ERROR:', error.message, error.status, error.name);
    } else {
        console.log('SUCCESS! User created:', data.user?.email);
    }
}

testSignup();
