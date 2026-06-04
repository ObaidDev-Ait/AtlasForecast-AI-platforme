import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fxzqeoaajqqfcurfwtnk.supabase.co';
const supabaseAnonKey = 'sb_publishable_cK5gEmaT24RCcGYvXvSXsg_G_kAyKyO';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addSpecificUser() {
    console.log('Adding obaidrebe@gmail.com to Supabase...');
    const { data, error } = await supabase.auth.signUp({
        email: 'obaidrebe@gmail.com',
        password: 'Password123!',
        options: {
            data: {
                first_name: 'Obaid',
                last_name: 'Rebe'
            }
        }
    });

    if (error) {
        console.error('SUPABASE ERROR:', error.message);
    } else {
        console.log('SUCCESS! User created:', data.user?.email);
    }
}

addSpecificUser();
