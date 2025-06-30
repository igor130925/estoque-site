// estoque.js
import { getProducts, updateProduct } from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticação
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('currentUser').textContent = currentUser.name;

    let estoque = [];
    let historicoRetiradas = [];

    const tabelaEstoque = document.getElementById('tabelaEstoque').getElementsByTagName('tbody')[0];
    const filtroBusca = document.getElementById('filtroBusca');
    const filtroCategoria = document.getElementById('filtroCategoria');
    const modal = document.getElementById('modalRetirada');
    const closeBtn = document.querySelector('.close-btn');
    const formRetirada = document.getElementById('formRetirada');

    // Carregar produtos do Supabase
    async function carregarEstoque() {
        try {
            estoque = await getProducts();
            console.log('Produtos carregados:', estoque);

            if (!Array.isArray(estoque) || estoque.length === 0) {
                console.warn('Nenhum produto encontrado no estoque');
            }
            aplicarFiltros();
        } catch (error) {
            alert('Erro ao carregar estoque: ' + error.message);
            console.error(error);
        }
    }

    // Aplica filtros e atualiza tabela
    function aplicarFiltros() {
        const filtroTexto = filtroBusca.value.toLowerCase();
        const filtroCat = filtroCategoria.value;

        tabelaEstoque.innerHTML = '';

        estoque.filter(item => {
            const textoMatch = item.nome.toLowerCase().includes(filtroTexto);
            const categoriaMatch = !filtroCat || item.tipo === filtroCat;
            return textoMatch && categoriaMatch;
        }).forEach(item => {
            const row = tabelaEstoque.insertRow();
            const icon = getCategoryIcon(item.tipo);
            const validadeFormatada = item.data_validade ? new Date(item.data_validade).toLocaleDateString('pt-BR') : '-';

            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.nome}</td>
                <td><span class="category">${icon} ${formatCategory(item.tipo)}</span></td>
                <td>${item.quantidade}</td>
                <td>${validadeFormatada}</td>
                <td>
                    <button class="btn primary btn-sm retirar-btn" data-id="${item.id}">
                        <i class="fas fa-minus-circle"></i> Retirar
                    </button>
                </td>
            `;
        });

        document.querySelectorAll('.retirar-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                abrirModalRetirada(this.dataset.id);
            });
        });
    }

    function abrirModalRetirada(itemId) {
        const item = estoque.find(i => i.id == itemId);
        if (!item) return;

        document.getElementById('itemId').value = item.id;
        document.getElementById('itemNome').value = item.nome;
        document.getElementById('quantidadeDisponivel').value = item.quantidade;
        document.getElementById('quantidadeRetirada').max = item.quantidade;
        document.getElementById('quantidadeRetirada').value = 1;
        document.getElementById('responsavel').value = '';
        document.getElementById('observacao').value = '';
        modal.style.display = 'block';
        modal.removeAttribute('hidden');
    }

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        modal.setAttribute('hidden', 'true');
    });

    window.addEventListener('click', e => {
        if (e.target == modal) {
            modal.style.display = 'none';
            modal.setAttribute('hidden', 'true');
        }
    });

    formRetirada.addEventListener('submit', async e => {
        e.preventDefault();
        const id = document.getElementById('itemId').value;
        const nome = document.getElementById('itemNome').value;
        const disponivel = parseInt(document.getElementById('quantidadeDisponivel').value);
        const retirada = parseInt(document.getElementById('quantidadeRetirada').value);
        const responsavel = document.getElementById('responsavel').value.trim();
        const observacao = document.getElementById('observacao').value.trim();

        if (retirada <= 0 || retirada > disponivel) {
            alert('Quantidade inválida para retirada.');
            return;
        }

        if (!responsavel) {
            alert('Informe o responsável pela retirada.');
            return;
        }

        try {
            const itemIndex = estoque.findIndex(i => i.id == id);
            if (itemIndex === -1) throw new Error('Produto não encontrado');

            // Atualizar quantidade no Supabase
            const novaQtd = estoque[itemIndex].quantidade - retirada;
            await updateProduct(id, { quantidade: novaQtd });

            // Atualiza localmente para refletir mudança
            estoque[itemIndex].quantidade = novaQtd;

            // Adicionar ao histórico
            historicoRetiradas.push({
                id,
                nome,
                quantidade: retirada,
                responsavel,
                observacao,
                data: new Date().toLocaleString('pt-BR')
            });

            alert('Retirada realizada com sucesso!');
            modal.style.display = 'none';
            modal.setAttribute('hidden', 'true');
            aplicarFiltros();

        } catch (error) {
            alert('Erro ao registrar retirada: ' + error.message);
        }
    });

    function formatCategory(tipo) {
        switch (tipo) {
            case 'perecivel': return 'Perecível';
            case 'roupa': return 'Roupa';
            case 'eletronico': return 'Eletrônico';
            case 'moveis': return 'Móveis';
            case 'ferramentas': return 'Ferramentas';
            default: return tipo;
        }
    }

    function getCategoryIcon(tipo) {
        switch (tipo) {
            case 'perecivel': return '🍎';
            case 'roupa': return '👕';
            case 'eletronico': return '📱';
            case 'moveis': return '🛋️';
            case 'ferramentas': return '🔧';
            default: return '❓';
        }
    }

    filtroBusca.addEventListener('input', aplicarFiltros);
    filtroCategoria.addEventListener('change', aplicarFiltros);

    await carregarEstoque();
});
