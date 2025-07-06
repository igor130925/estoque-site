import { supabase } from './supabaseClient.js';

function loadUserInfo() {
  const userName = localStorage.getItem('userName') || 'Usuário';
  const userNameDisplay = document.getElementById('userNameDisplay');
  const currentUserName = document.getElementById('currentUserName');
  if (userNameDisplay) userNameDisplay.textContent = userName;
  if (currentUserName) currentUserName.textContent = userName;
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

async function loadUsers() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, name, personcode, admin, autorizado');

  if (error) {
    console.error('Erro ao buscar usuários:', error.message);
    return;
  }

  const userList = document.getElementById('userList');
  userList.innerHTML = '';

  data.forEach(user => {
    const tr = document.createElement('tr');

    // Condicional: só exibe botões se não for admin
    let actionButtons = '';
    if (!user.admin) {
      actionButtons = `
        <button class="auth-btn" data-id="${user.id}" data-autorizado="${user.autorizado}">
          ${user.autorizado ? 'Remover Autorização' : 'Autorizar'}
        </button>
        <button class="delete-btn" data-id="${user.id}">
          Excluir
        </button>
      `;
    }

    tr.innerHTML = `
      <td>${user.name}</td>
      <td>${user.personcode}</td>
      <td>${user.admin ? 'Sim' : 'Não'}</td>
      <td>${user.autorizado ? 'Sim' : 'Não'}</td>
      <td>${actionButtons}</td>
    `;

    userList.appendChild(tr);
  });

  addEventListeners();
}

function addEventListeners() {
  document.querySelectorAll('.auth-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const userId = btn.dataset.id;

      const { data: userData, error: fetchError } = await supabase
        .from('usuarios')
        .select('admin, autorizado')
        .eq('id', userId)
        .single();

      if (fetchError || !userData) {
        alert('Erro ao verificar usuário');
        return;
      }

      if (userData.admin) {
        alert('Não é permitido alterar a autorização de um administrador.');
        return;
      }

      const novoStatus = !userData.autorizado;

      const { error } = await supabase
        .from('usuarios')
        .update({ autorizado: novoStatus })
        .eq('id', userId);

      if (error) {
        alert('Erro ao atualizar autorização');
        return;
      }

      loadUsers();
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const userId = btn.dataset.id;

      const { data: userData, error: fetchError } = await supabase
        .from('usuarios')
        .select('admin')
        .eq('id', userId)
        .single();

      if (fetchError || !userData) {
        alert('Erro ao verificar usuário');
        return;
      }

      if (userData.admin) {
        alert('Não é permitido excluir um administrador.');
        return;
      }

      const confirmDelete = confirm('Tem certeza que deseja excluir este usuário?');
      if (!confirmDelete) return;

      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId);

      if (error) {
        alert('Erro ao excluir usuário');
        return;
      }

      loadUsers();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadUserInfo();
  loadUsers();

  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenu = document.getElementById('closeMenu');
  const logoutBtn = document.getElementById('logoutBtn');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      mobileMenu.removeAttribute('hidden');
      mobileMenu.setAttribute('aria-hidden', 'false');
    });
  }

  if (closeMenu && mobileMenu) {
    closeMenu.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      mobileMenu.setAttribute('hidden', '');
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
});
