// Gerar código pessoa aleatório de 6 dígitos alfanuméricos
function generatePersonCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Verificar autenticação
function checkAuth() {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname.split('/').pop();
    
    // Páginas que não requerem autenticação
    const publicPages = ['index.html'];
    
    // Se não está autenticado e não está em página pública
    if (!token && !publicPages.includes(currentPage)) {
        window.location.href = 'index.html';
        return false;
    }
    
    // Se está autenticado e está na página de login
    if (token && currentPage === 'index.html') {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'produtos.html';
        }
        return false;
    }
    
    return true;
}

// Verificar se usuário é admin
function isAdmin() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user && user.role === 'admin';
}

// Configurar logout
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
}

// Inicializar autenticação
function initAuth() {
    checkAuth();
    setupLogout();
    
    // Preencher informações do usuário se estiver logado
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        document.querySelectorAll('#userNameDisplay, #currentUserName').forEach(el => {
            el.textContent = user.name;
        });
        
        if (document.getElementById('userCodeDisplay')) {
            document.getElementById('userCodeDisplay').textContent = user.code;
        }
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initAuth);// Função para gerar código pessoa
function generatePersonCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Verificar autenticação
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token && !window.location.pathname.includes('index.html')) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Função de login simulada
async function login(email, password) {
    // Simular chamada à API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar no localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        throw new Error('Credenciais inválidas');
    }
    
    // Simular token
    const token = `fake-jwt-token-${Math.random().toString(36).substr(2)}`;
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return user;
}

// Função de logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Exportar funções
export {
    generatePersonCode,
    checkAuth,
    login,
    logout
};