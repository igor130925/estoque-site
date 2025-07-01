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

    const modalAcoes = document.getElementById('modalAcoes');
    const closeBtnAcoes = modalAcoes.querySelector('.close-btn');
    const formAcoes = document.getElementById('formAcoes');
    const acaoTipo = document.getElementById('acaoTipo');
    const quantidadeAcaoGrupo = document.getElementById('quantidadeAcaoGrupo');
    const responsavelGrupo = document.getElementById('responsavelGrupo');

    // Função para mostrar a notificação de sucesso
    function mostrarMensagem(mensagem) {
        const notification = document.getElementById('notification');
        notification.textContent = mensagem;
        notification.hidden = false;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.hidden = true;
            }, 400);
        }, 3000);
    }

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
                    <button class="btn primary btn-sm acoes-btn" data-id="${item.id}">
                        <i class="fas fa-edit"></i> Ações
                    </button>
                </td>
            `;
        });

        document.querySelectorAll('.acoes-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                abrirModalAcoes(this.dataset.id);
            });
        });
    }

    function abrirModalAcoes(itemId) {
        const item = estoque.find(i => i.id == itemId);
        if (!item) return;

        document.getElementById('itemId').value = item.id;
        document.getElementById('itemNome').value = item.nome;
        document.getElementById('quantidadeAtual').value = item.quantidade;
        document.getElementById('quantidadeAcao').value = '';
        document.getElementById('responsavel').value = '';
        document.getElementById('observacao').value = '';
        acaoTipo.value = '';

        quantidadeAcaoGrupo.style.display = 'none';
        responsavelGrupo.style.display = 'none';

        modalAcoes.style.display = 'flex';
        modalAcoes.removeAttribute('hidden');
    }

    closeBtnAcoes.addEventListener('click', () => {
        modalAcoes.style.display = 'none';
        modalAcoes.setAttribute('hidden', 'true');
    });

    window.addEventListener('click', e => {
        if (e.target == modalAcoes) {
            modalAcoes.style.display = 'none';
            modalAcoes.setAttribute('hidden', 'true');
        }
    });

    // Mostrar/ocultar campos dependendo da ação selecionada
    acaoTipo.addEventListener('change', () => {
        const acao = acaoTipo.value;
        if (acao === 'retirar' || acao === 'adicionar') {
            quantidadeAcaoGrupo.style.display = 'block';
            responsavelGrupo.style.display = 'block';
            document.getElementById('quantidadeAcao').required = true;
            document.getElementById('responsavel').required = true;
        } else if (acao === 'editar_nome') {
            quantidadeAcaoGrupo.style.display = 'none';
            responsavelGrupo.style.display = 'none';
            document.getElementById('quantidadeAcao').required = false;
            document.getElementById('responsavel').required = false;
        } else {
            quantidadeAcaoGrupo.style.display = 'none';
            responsavelGrupo.style.display = 'none';
            document.getElementById('quantidadeAcao').required = false;
            document.getElementById('responsavel').required = false;
        }
    });

    formAcoes.addEventListener('submit', async e => {
        e.preventDefault();

        const id = document.getElementById('itemId').value;
        const nomeAtual = estoque.find(i => i.id == id)?.nome || '';
        const nomeNovo = document.getElementById('itemNome').value.trim();
        const quantidadeAtual = parseInt(document.getElementById('quantidadeAtual').value);
        const acao = acaoTipo.value;
        const quantidadeAcao = parseInt(document.getElementById('quantidadeAcao').value) || 0;
        const responsavel = document.getElementById('responsavel').value.trim();
        const observacao = document.getElementById('observacao').value.trim();

        if (!acao) {
            alert('Selecione o tipo de ação.');
            return;
        }

        if ((acao === 'retirar' || acao === 'adicionar') && (quantidadeAcao <= 0)) {
            alert('Informe uma quantidade válida.');
            return;
        }

        if ((acao === 'retirar' || acao === 'adicionar') && !responsavel) {
            alert('Informe o responsável.');
            return;
        }

        try {
            const itemIndex = estoque.findIndex(i => i.id == id);
            if (itemIndex === -1) throw new Error('Produto não encontrado');

            let novaQtd = quantidadeAtual;
            let atualizouNome = false;

            if (acao === 'retirar') {
                if (quantidadeAcao > quantidadeAtual) {
                    alert('Quantidade a retirar maior que a disponível.');
                    return;
                }
                novaQtd = quantidadeAtual - quantidadeAcao;
            } else if (acao === 'adicionar') {
                novaQtd = quantidadeAtual + quantidadeAcao;
            } else if (acao === 'editar_nome') {
                if (nomeNovo === '') {
                    alert('Nome do produto não pode ser vazio.');
                    return;
                }
                estoque[itemIndex].nome = nomeNovo;
                atualizouNome = true;
            }

            // Atualiza no banco Supabase (quantidade e/ou nome)
            await updateProduct(id, {
                quantidade: novaQtd,
                nome: atualizouNome ? nomeNovo : undefined
            });

            // Atualiza localmente
            estoque[itemIndex].quantidade = novaQtd;
            if (atualizouNome) estoque[itemIndex].nome = nomeNovo;

            // Histórico de alterações para retirar/adicionar
            if (acao === 'retirar' || acao === 'adicionar') {
                historicoRetiradas.push({
                    id,
                    nome: estoque[itemIndex].nome,
                    quantidade: acao === 'retirar' ? -quantidadeAcao : quantidadeAcao,
                    responsavel,
                    observacao,
                    data: new Date().toLocaleString('pt-BR'),
                    tipoAcao: acao
                });
            }

            mostrarMensagem('Ação realizada com sucesso!');
            modalAcoes.style.display = 'none';
            modalAcoes.setAttribute('hidden', 'true');
            aplicarFiltros();

        } catch (error) {
            alert('Erro ao realizar a ação: ' + error.message);
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
