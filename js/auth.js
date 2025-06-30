// auth.js

// Gerar código pessoa aleatório de 6 dígitos alfanuméricos
function generatePersonCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Verificar autenticação e redirecionar se necessário
function checkAuth() {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname.split('/').pop();

    // Páginas públicas que não exigem login
    const publicPages = ['index.html', 'cadastro.html'];

    // Se não autenticado e página não pública, redireciona para login
    if (!token && !publicPages.includes(currentPage)) {
        window.location.href = 'index.html';
        return false;
    }

    // Se autenticado e está na página login, redireciona conforme role
    if (token && currentPage === 'index.html') {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user && user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'produtos.html';
        }
        return false;
    }

    return true;
}

// Verifica se usuário é admin
function isAdmin() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user && user.role === 'admin';
}

// Configura botão logout (presente em páginas protegidas)
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', e => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
}

// Inicializa autenticação e configurações gerais ao carregar DOM
function initAuth() {
    checkAuth();
    setupLogout();

    // Preenche nome e código do usuário na interface (se houver elementos)
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        document.querySelectorAll('#userNameDisplay, #currentUserName').forEach(el => {
            el.textContent = user.name;
        });
        const userCodeDisplay = document.getElementById('userCodeDisplay');
        if (userCodeDisplay) {
            userCodeDisplay.textContent = user.personCode || user.code || '';
        }
    }
}

// Função de login simulada
async function login(personCode, password) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Busca usuários no localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.personCode === personCode && u.password === password);

    if (!user) {
        throw new Error('Credenciais inválidas');
    }

    // Gera token falso e salva sessão
    const token = `fake-jwt-token-${Math.random().toString(36).substr(2)}`;
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));

    return user;
}

// Função para registrar novo usuário
async function register(userData) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let users = JSON.parse(localStorage.getItem('users') || '[]');

    // Verifica se código pessoa já existe
    if (users.some(u => u.personCode === userData.personCode)) {
        throw new Error('Código Pessoa já cadastrado');
    }

    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));

    // Cria token e salva sessão
    const token = `fake-jwt-token-${Math.random().toString(36).substr(2)}`;
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(userData));

    return userData;
}

// Exporta funções
export {
    generatePersonCode,
    checkAuth,
    isAdmin,
    setupLogout,
    initAuth,
    login,
    register,
};
