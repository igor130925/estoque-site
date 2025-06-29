document.addEventListener('DOMContentLoaded', function () {
    // Elementos do DOM
    const productForm = document.getElementById('productForm');
    const imageInput = document.getElementById('productImages');
    const imagePreview = document.getElementById('imagePreview');
    const productType = document.getElementById('productType');
    const dateField = document.getElementById('dateField');
    const successMessage = document.getElementById('successMessage');
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenu = document.getElementById('closeMenu');
    const productDate = document.getElementById('productDate');

    // Menu mobile
    menuBtn.addEventListener('click', function () {
        mobileMenu.style.display = 'block';
    });

    closeMenu.addEventListener('click', function () {
        mobileMenu.style.display = 'none';
    });

    // Mostrar/ocultar campo de data baseado no tipo de produto
    productType.addEventListener('change', function () {
        if (this.value === 'perecivel') {
            dateField.style.display = 'block';
            productDate.required = true;
        } else {
            dateField.style.display = 'none';
            productDate.required = false;
        }
    });

    // Preview de imagens
    imageInput.addEventListener('change', function () {
        imagePreview.innerHTML = '';

        if (this.files.length > 4) {
            alert('Você pode selecionar no máximo 4 imagens');
            this.value = '';
            return;
        }

        Array.from(this.files).forEach(file => {
            if (!file.type.match('image.*')) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-thumb';
                imagePreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    });

    // Enviar formulário
    productForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Obter valores
        const productData = {
            name: document.getElementById('productName').value.trim(),
            quantity: parseInt(document.getElementById('productQuantity').value),
            type: productType.value,
            date: productType.value === 'perecivel' ? productDate.value.trim() : null,
            images: imageInput.files
        };

        // Validações
        if (!productData.name) {
            alert('Nome do produto é obrigatório');
            return;
        }

        if (isNaN(productData.quantity) || productData.quantity < 0) {
            alert('Quantidade inválida');
            return;
        }

        if (!productData.type) {
            alert('Tipo do produto é obrigatório');
            return;
        }

        if (productData.type === 'perecivel' && (!productData.date || productData.date === '')) {
            alert('Data de validade é obrigatória para produtos perecíveis');
            return;
        }

        // Salvar produto (simulação)
        saveProduct(productData);
    });

    // Função simulada para salvar produto
    function saveProduct(productData) {
        setTimeout(() => {
            console.log('Produto salvo:', productData);

            // Mostrar mensagem de sucesso
            successMessage.style.display = 'flex';

            // Esconder após 3s
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);

            // Resetar formulário
            productForm.reset();
            imagePreview.innerHTML = '';
            dateField.style.display = 'none';
        }, 1000);
    }
});
