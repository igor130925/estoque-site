import { supabase } from './supabaseClient.js';

// Função para salvar no localStorage o perfil do usuário com o campo admin garantido booleano
export function ensureUserProfile(user) {
  const profile = {
    id: user.id,
    name: user.name,
    personcode: user.personcode,
    admin: user.admin === true || user.admin === 'true',       // Força booleano
    autorizado: user.autorizado === true || user.autorizado === 'true'
  };
  console.log('Salvando perfil no localStorage:', profile);
  localStorage.setItem('currentUser', JSON.stringify(profile));
}

document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();

  document.getElementById('saveNameBtn').addEventListener('click', updateUserName);
  document.getElementById('changePasswordBtn').addEventListener('click', updatePassword);
  document.getElementById('logoutBtn').addEventListener('click', logout);
});

// Função para carregar dados e mostrar botão admin
function loadUserProfile() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  console.log('Usuário carregado do localStorage:', currentUser);

  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  // Preencher os campos
  document.getElementById('userName').value = currentUser.name || '';
  document.getElementById('userCode').value = currentUser.personcode || '';

  const adminBtn = document.getElementById('adminPanelBtn');

  if (adminBtn) {
    if (currentUser.admin) {
      adminBtn.style.display = 'inline-block'; // mostrar botão
      adminBtn.onclick = () => window.location.href = 'admin.html';
    } else {
      adminBtn.style.display = 'none';
      adminBtn.onclick = null;
    }
  }
}

// Atualiza nome do usuário no Supabase e localStorage
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

// Atualiza senha do usuário
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

// Funções para mensagens e erros (copie do seu código original, aqui exemplo rápido)
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
  errorBox.style.backgroundColor = '#dc3545';
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

// Logout simples
function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}
