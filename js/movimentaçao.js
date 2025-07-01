import { getMovements } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  await carregarMovimentacoes();

  document.getElementById('btn-filtrar').addEventListener('click', carregarMovimentacoes);
});

async function carregarMovimentacoes() {
  try {
    const movimentos = await getMovements();

    // Pegando valores dos filtros
    const dataInicioStr = document.getElementById('data-inicio').value;
    const dataFimStr = document.getElementById('data-fim').value;
    const tipoFiltro = document.getElementById('tipo').value;
    const buscaTexto = document.getElementById('busca-texto').value.toLowerCase();

    // Converter strings de data para objetos Date (se preenchidos)
    const dataInicio = dataInicioStr ? new Date(dataInicioStr) : null;
    const dataFim = dataFimStr ? new Date(dataFimStr) : null;

    // Filtrar os movimentos de acordo com os filtros da UI
    const filtrados = movimentos.filter(mov => {
      // Filtra pelo tipo escolhido, se "todos" filtra só Edição
      if (tipoFiltro === 'todos' && mov.tipo !== 'Edição') return false;
      if (tipoFiltro !== 'todos' && mov.tipo !== tipoFiltro) return false;

      // Filtra por data início e fim
      if (dataInicio || dataFim) {
        const dataMov = mov.data ? new Date(mov.data) : null;
        if (!dataMov) return false;
        if (dataInicio && dataMov < dataInicio) return false;
        if (dataFim && dataMov > dataFim) return false;
      }

      // Filtrar por busca de texto em vários campos
      if (buscaTexto) {
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
      }

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
