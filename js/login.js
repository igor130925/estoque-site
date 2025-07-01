import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const personCodeInput = document.getElementById('personCodeLogin');
  const passwordInput = document.getElementById('passwordLogin');
  const errorLogin = document.getElementById('errorLogin');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const personcode = personCodeInput.value.trim();
    const password = passwordInput.value;

    if (!personcode || !password) {
      errorLogin.textContent = 'Preencha todos os campos';
      return;
    }

    try {
      const { data: user, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('personcode', personcode)
        .eq('password', password)
        .maybeSingle();

      if (error || !user) {
        errorLogin.textContent = 'Código ou senha inválidos';
        return;
      }

      // Salvar usuário no localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));

      // Redirecionar para o painel de estoque
      window.location.href = 'estoque.html';
    } catch (err) {
      console.error(err);
      errorLogin.textContent = 'Erro ao fazer login.';
    }
  });
});
