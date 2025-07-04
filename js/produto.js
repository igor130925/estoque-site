import { createProduct } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const productForm = document.getElementById('productForm');
  const imageInput = document.getElementById('productImages');
  const imagePreview = document.getElementById('imagePreview');
  const productType = document.getElementById('productType');
  const dateField = document.getElementById('dateField');
  const successMessage = document.getElementById('successMessage');
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenu = document.getElementById('closeMenu');

  const nameInput = document.getElementById('productName');
  const quantityInput = document.getElementById('productQuantity');
  const dateInput = document.getElementById('productDate');

  const errorContainer = document.getElementById('formErrors');

  function showError(message, field = null) {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    errorContainer.appendChild(error);

    if (field) field.classList.add('input-error');
  }

  function clearErrors() {
    errorContainer.innerHTML = '';
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  }

  // Animação do menu mobile
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.add('open');
  });

  closeMenu.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });

  productType.addEventListener('change', function () {
    if (this.value === 'perecivel') {
      dateField.style.display = 'block';
      dateInput.required = true;
    } else {
      dateField.style.display = 'none';
      dateInput.required = false;
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
      reader.onload = e => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'preview-thumb';
        imagePreview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });

  productForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();

    const productData = {
      nome: nameInput.value.trim(),
      quantidade: parseInt(quantityInput.value, 10),
      tipo: productType.value,
      data_validade: productType.value === 'perecivel' ? dateInput.value : null,
    };

    let isValid = true;

    if (!productData.nome) {
      showError('Nome do produto é obrigatório.', nameInput);
      isValid = false;
    }
    if (isNaN(productData.quantidade) || productData.quantidade < 0) {
      showError('Quantidade inválida.', quantityInput);
      isValid = false;
    }
    if (!productData.tipo) {
      showError('Tipo do produto é obrigatório.', productType);
      isValid = false;
    }
    if (productData.tipo === 'perecivel' && !productData.data_validade) {
      showError('Data de validade é obrigatória para produtos perecíveis.', dateInput);
      isValid = false;
    }

    if (!isValid) return;

    try {
      await createProduct(productData, imageInput.files);

      successMessage.style.display = 'flex';
      setTimeout(() => {
        successMessage.style.display = 'none';
      }, 3000);

      productForm.reset();
      imagePreview.innerHTML = '';
      dateField.style.display = 'none';
      clearErrors();
    } catch (error) {
      showError('Erro ao salvar produto: ' + (error.message || error));
    }
  });
});
