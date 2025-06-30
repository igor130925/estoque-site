// js/api.js
import { supabase } from './supabaseClient.js';

// Produtos

export async function getProducts() {
    const { data, error } = await supabase
        .from('produtos')
        .select(`id, nome, tipo, quantidade, data_validade`) // selecione só os campos que usa
        .order('nome', { ascending: true });
    if (error) throw error;
    return data;
}

// restante do código permanece igual...

export async function createProduct(productData) {
    const { data, error } = await supabase
        .from('produtos')
        .insert([productData]);
    if (error) throw error;
    return data;
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

// Outras funções continuam iguais...

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

export async function getSystemStats() {
    const { count: totalProducts, error: err1 } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true });
    if (err1) throw err1;

    const totalUsers = 10;

    const { count: lowStockProducts, error: err2 } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true })
        .lt('quantidade', 5);
    if (err2) throw err2;

    return { totalProducts, totalUsers, lowStockProducts };
}

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
