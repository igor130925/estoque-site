document.addEventListener('DOMContentLoaded', function() {
    // Gerar código aleatório de 6 dígitos
    function generateRandomCode() {
        const chars = '123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // Elementos do formulário
    const registerForm = document.getElementById('registerForm');
    const personCodeInput = document.getElementById('personCode');
    const generateCodeBtn = document.getElementById('generateCode');
    const errorMessage = document.getElementById('errorMessage');

    // Gerar código inicial
    personCodeInput.value = generateRandomCode();

    // Gerar novo código
    generateCodeBtn.addEventListener('click', function() {
        personCodeInput.value = generateRandomCode();
    });

    // Validar formulário
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        errorMessage.textContent = '';

        // Obter valores
        const name = document.getElementById('name').value.trim();
        const personCode = personCodeInput.value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validações
        if (!name || !email || !personCode || !password || !confirmPassword) {
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

        // Dados do usuário
        const userData = {
            name,
            email,
            personCode,
            password,
            role: 'user' // Padrão para usuários comuns
        };

        try {
            // Chamada à API (simulada)
            const response = await registerUser(userData);
            
            // Redirecionar após cadastro
            window.location.href = 'produtos.html';
            
        } catch (error) {
            console.error('Erro no cadastro:', error);
            errorMessage.textContent = error.message || 'Erro ao cadastrar usuário';
        }
    });

    // Função simulada de registro na API
    async function registerUser(userData) {
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simular erro se e-mail já existe
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(u => u.email === userData.email)) {
            throw new Error('E-mail já cadastrado');
        }
        
        // Adicionar usuário
        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Simular resposta da API
        return {
            success: true,
            user: userData
        };
    }
});