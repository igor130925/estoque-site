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
    showErrorMessage('Erro ao buscar usuários: ' + error.message);
    return;
  }

  const userList = document.getElementById('userList');
  userList.innerHTML = '';

  data.forEach(user => {
    const tr = document.createElement('tr');

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
        showErrorMessage('Erro ao verificar usuário');
        return;
      }

      if (userData.admin) {
        showErrorMessage('Não é permitido alterar a autorização de um administrador.');
        return;
      }

      const novoStatus = !userData.autorizado;

      const { error } = await supabase
        .from('usuarios')
        .update({ autorizado: novoStatus })
        .eq('id', userId);

      if (error) {
        showErrorMessage('Erro ao atualizar autorização');
        return;
      }

      showSuccessMessage(novoStatus ? 'Usuário autorizado com sucesso!' : 'Autorização removida com sucesso!');
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
        showErrorMessage('Erro ao verificar usuário');
        return;
      }

      if (userData.admin) {
        showErrorMessage('Não é permitido excluir um administrador.');
        return;
      }

      showConfirmationDialog('Tem certeza que deseja excluir este usuário?', async () => {
        const { error } = await supabase
          .from('usuarios')
          .delete()
          .eq('id', userId);

        if (error) {
          showErrorMessage('Erro ao excluir usuário');
          return;
        }

        showSuccessMessage('Usuário excluído com sucesso!');
        loadUsers();
      });
    });
  });
}

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

function showConfirmationDialog(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'confirmation-modal';
  modal.innerHTML = `
    <p>${message}</p>
    <div class="modal-actions">
      <button class="modal-cancel">Cancelar</button>
      <button class="modal-confirm">Excluir</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.querySelector('.modal-cancel').addEventListener('click', () => {
    overlay.remove();
  });

  overlay.querySelector('.modal-confirm').addEventListener('click', () => {
    overlay.remove();
    if (typeof onConfirm === 'function') onConfirm();
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
