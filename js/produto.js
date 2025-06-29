<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', function () {
=======
document.addEventListener('DOMContentLoaded', function() {
>>>>>>> 72e91283f1b7ed4e541b26d126858476eabfa094
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
<<<<<<< HEAD
    const productDate = document.getElementById('productDate');

    // Menu mobile
    menuBtn.addEventListener('click', function () {
        mobileMenu.style.display = 'block';
    });

    closeMenu.addEventListener('click', function () {
=======

    // Menu mobile
    menuBtn.addEventListener('click', function() {
        mobileMenu.style.display = 'block';
    });

    closeMenu.addEventListener('click', function() {
>>>>>>> 72e91283f1b7ed4e541b26d126858476eabfa094
        mobileMenu.style.display = 'none';
    });

    // Mostrar/ocultar campo de data baseado no tipo de produto
<<<<<<< HEAD
    productType.addEventListener('change', function () {
        if (this.value === 'perecivel') {
            dateField.style.display = 'block';
            productDate.required = true;
        } else {
            dateField.style.display = 'none';
            productDate.required = false;
=======
    productType.addEventListener('change', function() {
        if (this.value === 'perecivel') {
            dateField.style.display = 'block';
            document.getElementById('productDate').required = true;
        } else {
            dateField.style.display = 'none';
            document.getElementById('productDate').required = false;
>>>>>>> 72e91283f1b7ed4e541b26d126858476eabfa094
        }
    });

    // Preview de imagens
<<<<<<< HEAD
    imageInput.addEventListener('change', function () {
        imagePreview.innerHTML = '';

=======
    imageInput.addEventListener('change', function() {
        imagePreview.innerHTML = '';
        
>>>>>>> 72e91283f1b7ed4e541b26d126858476eabfa094
        if (this.files.length > 4) {
            alert('Você pode selecionar no máximo 4 imagens');
            this.value = '';
            return;
        }
<<<<<<< HEAD

        Array.from(this.files).forEach(file => {
            if (!file.type.match('image.*')) return;

            const reader = new FileReader();
            reader.onload = function (e) {
=======
        
        Array.from(this.files).forEach(file => {
            if (!file.type.match('image.*')) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
>>>>>>> 72e91283f1b7ed4e541b26d126858476eabfa094
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-thumb';
                imagePreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    });

    // Enviar formulário
<<<<<<< HEAD
    productForm.addEventListener('submit', function (e) {
        e.preventDefault();

=======
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
>>>>>>> 72e91283f1b7ed4e541b26d126858476eabfa094
        // Obter valores
        const productData = {
            name: document.getElementById('productName').value.trim(),
            quantity: parseInt(document.getElementById('productQuantity').value),
            type: productType.value,
<<<<<<< HEAD
            date: productType.value === 'perecivel' ? productDate.value.trim() : null,
            images: imageInput.files
        };

=======
            date: productType.value === 'perecivel' ? document.getElementById('productDate').value : null,
            images: imageInput.files
        };
        
>>>>>>> 72e91283f1b7ed4e541b26d126858476eabfa094
        // Validações
        if (!productData.name) {
            alert('Nome do produto é obrigatório');
            return;
        }
<<<<<<< HEAD

=======
        
>>>>>>> 72e91283f1b7ed4e541b26d126858476eabfa094
        if (isNaN(productData.quantity) || productData.quantity < 0) {
            alert('Quantidade inválida');
            return;
        }
<<<<<<< HEAD

=======
        
>>>>>>> 72e91283f1b7ed4e541b26d126858476eabfa094
        if (!productData.type) {
            alert('Tipo do produto é obrigatório');
            return;
        }
<<<<<<< HEAD

        if (productData.type === 'perecivel' && (!productData.date || productData.date === '')) {
            alert('Data de validade é obrigatória para produtos perecíveis');
            return;
        }

=======
        
        if (productData.type === 'perecivel' && productData.date) {
            alert('Data de validade é obrigatória para produtos perecíveis');
            return;
        }
        
>>>>>>> 72e91283f1b7ed4e541b26d126858476eabfa094
        // Salvar produto (simulação)
        saveProduct(productData);
    });

    // Função simulada para salvar produto
    function saveProduct(productData) {
<<<<<<< HEAD
        setTimeout(() => {
            console.log('Produto salvo:', productData);

            // Mostrar mensagem de sucesso
            successMessage.style.display = 'flex';

            // Esconder após 3s
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);

=======
        // Simular chamada à API
        setTimeout(() => {
            console.log('Produto salvo:', productData);
            
            // Mostrar mensagem de sucesso
            successMessage.style.display = 'flex';
            
            // Esconder mensagem após 3 segundos
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
            
>>>>>>> 72e91283f1b7ed4e541b26d126858476eabfa094
            // Resetar formulário
            productForm.reset();
            imagePreview.innerHTML = '';
            dateField.style.display = 'none';
        }, 1000);
    }
<<<<<<< HEAD
});
=======
});
>>>>>>> 72e91283f1b7ed4e541b26d126858476eabfa094
