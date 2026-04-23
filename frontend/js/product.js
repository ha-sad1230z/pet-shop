// product.js - Product & Category APIs

// Products
async function getProductsAPI() {
    return await fetchAPI('/products');
}

async function uploadImageAPI(file) {
    const formData = new FormData();
    formData.append('image', file);
    return await fetchAPI('/upload', {
        method: 'POST',
        body: formData
    });
}

async function getProductByIdAPI(id) {
    return await fetchAPI(`/products/${id}`);
}

async function createProductAPI(productData) {
    return await fetchAPI('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
    });
}

async function updateProductAPI(id, productData) {
    return await fetchAPI(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
    });
}

async function deleteProductAPI(id) {
    return await fetchAPI(`/products/${id}`, {
        method: 'DELETE'
    });
}

// Categories
async function getCategoriesAPI() {
    return await fetchAPI('/categories');
}

async function createCategoryAPI(categoryData) {
    return await fetchAPI('/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData)
    });
}

async function updateCategoryAPI(id, categoryData) {
    return await fetchAPI(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData)
    });
}

async function deleteCategoryAPI(id) {
    return await fetchAPI(`/categories/${id}`, {
        method: 'DELETE'
    });
}
