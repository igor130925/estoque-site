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
            aplicarFiltros();
        } catch (error) {
            alert('Erro ao carregar estoque: ' + error.message);
        }
    }

    // Aplica filtros e atualiza tabela
    function aplicarFiltros() {
        const filtroTexto = filtroBusca.value.toLowerCase();
        const filtroCat = filtroCategoria.value;

        tabelaEstoque.innerHTML = '';

        estoque.filter(item => {
            const textoMatch = item.nome.toLowerCase().includes(filtroTexto) ||
                               (item.codigo ? item.codigo.toLowerCase().includes(filtroTexto) : false);
            const categoriaMatch = !filtroCat || item.tipo === filtroCat;
            return textoMatch && categoriaMatch;
        }).forEach(item => {
            const row = tabelaEstoque.insertRow();
            const icon = getCategoryIcon(item.tipo);

            row.innerHTML = `
                <td>${item.codigo || ''}</td>
                <td>${item.nome}</td>
                <td><span class="category">${icon} ${formatCategory(item.tipo)}</span></td>
                <td>${item.quantidade}</td>
                <td>${item.localizacao || '-'}</td>
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
        document.getElementById('motivoRetirada').value = '';
        modal.style.display = 'block';
    }

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', e => {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    });

    formRetirada.addEventListener('submit', async e => {
        e.preventDefault();
        const id = document.getElementById('itemId').value;
        const nome = document.getElementById('itemNome').value;
        const disponivel = parseInt(document.getElementById('quantidadeDisponivel').value);
        const retirada = parseInt(document.getElementById('quantidadeRetirada').value);
        const motivo = document.getElementById('motivoRetirada').value.trim();

        if (retirada <= 0 || retirada > disponivel) {
            alert('Quantidade inválida para retirada.');
            return;
        }

        if (!motivo) {
            alert('Informe o motivo da retirada.');
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
                motivo,
                data: new Date().toLocaleString('pt-BR')
            });

            alert('Retirada realizada com sucesso!');
            modal.style.display = 'none';
            aplicarFiltros();

        } catch (error) {
            alert('Erro ao registrar retirada: ' + error.message);
        }
    });

    function formatCategory(tipo) {
        switch (tipo) {
            case 'perecivel': return 'Perecível';
            case 'limpeza': return 'Limpeza';
            case 'escritorio': return 'Escritório';
            case 'informatica': return 'Informática';
            case 'outros': return 'Outros';
            default: return tipo;
        }
    }

    function getCategoryIcon(tipo) {
        switch (tipo) {
            case 'perecivel': return '🍎';
            case 'limpeza': return '🧴';
            case 'escritorio': return '📄';
            case 'informatica': return '💻';
            case 'outros': return '📦';
            default: return '❓';
        }
    }

    filtroBusca.addEventListener('input', aplicarFiltros);
    filtroCategoria.addEventListener('change', aplicarFiltros);

    await carregarEstoque();
});
