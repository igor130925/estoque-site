import { supabase } from './supabaseClient.js'; // importa sua conexão Supabase

// Inicializar painel administrativo
async function initAdmin() {
    if (!checkAuth() || !isAdmin()) {
        window.location.href = 'index.html';
        return;
    }
    await loadDashboardData();
    setupEventListeners();
}

// Buscar estatísticas do sistema
async function getSystemStats() {
    const { count: totalProducts, error: err1 } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true });
    if (err1) throw err1;

    // Exemplo fixo, substitua por consulta real se houver tabela de usuários
    const totalUsers = 10;

    // Produtos com quantidade menor que 5
    const { count: lowStockProducts, error: err2 } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true })
        .lt('quantidade', 5);
    if (err2) throw err2;

    return { totalProducts, totalUsers, lowStockProducts };
}

// Buscar todos produtos
async function getProducts() {
    const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('nome', { ascending: true });
    if (error) throw error;
    return data;
}

// Realocar produto (atualizar quantidade)
async function relocateProduct(productId, { quantity, destination, reason }) {
    const { data: produto, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', productId)
        .single();
    if (error) throw error;

    const novaQuantidade = produto.quantidade - quantity;
    if (novaQuantidade < 0) throw new Error('Quantidade insuficiente para realocação');

    // Atualizar quantidade
    const { error: errUpdate } = await supabase
        .from('produtos')
        .update({ quantidade: novaQuantidade })
        .eq('id', productId);
    if (errUpdate) throw errUpdate;

    // Registrar movimentação
    const { error: errMov } = await supabase
        .from('movimentacoes')
        .insert([{
            data: new Date().toISOString(),
            produto_id: productId,
            tipo: 'Realocação',
            quantidade: quantity,
            destino: destination,
            responsavel: 'ADM001', // ALTERAÇÃO: colocar usuário logado depois
            motivo: reason
        }]);
    if (errMov) throw errMov;
}

// Carregar movimentações da tabela movimentacoes
async function loadMovements() {
    const { data, error } = await supabase
        .from('movimentacoes')
        .select(`
            data,
            tipo,
            quantidade,
            destino,
            responsavel,
            motivo,
            produtos:produto_id (nome)
        `)
        .order('data', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Erro ao carregar movimentações:', error);
        return;
    }

    const tbody = document.querySelector('#movementsTable tbody');
    tbody.innerHTML = '';

    data.forEach(move => {
        const date = new Date(move.data).toLocaleString('pt-BR');
        const productName = move.produtos ? move.produtos.nome : 'Produto removido';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${date}</td>
            <td>${productName}</td>
            <td>${move.tipo}</td>
            <td>${move.quantidade}</td>
            <td>${move.destino || '-'}</td>
            <td>${move.responsavel}</td>
            <td>${move.motivo || '-'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Configurar eventos
function setupEventListeners() {
    document.getElementById('relocateForm').addEventListener('submit', async e => {
        e.preventDefault();
        await handleRelocation();
    });
}

// Manipular realocação
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
        alert('Erro: ' + error.message);
    }
}

// Carregar dados do dashboard
async function loadDashboardData() {
    try {
        const stats = await getSystemStats();
        document.getElementById('totalProducts').textContent = stats.totalProducts;
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('lowStock').textContent = stats.lowStockProducts;

        const products = await getProducts();
        const select = document.getElementById('relocateProduct');
        select.innerHTML = '<option value="">Selecione um produto</option>';

        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.nome} (${product.quantidade} disponíveis)`;
            select.appendChild(option);
        });

        await loadMovements();

    } catch (error) {
        console.error('Erro ao carregar dados administrativos:', error);
        alert('Erro ao carregar dados do painel');
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('admin.html')) {
        initAdmin();
    }
});
