// js/api.js
import { supabase } from './supabaseClient.js';

// Produtos

export async function getProducts() {
    const { data, error } = await supabase
        .from('produtos')
        .select(`id, nome, tipo, quantidade, data_validade`)
        .order('nome', { ascending: true });

    if (error) throw error;
    return data;
}

export async function createProduct(productData) {
    // Primeiro, insere o produto
    const { data: inserted, error } = await supabase
        .from('produtos')
        .insert([productData])
        .select(); // pega o ID retornado

    if (error) throw error;

    const produtoCriado = inserted[0];

    // Agora, registra a movimentação de criação
    const { error: movimentoError } = await supabase
        .from('movimentacoes')
        .insert([{
            data: new Date().toISOString(),
            produto_id: produtoCriado.id,
            tipo: 'Criação',
            quantidade: produtoCriado.quantidade,
            destino: 'Cadastro Inicial',
            responsavel: 'Sistema',
            motivo: 'Produto criado no sistema'
        }]);

    if (movimentoError) throw movimentoError;

    return inserted;
}

export async function updateProduct(id, productData) {
    const { data, error } = await supabase
        .from('produtos')
        .update(productData)
        .eq('id', id);
    if (error) throw error;
    return data;
}

export async function deleteProduct(id) {
    const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

export async function relocateProduct(productId, data) {
    const { data: produto, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', productId)
        .single();

    if (error) throw error;

    const novaQuantidade = produto.quantidade - data.quantity;
    if (novaQuantidade < 0) throw new Error('Quantidade insuficiente para realocação');

    const { error: errUpdate } = await supabase
        .from('produtos')
        .update({ quantidade: novaQuantidade })
        .eq('id', productId);

    if (errUpdate) throw errUpdate;

    const { error: errMov } = await supabase
        .from('movimentacoes')
        .insert([{
            data: new Date().toISOString(),
            produto_id: productId,
            tipo: 'Realocação',
            quantidade: data.quantity,
            destino: data.destination,
            responsavel: data.responsavel || 'ADM001',
            motivo: data.reason || ''
        }]);

    if (errMov) throw errMov;

    return true;
}

// Estatísticas do sistema
export async function getSystemStats() {
    const { count: totalProducts, error: err1 } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true });
    if (err1) throw err1;

    const totalUsers = 10; // valor fixo como exemplo

    const { count: lowStockProducts, error: err2 } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true })
        .lt('quantidade', 5);
    if (err2) throw err2;

    return { totalProducts, totalUsers, lowStockProducts };
}

// Movimentações
export async function getMovements() {
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

    if (error) throw error;
    return data;
}
