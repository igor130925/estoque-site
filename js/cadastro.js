import { supabase } from './supabaseClient.js';

// Função para gerar código pessoa único
async function generateUniquePersonCode() {
  const chars = '0123456789';
  let code;
  let exists = true;

  while (exists) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select('personcode')
      .eq('personcode', code)
      .maybeSingle();

    if (error && ![406, 404].includes(error.status)) {
      console.error('Erro ao verificar código:', error);
      throw error;
    }

    exists = !!data;
  }

  return code;
}

document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateCode');
  const personCodeInput = document.getElementById('personcode');
  const errorMessage = document.getElementById('errorMessage');

  (async () => {
    try {
      const code = await generateUniquePersonCode();
      personCodeInput.value = code;
    } catch (err) {
      console.error('Erro ao gerar código inicial:', err);
    }
  })();

  generateBtn.addEventListener('click', async () => {
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
    try {
      const code = await generateUniquePersonCode();
      personCodeInput.value = code;
      errorMessage.textContent = '';
    } catch (err) {
      errorMessage.textContent = 'Erro ao gerar código: ' + err.message;
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Gerar';
    }
  });

  const registerForm = document.getElementById('registerForm');
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const personcode = personCodeInput.value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!name || !personcode || !password || !confirmPassword) {
      errorMessage.textContent = 'Todos os campos são obrigatórios';
      return;
    }

    if (password.length < 6) {
      errorMessage.textContent = 'Senha deve ter no mínimo 6 caracteres';
      return;
    }

    if (password !== confirmPassword) {
      errorMessage.textContent = 'Senhas não conferem';
      return;
    }

    try {
      const { error } = await supabase.from('usuarios').insert([
        { name, personcode, password, role: 'user' },
      ]);

      if (error) throw error;

      // Salvar usuário no localStorage
      localStorage.setItem('currentUser', JSON.stringify({ name, personcode }));

      // Redirecionar para a tela de estoque
      window.location.href = 'estoque.html';
    } catch (err) {
      errorMessage.textContent = 'Erro ao cadastrar: ' + err.message;
    }
  });
});
