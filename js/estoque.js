import { getProducts, updateProduct, registrarMovimentacaoDetalhada } from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticação
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('currentUser').textContent = currentUser.name;

    let estoque = [];

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
        notification.classList.remove('error');
        notification.classList.add('show');
        notification.classList.add('success');

        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.remove('success');
            setTimeout(() => {
                notification.hidden = true;
            }, 400);
        }, 3000);
    }

    // Função para mostrar notificação de erro
    function mostrarErro(mensagem) {
        const notification = document.getElementById('notification');
        notification.textContent = mensagem;
        notification.hidden = false;
        notification.classList.remove('success');
        notification.classList.add('show');
        notification.classList.add('error');

        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.remove('error');
            setTimeout(() => {
                notification.hidden = true;
            }, 400);
        }, 4000);
    }

    // Carregar produtos do Supabase
    async function carregarEstoque() {
        try {
            estoque = await getProducts();
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

            // Adicione a coluna de imagem; suponho que a propriedade seja item.imagem (url)
            // Caso o campo seja diferente, substitua abaixo
            const imagemURL = item.imagem || ''; // URL da imagem ou string vazia

            row.innerHTML = `
                <td>${item.id}</td>
                <td>
                    ${imagemURL ? `<img src="${imagemURL}" alt="${item.nome}" style="width:50px; height:50px; object-fit: cover; border-radius: 4px;">` : '-'}
                </td>
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

        // DESABILITA o campo nome por padrão
        document.getElementById('itemNome').disabled = true;

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

            // DESABILITA nome para outras ações
            document.getElementById('itemNome').disabled = true;

        } else if (acao === 'editar_nome') {
            quantidadeAcaoGrupo.style.display = 'none';
            responsavelGrupo.style.display = 'none';
            document.getElementById('quantidadeAcao').required = false;
            document.getElementById('responsavel').required = false;

            // HABILITA o campo nome para edição
            document.getElementById('itemNome').disabled = false;

        } else {
            quantidadeAcaoGrupo.style.display = 'none';
            responsavelGrupo.style.display = 'none';
            document.getElementById('quantidadeAcao').required = false;
            document.getElementById('responsavel').required = false;

            // DESABILITA o campo nome para outras ações
            document.getElementById('itemNome').disabled = true;
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

        if (acao === 'retirar' && quantidadeAcao > quantidadeAtual) {
            mostrarErro(`Erro: você tentou retirar ${quantidadeAcao} unidades, mas só tem ${quantidadeAtual} em estoque.`);
            return;
        }

        try {
            const itemIndex = estoque.findIndex(i => i.id == id);
            if (itemIndex === -1) throw new Error('Produto não encontrado');

            let novaQtd = quantidadeAtual;
            let atualizouNome = false;

            if (acao === 'retirar') {
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

            // Registrar movimentação detalhada no Supabase
            if (acao === 'retirar' || acao === 'adicionar') {
                const tipoMov = acao === 'retirar' ? 'Retirada' : 'Adição';
                const motivoMov = observacao || `${tipoMov} de ${quantidadeAcao} unidades`;

                await registrarMovimentacaoDetalhada({
                    data: new Date().toISOString(),
                    produto_id: id,
                    tipo: tipoMov,
                    quantidade: quantidadeAcao,
                    destino: 'Estoque',
                    responsavel: responsavel,
                    motivo: motivoMov
                });
            } else if (acao === 'editar_nome') {
                await registrarMovimentacaoDetalhada({
                    data: new Date().toISOString(),
                    produto_id: id,
                    tipo: 'Edição de nome',
                    quantidade: 0,
                    destino: 'Estoque',
                    responsavel: responsavel,
                    motivo: `Nome alterado de "${nomeAtual}" para "${nomeNovo}" - Observação: ${observacao}`
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
