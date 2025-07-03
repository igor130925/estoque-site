document.addEventListener('DOMContentLoaded', async () => {
    // Carrega informações do usuário
    await loadUserProfile();
    
    // Event listeners
    document.getElementById('changeAvatarBtn').addEventListener('click', () => {
        document.getElementById('avatarUpload').click();
    });
    
    document.getElementById('avatarUpload').addEventListener('change', handleAvatarUpload);
    document.getElementById('saveNameBtn').addEventListener('click', updateUserName);
    document.getElementById('changePasswordBtn').addEventListener('click', updatePassword);
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

async function loadUserProfile() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
        console.error('Erro ao carregar perfil:', error);
        window.location.href = 'index.html';
        return;
    }
    
    // Carrega dados adicionais do perfil
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    // Preenche os campos
    document.getElementById('userName').value = profile?.full_name || '';
    document.getElementById('userEmail').value = user.email;
    
    // Carrega avatar se existir
    if (profile?.avatar_url) {
        document.getElementById('avatarPreview').src = profile.avatar_url;
    }
}

async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-avatar.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    

    
    // Obtém URL pública
    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
    
    // Atualiza perfil com a nova URL
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);
    
    if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
    } else {
        document.getElementById('avatarPreview').src = publicUrl;
        alert('Avatar atualizado com sucesso!');
    }
}

async function updateUserName() {
    const newName = document.getElementById('userName').value.trim();
    if (!newName) {
        alert('Por favor, insira um nome válido');
        return;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
        .from('profiles')
        .update({ full_name: newName })
        .eq('id', user.id);
    
    if (error) {
        console.error('Erro ao atualizar nome:', error);
        alert('Erro ao atualizar nome');
    } else {
        alert('Nome atualizado com sucesso!');
    }
}

async function updatePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        alert('As senhas não coincidem');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres');
        return;
    }
    
    // Primeiro verifica a senha atual
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email: document.getElementById('userEmail').value,
        password: currentPassword
    });
    
    if (authError) {
        alert('Senha atual incorreta');
        return;
    }
    
    // Atualiza a senha
    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
    });
    
    if (updateError) {
        console.error('Erro ao atualizar senha:', updateError);
        alert('Erro ao atualizar senha');
    } else {
        alert('Senha atualizada com sucesso!');
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }
}

async function logout() {
    const { error } = await supabase.auth.signOut();
    window.location.href = 'index.html';
}