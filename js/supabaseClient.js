import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://rbkjiasrkbifhqsccrwv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJia2ppYXNya2JpZmhxc2Njcnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTIxMjEsImV4cCI6MjA2NTc2ODEyMX0.zABQUHL22qmWiOpLuIJvHgpWM0ZRtlrNFLcT-oEFbVw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Cria perfil do usuário se não existir
export const ensureUserProfile = async (userId, email) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !data) {
        const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
                id: userId,
                email: email,
                full_name: email.split('@')[0],
                created_at: new Date()
            }]);

        if (insertError) {
            console.error('Erro ao criar perfil:', insertError);
        }
    }
};
