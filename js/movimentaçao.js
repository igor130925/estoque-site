// js/movimentacao.js
import { getMovements } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const inputBusca = document.getElementById('busca-texto');
  inputBusca.addEventListener('input', carregarMovimentacoes);

  await carregarMovimentacoes(); // Carrega inicialmente
});

async function carregarMovimentacoes() {
  try {
    const movimentos = await getMovements();

    const buscaTexto = document.getElementById('busca-texto').value.toLowerCase();

    const filtrados = movimentos.filter(mov => {
      const nomeProduto = mov.produtos?.nome?.toLowerCase() || '';
      const motivo = mov.motivo?.toLowerCase() || '';
      const responsavel = mov.responsavel?.toLowerCase() || '';
      const destino = mov.destino?.toLowerCase() || '';

      if (
        !nomeProduto.includes(buscaTexto) &&
        !motivo.includes(buscaTexto) &&
        !responsavel.includes(buscaTexto) &&
        !destino.includes(buscaTexto)
      ) return false;

      return true;
    });

    preencherTabela(filtrados);
  } catch (error) {
    console.error('Erro ao carregar movimentações:', error);
    alert('Erro ao carregar movimentações');
  }
}

function preencherTabela(movimentacoes) {
  const tbody = document.getElementById('corpo-tabela');
  tbody.innerHTML = '';

  movimentacoes.forEach(mov => {
    const dataFormatada = mov.data ? new Date(mov.data).toLocaleString('pt-BR') : '-';
    const nomeProduto = mov.produtos?.nome || '-';
    const tipo = mov.tipo || '-';
    const quantidade = mov.quantidade != null ? mov.quantidade : '-';
    const destino = mov.destino || '-';
    const responsavel = mov.responsavel || '-';
    const motivo = mov.motivo || '-';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${dataFormatada}</td>
      <td>${nomeProduto}</td>
      <td>${tipo}</td>
      <td>${quantidade}</td>
      <td>${destino}</td>
      <td>${responsavel}</td>
      <td>${motivo}</td>
    `;
    tbody.appendChild(tr);
  });
}
