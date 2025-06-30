document.addEventListener('DOMContentLoaded', function () {
  // Use o mesmo charset do auth.js para gerar código compatível
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function generateRandomCode() {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  const registerForm = document.getElementById('registerForm');
  const personCodeInput = document.getElementById('personCode');
  const generateCodeBtn = document.getElementById('generateCode');
  const errorMessage = document.getElementById('errorMessage');

  // Preenche o campo com código aleatório ao carregar a página
  personCodeInput.value = generateRandomCode();

  // Regera código ao clicar no botão "Gerar"
  generateCodeBtn.addEventListener('click', function () {
    personCodeInput.value = generateRandomCode();
  });

  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    errorMessage.textContent = '';

    const name = document.getElementById('name').value.trim();
    const personCode = personCodeInput.value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!name || !personCode || !password || !confirmPassword) {
      errorMessage.textContent = 'Todos os campos são obrigatórios';
      return;
    }

    if (password !== confirmPassword) {
      errorMessage.textContent = 'As senhas não coincidem';
      return;
    }

    if (password.length < 6) {
      errorMessage.textContent = 'A senha deve ter no mínimo 6 caracteres';
      return;
    }

    if (!personCode.match(/^[A-Z2-9]{6}$/)) {
      // Regex para letras A-Z (menos I,O,Q) e números 2-9, 6 chars
      errorMessage.textContent = 'Código pessoa inválido';
      return;
    }

    // Aqui pode chamar sua função register() que usa Supabase, ex:
    try {
      // import { register } from './auth.js' - tem que importar no topo do arquivo cadastro.js
      await register({ name, personCode, password, role: 'user' });
      window.location.href = 'produtos.html';
    } catch (err) {
      errorMessage.textContent = err.message;
    }
  });
});
