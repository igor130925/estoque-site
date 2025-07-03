import { supabase } from './supabaseClient.js';

// Faz upload de um arquivo para o bucket e retorna a URL pública
export async function uploadProductImage(file) {
  const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;

  const { data, error } = await supabase.storage
    .from('produtos-imagens')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) throw error;

  const { data: urlData, error: urlError } = supabase.storage
    .from('produtos-imagens')
    .getPublicUrl(fileName);

  if (urlError) throw urlError;

  return urlData.publicUrl;
}

// Busca todos os produtos, incluindo array de URLs das imagens
export async function getProducts() {
  const { data, error } = await supabase
    .from('produtos')
    .select(`id, nome, tipo, quantidade, data_validade, imagem_url`)
    .order('nome', { ascending: true });
  if (error) throw error;
  return data;
}

// Cria um produto, faz upload das imagens e registra movimentação "Criação"
export async function createProduct(productData, imageFiles) {
  let imagemUrls = [];

  if (imageFiles && imageFiles.length > 0) {
    for (const file of imageFiles) {
      const url = await uploadProductImage(file);
      imagemUrls.push(url);
    }
  }

  const { data, error } = await supabase
    .from('produtos')
    .insert([{
      ...productData,
      imagem_url: imagemUrls,
    }])
    .select();
  if (error) throw error;

  const produtoCriado = data[0];

  const { error: errMov } = await supabase
    .from('movimentacoes')
    .insert([{
      data: new Date().toISOString(),
      produto_id: produtoCriado.id,
      tipo: 'Criação',
      quantidade: produtoCriado.quantidade || 0,
      destino: 'Estoque',
      responsavel: productData.responsavel || 'ADM001',
      motivo: 'Cadastro de novo produto'
    }]);
  if (errMov) throw errMov;

  return data;
}

// Atualiza um produto
export async function updateProduct(id, productData) {
  const { data, error } = await supabase
    .from('produtos')
    .update(productData)
    .eq('id', id);
  if (error) throw error;
  return data;
}

// Deleta um produto
export async function deleteProduct(id) {
  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Realoca produto e registra movimentação "Realocação"
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

// Obtém estatísticas do sistema
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

// Busca movimentações com dados do produto relacionados
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

// Registrar movimentação detalhada
export async function registrarMovimentacaoDetalhada(movimentacao) {
  try {
    const { data, error } = await supabase
      .from('movimentacoes')
      .insert([movimentacao]);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao registrar movimentação:', error);
    throw error;
  }
}

// Registrar movimentação simples
export async function registrarMovimentacao(tipo, pagina, itemId, detalhes) {
  try {
    const usuario = JSON.parse(localStorage.getItem('currentUser'))?.personcode || 'Sistema';

    const { data, error } = await supabase
      .from('movimentacoes')
      .insert([{
        usuario,
        tipo,
        pagina,
        item_id: itemId,
        detalhes,
        data_hora: new Date().toISOString()
      }]);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao registrar movimentação:', error);
  }
}

// ✅ Corrigido: garante o perfil do usuário logado usando os campos reais
export function ensureUserProfile(user) {
  const userData = {
    id: user.id,
    personcode: user.personcode,
    name: user.name || 'Usuário',
  };
  localStorage.setItem('currentUser', JSON.stringify(userData));
}
