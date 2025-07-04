import { getProducts, updateProduct, registrarMovimentacaoDetalhada } from './api.js';

// --- Modal galeria imagens ---
const modalGaleria = document.createElement('div');
modalGaleria.id = 'modalGaleria';
modalGaleria.style.cssText = `
    display:none;
    position: fixed;
    z-index: 10000;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0,0,0,0.8);
    justify-content: center;
    align-items: center;
`;
modalGaleria.innerHTML = `
    <div class="modal-content" style="position:relative; max-width:90vw; max-height:90vh; display:flex; align-items:center; justify-content:center;">
        <button id="btnCloseGaleria" title="Fechar" style="
            position:absolute; top:10px; right:10px;
            background:rgba(255,255,255,0.7);
            border:none; border-radius:50%;
            width:35px; height:35px;
            font-size:1.2rem;
            cursor:pointer;
            z-index:10;
        ">&times;</button>
        <button id="btnPrevGaleria" title="Anterior" style="
            position:absolute; left:10px; top:50%;
            transform: translateY(-50%);
            background:rgba(255,255,255,0.7);
            border:none; border-radius:50%;
            width:40px; height:40px;
            font-size:1.5rem;
            cursor:pointer;
            z-index:10;
        ">&#8592;</button>
        <img id="imgGaleria" src="" alt="" style="max-width:100%; max-height:80vh; border-radius:8px; box-shadow:0 0 20px rgba(255,255,255,0.7); user-select:none;" />
        <button id="btnNextGaleria" title="Próximo" style="
            position:absolute; right:10px; top:50%;
            transform: translateY(-50%);
            background:rgba(255,255,255,0.7);
            border:none; border-radius:50%;
            width:40px; height:40px;
            font-size:1.5rem;
            cursor:pointer;
            z-index:10;
        ">&#8594;</button>
    </div>
`;
document.body.appendChild(modalGaleria);

const btnCloseGaleria = document.getElementById('btnCloseGaleria');
const btnPrevGaleria = document.getElementById('btnPrevGaleria');
const btnNextGaleria = document.getElementById('btnNextGaleria');
const imgGaleria = document.getElementById('imgGaleria');

let imagensAtual = [];
let indiceImagemAtual = 0;

btnCloseGaleria.addEventListener('click', () => {
    modalGaleria.style.display = 'none';
    imgGaleria.src = '';
});

btnPrevGaleria.addEventListener('click', e => {
    e.stopPropagation();
    indiceImagemAtual = (indiceImagemAtual - 1 + imagensAtual.length) % imagensAtual.length;
    mostrarImagemGaleria();
});

btnNextGaleria.addEventListener('click', e => {
    e.stopPropagation();
    indiceImagemAtual = (indiceImagemAtual + 1) % imagensAtual.length;
    mostrarImagemGaleria();
});

modalGaleria.addEventListener('click', e => {
    if (e.target === modalGaleria) {
        modalGaleria.style.display = 'none';
        imgGaleria.src = '';
    }
});

function mostrarImagemGaleria() {
    imgGaleria.src = imagensAtual[indiceImagemAtual];
    imgGaleria.alt = `Imagem ${indiceImagemAtual + 1} de ${imagensAtual.length}`;

    const mostrarBotoes = imagensAtual.length > 1;
    btnPrevGaleria.style.display = mostrarBotoes ? 'block' : 'none';
    btnNextGaleria.style.display = mostrarBotoes ? 'block' : 'none';
}

function abrirModalGaleria(imagens) {
    if (!imagens || imagens.length === 0) return;
    imagensAtual = imagens.slice(0, 4);
    indiceImagemAtual = 0;
    mostrarImagemGaleria();
    modalGaleria.style.display = 'flex';
}

// --- MENU MOBILE ---
// Seleção dos elementos do menu
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenu = document.getElementById('closeMenu');

// Abre menu ao clicar no botão do menu
menuBtn?.addEventListener('click', () => {
  mobileMenu.classList.add('open');
});

// Fecha menu ao clicar no botão fechar
closeMenu?.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
});

// Fecha menu ao clicar em qualquer link interno (melhora UX)
mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });
});

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticação
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    const elCurrentUser = document.getElementById('currentUser');
    if (elCurrentUser) {
      elCurrentUser.textContent = currentUser.name;
    } else {
      console.warn('Elemento com id "currentUser" não encontrado no DOM');
    }

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

    // Funções de notificação
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

    async function carregarEstoque() {
        try {
            estoque = await getProducts();
            aplicarFiltros();
        } catch (error) {
            alert('Erro ao carregar estoque: ' + error.message);
            console.error(error);
        }
    }

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

            const imagens = (item.imagem_url && item.imagem_url.length > 0) ? item.imagem_url.slice(0,4) : [];
            const primeiraImagem = imagens[0] || '';

            row.innerHTML = `
                <td>${item.id}</td>
                <td>
                    ${primeiraImagem
                        ? `<img src="${primeiraImagem}" alt="${item.nome}" class="img-thumb" style="width:100px; height:100px; object-fit: cover; border-radius: 6px; cursor:pointer;">`
                        : '-'}
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

            if (primeiraImagem) {
                const imgElement = row.querySelector('img.img-thumb');
                imgElement.addEventListener('click', () => abrirModalGaleria(imagens));
            }
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

    acaoTipo.addEventListener('change', () => {
        const acao = acaoTipo.value;

        if (acao === 'retirar' || acao === 'adicionar') {
            quantidadeAcaoGrupo.style.display = 'block';
            responsavelGrupo.style.display = 'block';
            document.getElementById('quantidadeAcao').required = true;
            document.getElementById('responsavel').required = true;
            document.getElementById('itemNome').disabled = true;
        } else if (acao === 'editar_nome') {
            quantidadeAcaoGrupo.style.display = 'none';
            responsavelGrupo.style.display = 'none';
            document.getElementById('quantidadeAcao').required = false;
            document.getElementById('responsavel').required = false;
            document.getElementById('itemNome').disabled = false;
        } else {
            quantidadeAcaoGrupo.style.display = 'none';
            responsavelGrupo.style.display = 'none';
            document.getElementById('quantidadeAcao').required = false;
            document.getElementById('responsavel').required = false;
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

            await updateProduct(id, {
                quantidade: novaQtd,
                nome: atualizouNome ? nomeNovo : undefined
            });

            estoque[itemIndex].quantidade = novaQtd;
            if (atualizouNome) estoque[itemIndex].nome = nomeNovo;

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
