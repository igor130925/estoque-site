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

    tr.innerHTML = `
      <td>${user.name}</td>
      <td>${user.personcode}</td>
      <td>${user.admin ? 'Sim' : 'Não'}</td>
      <td>${user.autorizado ? 'Sim' : 'Não'}</td>
      <td>
        <button class="auth-btn" data-id="${user.id}" data-autorizado="${user.autorizado}">
          ${user.autorizado ? 'Remover Autorização' : 'Autorizar'}
        </button>
        <button class="delete-btn" data-id="${user.id}">Excluir</button>
      </td>
    `;

    userList.appendChild(tr);
  });

  addEventListeners();
}

function addEventListeners() {
  document.querySelectorAll('.auth-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const userId = btn.dataset.id;
      const autorizadoAtual = btn.dataset.autorizado === 'true';

      const { error } = await supabase
        .from('usuarios')
        .update({ autorizado: !autorizadoAtual })
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
