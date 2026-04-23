// api.js - Core API Fetching Logic
const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Global fetch wrapper that automatically handles Authorization headers
 * and JSON parsing.
 */
async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    // If body is FormData, let browser set Content-Type with boundary automatically
    if (options.body && options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    // Show global loading indicator if present
    const loadingElem = document.getElementById('global-loading');
    if (loadingElem) loadingElem.style.display = 'flex';

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (!response.ok) {
            // Handle 401 Unauthorized
            if (response.status === 401) {
                console.warn('Unauthorized, clearing local session...');
                localStorage.removeItem('token');
                localStorage.removeItem('petshop_current_user');
                if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('register.html') && !window.location.pathname.endsWith('index.html')) {
                    window.location.href = 'login.html';
                }
            }
            
            // Attempt to parse validation errors
            let errorMessage = 'Lỗi kết nối đến máy chủ';
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorMessage;
            } catch (e) {
                // Ignore parse errors on error response
            }
            throw new Error(errorMessage);
        }

        // Return empty string for 204 No Content
        if (response.status === 204) {
            return '';
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    } finally {
        if (loadingElem) loadingElem.style.display = 'none';
    }
}

// Cart endpoints used globally
async function getCartAPI() {
    return await fetchAPI('/cart');
}

async function removeCartItemAPI(productId) {
    return await fetchAPI(`/cart/${productId}`, {
        method: 'DELETE'
    });
}

async function syncCartItemAPI(productId, quantity) {
    return await fetchAPI('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity })
    });
}

async function updateCartItemAPI(productId, quantity) {
    return await fetchAPI(`/cart/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
    });
}

// Reports
async function getDashboardStatsAPI() {
    return await fetchAPI('/reports/dashboard');
}
