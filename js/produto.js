// js/produto.js
import { createProduct } from './api.js';

document.addEventListener('DOMContentLoaded', function () {
    const productForm = document.getElementById('productForm');
    const imageInput = document.getElementById('productImages');
    const imagePreview = document.getElementById('imagePreview');
    const productType = document.getElementById('productType');
    const dateField = document.getElementById('dateField');
    const successMessage = document.getElementById('successMessage');
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenu = document.getElementById('closeMenu');

    menuBtn.addEventListener('click', () => {
        mobileMenu.style.display = 'block';
    });

    closeMenu.addEventListener('click', () => {
        mobileMenu.style.display = 'none';
    });

    productType.addEventListener('change', function () {
        if (this.value === 'perecivel') {
            dateField.style.display = 'block';
            document.getElementById('productDate').required = true;
        } else {
            dateField.style.display = 'none';
            document.getElementById('productDate').required = false;
        }
    });

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

    productForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const productData = {
            nome: document.getElementById('productName').value.trim(),
            quantidade: parseInt(document.getElementById('productQuantity').value),
            tipo: productType.value,
            data_validade: productType.value === 'perecivel' ? document.getElementById('productDate').value : null,
        };

        if (!productData.nome) return alert('Nome do produto é obrigatório');
        if (isNaN(productData.quantidade) || productData.quantidade < 0) return alert('Quantidade inválida');
        if (!productData.tipo) return alert('Tipo do produto é obrigatório');
        if (productData.tipo === 'perecivel' && !productData.data_validade)
            return alert('Data de validade é obrigatória para produtos perecíveis');

        try {
            await createProduct(productData);
            successMessage.style.display = 'flex';
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
            productForm.reset();
            imagePreview.innerHTML = '';
            dateField.style.display = 'none';
        } catch (error) {
            alert('Erro ao salvar produto: ' + error.message);
        }
    });
});
