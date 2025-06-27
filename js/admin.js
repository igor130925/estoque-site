// Inicializar painel administrativo
async function initAdmin() {
    // Verificar autenticação e privilégios
    if (!checkAuth() || !isAdmin()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Carregar dados
    await loadDashboardData();
    
    // Configurar eventos
    setupEventListeners();
}

// Carregar dados do dashboard
async function loadDashboardData() {
    try {
        const stats = await getSystemStats();
        
        // Atualizar estatísticas
        document.getElementById('totalProducts').textContent = stats.totalProducts;
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('lowStock').textContent = stats.lowStockProducts;
        
        // Carregar produtos para realocação
        const products = await getProducts();
        const select = document.getElementById('relocateProduct');
        
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (${product.quantity} disponíveis)`;
            select.appendChild(option);
        });
        
        // Carregar movimentações
        await loadMovements();
        
    } catch (error) {
        console.error('Erro ao carregar dados administrativos:', error);
        alert('Erro ao carregar dados do painel');
    }
}

// Carregar movimentações
async function loadMovements() {
    try {
        // Simular dados (substituir por chamada real à API)
        const movements = [
            {
                date: '2023-05-20T14:30:00Z',
                product: 'Notebook Dell',
                type: 'Entrada',
                quantity: 10,
                responsible: 'ADM001'
            },
            {
                date: '2023-05-19T09:15:00Z',
                product: 'Smartphone Samsung',
                type: 'Saída',
                quantity: 5,
                responsible: 'ADM001'
            }
        ];
        
        const tbody = document.querySelector('#movementsTable tbody');
        tbody.innerHTML = '';
        
        movements.forEach(move => {
            const row = document.createElement('tr');
            const date = new Date(move.date).toLocaleString('pt-BR');
            
            row.innerHTML = `
                <td>${date}</td>
                <td>${move.product}</td>
                <td>${move.type}</td>
                <td>${move.quantity}</td>
                <td>${move.responsible}</td>
            `;
            
            tbody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Erro ao carregar movimentações:', error);
    }
}

// Configurar eventos
function setupEventListeners() {
    // Formulário de realocação
    document.getElementById('relocateForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleRelocation();
    });
}

// Manipular realocação de produtos
async function handleRelocation() {
    const form = document.getElementById('relocateForm');
    const productId = form.relocateProduct.value;
    const quantity = parseInt(form.relocateQuantity.value);
    const destination = form.relocateDestination.value;
    
    try {
        await relocateProduct(productId, {
            quantity,
            destination,
            reason: 'Realocação administrativa'
        });
        
        alert('Produto realocado com sucesso!');
        form.reset();
        await loadDashboardData();
        
    } catch (error) {
        console.error('Erro ao realocar produto:', error);
        alert('Erro ao realocar produto: ' + error.message);
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.endsWith('admin.html')) {
        initAdmin();
    }
});