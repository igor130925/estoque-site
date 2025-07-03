import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();

    document.getElementById('saveNameBtn').addEventListener('click', updateUserName);
    document.getElementById('changePasswordBtn').addEventListener('click', updatePassword);
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

function showMessage(text, type = 'success') {
    const box = document.getElementById('messageBox');
    box.textContent = text;
    box.className = 'message-box ' + type; // 'success' ou 'error'
    box.style.display = 'block';
    box.style.opacity = '1';

    // Esconde depois de 5 segundos com fade-out
    setTimeout(() => {
        box.style.opacity = '0';
        setTimeout(() => {
            box.style.display = 'none';
            box.textContent = '';
            box.className = 'message-box';
            box.style.opacity = '1';
        }, 300);
    }, 5000);
}

function loadUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html'; // redireciona se não estiver logado
        return;
    }

    document.getElementById('userName').value = currentUser.name || '';
    document.getElementById('userCode').value = currentUser.personcode || '';
}

async function updateUserName() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showMessage('Usuário não autenticado', 'error');
        return;
    }

    const newName = document.getElementById('userName').value.trim();
    if (!newName) {
        showMessage('Por favor, insira um nome válido', 'error');
        return;
    }

    const { error } = await supabase
        .from('usuarios')
        .update({ name: newName })
        .eq('id', currentUser.id);

    if (error) {
        console.error('Erro ao atualizar nome:', error);
        showMessage('Erro ao atualizar nome', 'error');
    } else {
        showMessage('Nome atualizado com sucesso!', 'success');
        currentUser.name = newName;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

async function updatePassword() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showMessage('Usuário não autenticado', 'error');
        return;
    }

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword) {
        showMessage('Informe a senha atual', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showMessage('A senha deve ter pelo menos 6 caracteres', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showMessage('As senhas não coincidem', 'error');
        return;
    }

    // Consulta a senha atual no banco para validar
    const { data, error } = await supabase
        .from('usuarios')
        .select('password')
        .eq('id', currentUser.id)
        .single();

    if (error) {
        console.error('Erro ao consultar senha atual:', error);
        showMessage('Erro ao validar senha atual', 'error');
        return;
    }

    if (!data || data.password !== currentPassword) {
        showMessage('Senha atual incorreta', 'error');
        return;
    }

    // Atualiza a senha no banco
    const { error: updateError } = await supabase
        .from('usuarios')
        .update({ password: newPassword })
        .eq('id', currentUser.id);

    if (updateError) {
        console.error('Erro ao atualizar senha:', updateError);
        showMessage('Erro ao atualizar senha', 'error');
    } else {
        showMessage('Senha atualizada com sucesso!', 'success');
        currentUser.password = newPassword;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
