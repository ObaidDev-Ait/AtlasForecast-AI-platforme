import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fxzqeoaajqqfcurfwtnk.supabase.co';
const supabaseAnonKey = 'sb_publishable_cK5gEmaT24RCcGYvXvSXsg_G_kAyKyO';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFullBackendFlow() {
    console.log('--- DÉBUT DU TEST DU BACKEND SUPABASE ---');

    const email = 'test_backend_' + Date.now() + '@gmail.com';
    const password = 'Password123!';

    // 1. Inscription (Register)
    console.log('1. Tentative création de compte :', email);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { first_name: 'Test', last_name: 'Backend' }
        }
    });

    if (signUpError) {
        console.error('? ERREUR INSCRIPTION:', signUpError.message);
        return;
    }
    console.log('? INSCRIPTION RÉUSSIE! ID:', signUpData.user.id);
    
    // Attendre un peu pour que le trigger crée le profil (quelques millisecondes suffisent en général)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Connexion (Login)
    console.log('\n2. Tentative de connexion...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginError) {
        console.error('? ERREUR CONNEXION:', loginError.message);
        return;
    }
    console.log('? CONNEXION RÉUSSIE! Session active.');

    // 3. Récupération du Profil
    console.log('\n3. Récupération du Profil depuis la base de données...');
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', loginData.user.id)
        .single();

    if (profileError) {
        console.error('? ERREUR PROFIL:', profileError.message);
        return;
    }
    console.log('? PROFIL TROUVÉ:', profile);

    // 4. Test d achat Premium
    console.log('\n4. Simulation achat Premium (passage en is_premium: true)...');
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_premium: true })
        .eq('id', loginData.user.id);

    if (updateError) {
        console.error('? ERREUR MISE À JOUR:', updateError.message);
        return;
    }
    
    const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', loginData.user.id)
        .single();

    console.log('? ACHAT SIMULÉ. Nouveau statut Premium:', updatedProfile.is_premium);

    console.log('\n--- TOUT FONCTIONNE PARFAITEMENT ! ---');
}

testFullBackendFlow();
