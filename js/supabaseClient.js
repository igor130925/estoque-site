import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://rbkjiasrkbifhqsccrwv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJia2ppYXNya2JpZmhxc2Njcnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTIxMjEsImV4cCI6MjA2NTc2ODEyMX0.zABQUHL22qmWiOpLuIJvHgpWM0ZRtlrNFLcT-oEFbVw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
// Configuração do storage para avatares
const initStorage = () => {
    supabase.storage.createBucket('avatars', {
        public: false,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5 // 5MB
    }).then(({ error }) => {
        if (error && error.message !== 'Bucket already exists') {
            console.error('Erro ao criar bucket:', error);
        }
    });
};

// Cria perfil do usuário se não existir
const ensureUserProfile = async (userId, email) => {
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

// Chamar initStorage quando o arquivo for carregado
initStorage();