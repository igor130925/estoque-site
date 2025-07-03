import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    loadUserProfile();

    document.getElementById('saveNameBtn').addEventListener('click', updateUserName);
    document.getElementById('changePasswordBtn').addEventListener('click', updatePassword);
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

function loadUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html'; // redireciona se não estiver logado
        return;
    }

    // Preenche os campos
    document.getElementById('userName').value = currentUser.name;
    document.getElementById('userCode').value = currentUser.personcode;
}

async function updateUserName() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Usuário não autenticado');
        return;
    }

    const newName = document.getElementById('userName').value.trim();
    if (!newName) {
        alert('Por favor, insira um nome válido');
        return;
    }

    const { error } = await supabase
        .from('usuarios')
        .update({ name: newName })
        .eq('id', currentUser.id);

    if (error) {
        console.error('Erro ao atualizar nome:', error);
        alert('Erro ao atualizar nome');
    } else {
        alert('Nome atualizado com sucesso!');
        currentUser.name = newName;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

async function updatePassword() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Usuário não autenticado');
        return;
    }

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

    if (currentPassword !== currentUser.password) {
        alert('Senha atual incorreta');
        return;
    }

    const { error } = await supabase
        .from('usuarios')
        .update({ password: newPassword })
        .eq('id', currentUser.id);

    if (error) {
        console.error('Erro ao atualizar senha:', error);
        alert('Erro ao atualizar senha');
    } else {
        alert('Senha atualizada com sucesso!');
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
