document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Exibir nome do usuário
    document.getElementById('currentUser').textContent = currentUser.name;

    // Dados de exemplo (substituir por chamada à API)
    let estoque = [
        { id: 1, codigo: 'P001', nome: 'Notebook Dell', categoria: 'eletronico', quantidade: 15, localizacao: 'Armário A1' },
        { id: 2, codigo: 'P002', nome: 'Mouse Sem Fio', categoria: 'eletronico', quantidade: 32, localizacao: 'Gaveta B2' },
        { id: 3, codigo: 'P003', nome: 'Cadeira Escritório', categoria: 'mobilia', quantidade: 8, localizacao: 'Setor C3' },
        { id: 4, codigo: 'P004', nome: 'Papel A4', categoria: 'material', quantidade: 50, localizacao: 'Prateleira D4' },
        { id: 5, codigo: 'P005', nome: 'Caneta Azul', categoria: 'material', quantidade: 120, localizacao: 'Gaveta B3' }
    ];

    let historicoRetiradas = [];

    // Elementos do DOM
    const tabelaEstoque = document.getElementById('tabelaEstoque').getElementsByTagName('tbody')[0];
    const filtroBusca = document.getElementById('filtroBusca');
    const filtroCategoria = document.getElementById('filtroCategoria');
    const modal = document.getElementById('modalRetirada');
    const closeBtn = document.querySelector('.close-btn');
    const formRetirada = document.getElementById('formRetirada');

    // Carregar dados na tabela
    function carregarEstoque() {
        const filtroTexto = filtroBusca.value.toLowerCase();
        const filtroCat = filtroCategoria.value;

        tabelaEstoque.innerHTML = '';

        estoque.filter(item => {
            const textoMatch = item.nome.toLowerCase().includes(filtroTexto) || 
                              item.codigo.toLowerCase().includes(filtroTexto);
            const categoriaMatch = !filtroCat || item.categoria === filtroCat;
            return textoMatch && categoriaMatch;
        }).forEach(item => {
            const row = tabelaEstoque.insertRow();
            
            // Ícone da categoria
            const icon = getCategoryIcon(item.categoria);
            
            row.innerHTML = `
                <td>${item.codigo}</td>
                <td>${item.nome}</td>
                <td><span class="category">${icon} ${formatCategory(item.categoria)}</span></td>
                <td>${item.quantidade}</td>
                <td>${item.localizacao}</td>
                <td>
                    <button class="btn primary btn-sm retirar-btn" data-id="${item.id}">
                        <i class="fas fa-minus-circle"></i> Retirar
                    </button>
                </td>
            `;
        });

        // Adicionar eventos aos botões de retirada
        document.querySelectorAll('.retirar-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                abrirModalRetirada(this.dataset.id);
            });
        });
    }

    // Abrir modal para registrar retirada
    function abrirModalRetirada(itemId) {
        const item = estoque.find(i => i.id == itemId);
        if (!item) return;

        document.getElementById('itemId').value = item.id;
        document.getElementById('itemNome').value = item.nome;
        document.getElementById('quantidadeDisponivel').value = item.quantidade;
        document.getElementById('quantidadeRetirada').max = item.quantidade;
        document.getElementById('quantidadeRetirada').value = 1;
        document.getElementById('responsavel').value = currentUser.name;
        document.getElementById('observacao').value = '';

        modal.style.display = 'flex';
    }

    // Fechar modal
    function fecharModal() {
        modal.style.display = 'none';
    }

    // Formatar categoria para exibição
    function formatCategory(category) {
        const categories = {
            'eletronico': 'Eletrônico',
            'mobilia': 'Mobília',
            'material': 'Material',
            'ferramenta': 'Ferramenta',
            'perecivel': 'Perecível'
        };
        return categories[category] || category;
    }

    // Obter ícone da categoria
    function getCategoryIcon(category) {
        const icons = {
            'eletronico': '💻',
            'mobilia': '🪑',
            'material': '📎',
            'ferramenta': '🔧',
            'perecivel': '🍎'
        };
        return icons[category] || '📦';
    }

    // Registrar retirada
    formRetirada.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const itemId = parseInt(document.getElementById('itemId').value);
        const quantidadeRetirada = parseInt(document.getElementById('quantidadeRetirada').value);
        const responsavel = document.getElementById('responsavel').value;
        const observacao = document.getElementById('observacao').value;
        
        // Encontrar item no estoque
        const itemIndex = estoque.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;
        
        // Verificar quantidade disponível
        if (quantidadeRetirada > estoque[itemIndex].quantidade) {
            alert('Quantidade solicitada maior que o disponível');
            return;
        }
        
        // Atualizar estoque
        estoque[itemIndex].quantidade -= quantidadeRetirada;
        
        // Registrar retirada no histórico
        const retirada = {
            id: Date.now(),
            itemId,
            itemCodigo: estoque[itemIndex].codigo,
            itemNome: estoque[itemIndex].nome,
            quantidade: quantidadeRetirada,
            responsavel,
            data: new Date().toISOString(),
            observacao
        };
        
        historicoRetiradas.push(retirada);
        
        // Atualizar tabela e fechar modal
        carregarEstoque();
        fecharModal();
        
        alert(`Retirada de ${quantidadeRetirada} unidade(s) de ${estoque[itemIndex].nome} registrada com sucesso!`);
    });

    // Event listeners
    filtroBusca.addEventListener('input', carregarEstoque);
    filtroCategoria.addEventListener('change', carregarEstoque);
    closeBtn.addEventListener('click', fecharModal);
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            fecharModal();
        }
    });

    // Carregar dados iniciais
    carregarEstoque();
});