document.addEventListener('DOMContentLoaded', function () {
  // Função para gerar código aleatório 6 dígitos alfanuméricos
  function generateRandomCode() {
    const chars = '1234567890';  
    
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

  // Gera código inicial no input
  personCodeInput.value = generateRandomCode();

  // Gerar novo código ao clicar no botão
  generateCodeBtn.addEventListener('click', function () {
    personCodeInput.value = generateRandomCode();
  });

  registerForm.addEventListener('submit', function (e) {
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

    if (!personCode.match(/^[A-Z0-9]{6}$/)) {
      errorMessage.textContent = 'Código pessoa inválido';
      return;
    }

    // Recupera usuários existentes ou inicia lista vazia
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Verifica se código já existe
    if (users.some((u) => u.personCode === personCode)) {
      errorMessage.textContent = 'Código Pessoa já cadastrado';
      return;
    }

    // Cria novo usuário com role padrão 'user'
    const newUser = {
      name,
      personCode,
      password,
      role: 'user',
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Simula criação de token e salva sessão
    const fakeToken = 'token-' + Math.random().toString(36).substr(2);
    localStorage.setItem('token', fakeToken);
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    // Redireciona para página produtos
    window.location.href = 'produtos.html';
  });
});
