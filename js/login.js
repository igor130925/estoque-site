import { supabase } from './supabaseClient.js';
import { ensureUserProfile } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const personCodeInput = document.getElementById('personCodeLogin');
  const passwordInput = document.getElementById('passwordLogin');
  const errorLogin = document.getElementById('errorLogin');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    errorLogin.textContent = ''; // limpa mensagem anterior

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

      if (error) {
        console.error('Erro Supabase:', error);
        errorLogin.textContent = 'Erro ao fazer login.';
        return;
      }

      if (!user) {
        errorLogin.textContent = 'Código ou senha inválidos';
        return;
      }

      // Debug: tipo e valor de autorizado
      console.log('Valor de autorizado:', user.autorizado, typeof user.autorizado);

      // Verifica autorização do usuário
      const autorizadoBool = user.autorizado === true || user.autorizado === 'true' || user.autorizado === 1;

      if (!autorizadoBool) {
        errorLogin.textContent = 'Usuário precisa ser autorizado por um administrador';
        return;
      }

      // Montar objeto com admin como booleano explicitamente
      const perfil = {
        id: user.id,
        name: user.name,
        personcode: user.personcode,
        admin: Boolean(user.admin),           // força booleano
        autorizado: autorizadoBool
      };

      // Salvar perfil no localStorage diretamente
      localStorage.setItem('currentUser', JSON.stringify(perfil));

      // Redirecionar para o painel principal (perfil, estoque, etc)
      window.location.href = 'perfil.html';

    } catch (err) {
      console.error(err);
      errorLogin.textContent = 'Erro ao fazer login.';
    }
  });
});
