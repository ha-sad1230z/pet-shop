// order.js - Order and User APIs

// Orders
async function getOrdersAPI() {
    return await fetchAPI('/orders');
}

async function createOrderAPI(orderData) {
    return await fetchAPI('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
    });
}

async function updateOrderStatusAPI(id, status) {
    return await fetchAPI(`/orders/${id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    });
}

// Cart operations (pre-checkout sync)
async function getCartAPI() {
    return await fetchAPI('/cart');
}

// Users (Admin functionality)
async function getUsersAPI() {
    return await fetchAPI('/users');
}

async function createUserAPI(userData) {
    return await fetchAPI('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

async function updateUserAPI(id, userData) {
    return await fetchAPI(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
    });
}

async function deleteUserAPI(id) {
    return await fetchAPI(`/users/${id}`, {
        method: 'DELETE'
    });
}
