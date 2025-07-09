import { getMovements } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const inputBusca = document.getElementById('busca-texto');
  inputBusca.addEventListener('input', carregarMovimentacoes);

  // Controle do menu mobile
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenu = document.getElementById('closeMenu');

  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.add('open');
  });

  closeMenu.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });

  carregarMovimentacoes(); // Carrega inicialmente
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

      return (
        nomeProduto.includes(buscaTexto) ||
        motivo.includes(buscaTexto) ||
        responsavel.includes(buscaTexto) ||
        destino.includes(buscaTexto)
      );
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
    const dataFormatada = mov.data ? formatarData(mov.data) : '-';
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

// Função auxiliar para formatar a data subtraindo 3h e ocultando os segundos
function formatarData(dataISO) {
  const data = new Date(dataISO);
  data.setHours(data.getHours() - 3); // Subtrai 3 horas

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();

  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');

  return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}
