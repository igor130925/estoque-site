const API_BASE_URL = 'https://sua-api.com/v1';

// Função para fazer requisições genéricas
async function makeRequest(endpoint, method = 'GET', body = null, requiresAuth = true) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (requiresAuth) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Autenticação necessária');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (response.status === 401) {
            // Token inválido ou expirado
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html?sessionExpired=true';
            return;
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro na requisição');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// Funções específicas para usuários
export async function registerUser(userData) {
    return makeRequest('/users/register', 'POST', userData, false);
}

export async function loginUser(credentials) {
    return makeRequest('/users/login', 'POST', credentials, false);
}

export async function getCurrentUser() {
    return makeRequest('/users/me');
}

// Funções para produtos
export async function getProducts() {
    return makeRequest('/products');
}

export async function createProduct(productData) {
    return makeRequest('/products', 'POST', productData);
}

export async function updateProduct(id, productData) {
    return makeRequest(`/products/${id}`, 'PUT', productData);
}

export async function deleteProduct(id) {
    return makeRequest(`/products/${id}`, 'DELETE');
}

export async function uploadProductImages(productId, images) {
    const formData = new FormData();
    images.forEach((image, index) => {
        formData.append(`images`, image);
    });

    const response = await fetch(`${API_BASE_URL}/products/${productId}/images`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error('Erro ao enviar imagens');
    }

    return await response.json();
}

// Funções administrativas
export async function getAllUsers() {
    return makeRequest('/admin/users');
}

export async function relocateProduct(productId, data) {
    return makeRequest(`/admin/products/${productId}/relocate`, 'POST', data);
}

export async function getSystemStats() {
    return makeRequest('/admin/stats');
}