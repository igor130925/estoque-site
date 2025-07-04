import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();

    document.getElementById('saveNameBtn').addEventListener('click', updateUserName);
    document.getElementById('changePasswordBtn').addEventListener('click', updatePassword);
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

// Mensagem flutuante no topo
function showSuccessMessage(text) {
    const successBox = document.createElement('div');
    successBox.className = 'success-message';
    successBox.innerHTML = `<i class="fas fa-check-circle"></i><span>${text}</span>`;
    document.body.appendChild(successBox);

    setTimeout(() => {
        successBox.style.opacity = '0';
        successBox.style.transform = 'translateX(-50%) translateY(-10px)';
        setTimeout(() => successBox.remove(), 500);
    }, 4000);
}

function showErrorMessage(text) {
    const errorBox = document.createElement('div');
    errorBox.className = 'success-message';
    errorBox.style.backgroundColor = '#dc3545'; // vermelho
    errorBox.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${text}</span>`;
    document.body.appendChild(errorBox);

    setTimeout(() => {
        errorBox.style.opacity = '0';
        errorBox.style.transform = 'translateX(-50%) translateY(-10px)';
        setTimeout(() => errorBox.remove(), 500);
    }, 4000);
}

function clearErrors() {
    document.querySelectorAll('.form-errors').forEach(div => {
        div.style.display = 'none';
        div.innerHTML = '';
    });
    document.querySelectorAll('.input-error').forEach(input => {
        input.classList.remove('input-error');
    });
}

function showFieldError(fieldId, messages) {
    const errorDiv = document.getElementById(fieldId + 'Errors');
    if (!errorDiv) return;

    errorDiv.style.display = 'block';
    errorDiv.innerHTML = messages.map(msg => `<div class="error-message">${msg}</div>`).join('');
    const input = document.getElementById(fieldId);
    if (input) input.classList.add('input-error');
}

function loadUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('userName').value = currentUser.name || '';
    document.getElementById('userCode').value = currentUser.personcode || '';
}

async function updateUserName() {
    clearErrors();

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showErrorMessage('Usuário não autenticado');
        return;
    }

    const newNameInput = document.getElementById('userName');
    const newName = newNameInput.value.trim();
    if (!newName) {
        showFieldError('userName', ['Por favor, insira um nome válido']);
        return;
    }

    const { error } = await supabase
        .from('usuarios')
        .update({ name: newName })
        .eq('id', currentUser.id);

    if (error) {
        console.error('Erro ao atualizar nome:', error);
        showErrorMessage('Erro ao atualizar nome');
    } else {
        showSuccessMessage('Nome atualizado com sucesso!');
        currentUser.name = newName;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

async function updatePassword() {
    clearErrors();

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showErrorMessage('Usuário não autenticado');
        return;
    }

    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    let hasError = false;

    if (!currentPasswordInput.value) {
        showFieldError('currentPassword', ['Informe a senha atual']);
        hasError = true;
    }
    if (newPasswordInput.value.length < 6) {
        showFieldError('newPassword', ['A senha deve ter pelo menos 6 caracteres']);
        hasError = true;
    }
    if (newPasswordInput.value !== confirmPasswordInput.value) {
        showFieldError('confirmPassword', ['As senhas não coincidem']);
        hasError = true;
    }

    if (hasError) return;

    const { data, error } = await supabase
        .from('usuarios')
        .select('password')
        .eq('id', currentUser.id)
        .single();

    if (error) {
        console.error('Erro ao consultar senha atual:', error);
        showErrorMessage('Erro ao validar senha atual');
        return;
    }

    if (!data || data.password !== currentPasswordInput.value) {
        showFieldError('currentPassword', ['Senha atual incorreta']);
        return;
    }

    const { error: updateError } = await supabase
        .from('usuarios')
        .update({ password: newPasswordInput.value })
        .eq('id', currentUser.id);

    if (updateError) {
        console.error('Erro ao atualizar senha:', updateError);
        showErrorMessage('Erro ao atualizar senha');
    } else {
        showSuccessMessage('Senha atualizada com sucesso!');
        currentUser.password = newPasswordInput.value;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        currentPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
