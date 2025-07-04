// js/admin.js

// Função para carregar dados do usuário logado no UI
function loadUserInfo() {
  const userName = localStorage.getItem('userName') || 'Usuário';

  const userNameDisplay = document.getElementById('userNameDisplay');
  const currentUserName = document.getElementById('currentUserName');

  if (userNameDisplay) userNameDisplay.textContent = userName;
  if (currentUserName) currentUserName.textContent = userName;
}

// Função de logout
function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  // Menu mobile funcional com .open
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenu = document.getElementById('closeMenu');

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

  // Exibir nome do usuário
  loadUserInfo();

  // Botão de logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
});
