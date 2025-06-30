import { supabase } from '../supabaseClient.js'; // ajuste o caminho conforme seu projeto

// Função para gerar código pessoa único (6 caracteres)
async function generateUniquePersonCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  let exists = true;

  while (exists) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    console.log('Código gerado:', code);

    const { data, error } = await supabase
      .from('usuarios')
      .select('personCode')
      .eq('personCode', code)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = Not found (tudo bem se não encontrar)
      console.error('Erro ao consultar código no banco:', error);
      throw error;
    }

    exists = !!data; // se data existe, código já está em uso, repete
  }
  return code;
}

document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateCode');
  const personCodeInput = document.getElementById('personCode');
  const errorMessage = document.getElementById('errorMessage');

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

  // Aqui você pode adicionar o submit do formulário para cadastrar no Supabase, se quiser
  // Exemplo simples:
  const registerForm = document.getElementById('registerForm');
  registerForm.addEventListener('submit', async e => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const personCode = personCodeInput.value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!name || !personCode || !password || !confirmPassword) {
      errorMessage.textContent = 'Preencha todos os campos.';
      return;
    }

    if (password.length < 6) {
      errorMessage.textContent = 'Senha deve ter no mínimo 6 caracteres.';
      return;
    }

    if (password !== confirmPassword) {
      errorMessage.textContent = 'Senhas não conferem.';
      return;
    }

    // Tenta cadastrar no Supabase
    const { data, error } = await supabase.from('usuarios').insert([
      { name, personCode, password, role: 'user' } // ajuste os campos conforme seu banco
    ]);

    if (error) {
      errorMessage.textContent = 'Erro ao cadastrar: ' + error.message;
      return;
    }

    alert('Cadastro realizado com sucesso!');
    window.location.href = 'index.html'; // redireciona para login
  });
});
