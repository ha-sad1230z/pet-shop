// products.js - Handles fetching and rendering products

// Global cache for cart lookup
window.petshopProductsCache = [];

async function getProducts() {
    try {
        const products = await getProductsAPI();
        window.petshopProductsCache = products;
        return products;
    } catch (e) {
        console.error("Failed to load products", e);
        return [];
    }
}

// Function to render a single product card HTML
function generateProductCardHtml(product) {
    return `
        <div class="col-sm-6 col-md-4 col-lg-3">
            <div class="card product-card h-100 position-relative">
                <a href="product-detail.html?id=${product.id}" class="text-decoration-none">
                    ${product.stock < 5 ? '<span class="badge bg-danger position-absolute top-0 start-0 m-3">Sắp hết hàng</span>' : ''}
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body d-flex flex-column">
                        <span class="text-muted small mb-1">${product.category}</span>
                        <h5 class="card-title text-dark fw-bold text-truncate" title="${product.name}">${product.name}</h5>
                        <div class="mt-auto d-flex justify-content-between align-items-center pt-3">
                            <span class="fs-5 fw-bold text-primary-custom">${formatCurrency(product.price)}</span>
                            <button class="btn btn-sm btn-outline-primary rounded-circle p-2 add-to-cart-btn" 
                                    onclick="event.preventDefault(); addToCart(${product.id});" 
                                    title="Thêm vào giỏ">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    `;
}

// Render Featured Products on Home Page
async function renderFeaturedProducts() {
    const container = document.getElementById('featured-products-container');
    if (!container) return;

    container.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>';

    const products = await getProducts();
    // Just grab first 4 as featured
    const featured = products.slice(0, 4);

    if (featured.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted py-5">Không tìm thấy sản phẩm.</div>';
        return;
    }

    container.innerHTML = featured.map(generateProductCardHtml).join('');
}

// Render Products Page with Filtering
async function renderProductsPage() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    container.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>';

    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search')?.toLowerCase();

    let products = await getProducts();
    let categories = [];
    
    try {
        categories = await getCategoriesAPI();
    } catch (e) {
        console.error("Failed to load categories", e);
    }
    
    // Render Category Filter list
    const categoryList = document.getElementById('category-filter-list');
    if (categoryList && categories.length > 0) {
        const searchPart = searchParam ? `&search=${searchParam}` : '';
        const isAllActive = !categoryParam || categoryParam === 'All';
        
        let catHtml = `
            <a href="products.html${searchPart ? '?' + searchPart.substring(1) : ''}" 
               class="list-group-item list-group-item-action border-0 px-0 d-flex justify-content-between align-items-center ${isAllActive ? 'text-primary fw-bold' : 'text-muted'}">
                Tất cả danh mục
            </a>
        `;
        
        categories.forEach(cat => {
            const isActive = cat.name === categoryParam;
            catHtml += `
                <a href="products.html?category=${encodeURIComponent(cat.name)}${searchPart}" 
                   class="list-group-item list-group-item-action border-0 px-0 d-flex justify-content-between align-items-center ${isActive ? 'text-primary fw-bold' : 'text-muted'}">
                    ${cat.name}
                </a>
            `;
        });
        categoryList.innerHTML = catHtml;
    }

    if (categoryParam && categoryParam !== 'All') {
        const catObj = categories.find(c => c.name === categoryParam);
        if (catObj) {
            products = products.filter(p => p.categoryId === catObj.id);
        }
        // Set category dropdown active text if exists
        const filterBtn = document.getElementById('categoryFilterBtn');
        if (filterBtn) filterBtn.textContent = categoryParam;
    }

    if (searchParam) {
        products = products.filter(p => p.name.toLowerCase().includes(searchParam) || (p.desc && p.desc.toLowerCase().includes(searchParam)));
    }

    if (products.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted py-5 shadow-sm rounded bg-white"><i class="fa-solid fa-box-open fs-1 mb-3"></i><br>Không có sản phẩm nào phù hợp với yêu cầu của bạn.</div>';
        return;
    }

    container.innerHTML = products.map(generateProductCardHtml).join('');
    
    const countEl = document.getElementById('products-count');
    if (countEl) countEl.textContent = `Đang hiển thị ${products.length} sản phẩm`;
}

// Product Detail Page Logic
async function renderProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!productId) {
        window.location.href = 'products.html';
        return;
    }

    document.getElementById('product-detail-container').innerHTML = '<div class="alert alert-info py-5 text-center"><div class="spinner-border text-primary" role="status"></div><br>Đang tải...</div>';

    try {
        const product = await getProductByIdAPI(productId);

        if (!product) {
            throw new Error('Not found');
        }

        // Cache it for cart
        window.petshopProductsCache = [product];

        // Re-render HTML around it
        document.getElementById('product-detail-container').innerHTML = `
            <div class="row gx-5">
                <div class="col-md-6 mb-4 mb-md-0">
                    <div class="bg-light rounded-4 overflow-hidden shadow-sm d-flex align-items-center justify-content-center h-100 p-4">
                        <img src="${product.image || 'https://via.placeholder.com/400'}" id="pd-image" alt="Product" class="img-fluid" style="max-height: 500px; object-fit: contain;">
                    </div>
                </div>
                <div class="col-md-6 d-flex flex-column justify-content-center">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a href="index.html" class="text-decoration-none text-muted">Trang chủ</a></li>
                            <li class="breadcrumb-item"><a href="products.html" class="text-decoration-none text-muted">Sản phẩm</a></li>
                        </ol>
                    </nav>
                    <span class="badge bg-primary-custom align-self-start mb-2 px-3 py-2 rounded-pill" id="pd-category">Category ID: ${product.categoryId}</span>
                    <h1 class="fw-bold mb-3 display-6" id="pd-name">${product.name}</h1>
                    <div class="d-flex align-items-center mb-4">
                        <h2 class="text-primary-custom fw-bold mb-0 me-3" id="pd-price">${formatCurrency(product.price)}</h2>
                        <span class="badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'} rounded-pill" id="pd-stock">${product.stock > 0 ? product.stock + ' sản phẩm có sẵn' : 'Hết hàng'}</span>
                    </div>
                    <p class="text-muted mb-4 lead" style="font-size: 1.1rem; line-height: 1.8;" id="pd-desc">${product.desc || ''}</p>
                    
                    <div class="d-flex align-items-center gap-3 mb-4">
                        <div class="input-group" style="width: 140px;">
                            <button class="btn btn-outline-secondary" type="button" onclick="const q=document.getElementById('pd-quantity'); if(q.value>1) q.value--;">-</button>
                            <input type="number" class="form-control text-center text-dark fw-bold" id="pd-quantity" value="1" min="1" max="${product.stock}">
                            <button class="btn btn-outline-secondary" type="button" onclick="const q=document.getElementById('pd-quantity'); if(q.value<${product.stock}) q.value++;">+</button>
                        </div>
                        <button class="btn btn-primary btn-lg flex-grow-1 shadow fw-semibold" id="pd-add-to-cart" ${product.stock <= 0 ? 'disabled' : ''}>
                            <i class="fa-solid fa-cart-plus me-2"></i> ${product.stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                        </button>
                    </div>
                    
                    <div class="d-flex gap-4 text-muted small mt-4 pt-4 border-top">
                        <div><i class="fa-solid fa-truck-fast me-2 text-primary-custom"></i> Giao hàng siêu tốc</div>
                        <div><i class="fa-solid fa-shield-halved me-2 text-primary-custom"></i> Đảm bảo chính hãng</div>
                        <div><i class="fa-solid fa-rotate-left me-2 text-primary-custom"></i> Đổi trả 7 ngày</div>
                    </div>
                </div>
            </div>
        `;

        document.title = `${product.name} - PetShop`;

        document.getElementById('pd-add-to-cart').addEventListener('click', () => {
            const qty = parseInt(document.getElementById('pd-quantity').value) || 1;
            addToCart(product.id, qty);
        });

    } catch (e) {
        document.getElementById('product-detail-container').innerHTML = '<div class="alert alert-danger">Không tìm thấy sản phẩm hoặc có lỗi xảy ra. <a href="products.html">Quay lại</a></div>';
    }
}

// Global Add to Cart functionality
async function addToCart(productId, quantity = 1) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
        window.location.href = 'login.html';
        return;
    }

    // If not cached, fetch it
    let product = window.petshopProductsCache.find(p => p.id === productId);
    if (!product) {
        try {
            product = await getProductByIdAPI(productId);
        } catch (e) {
            alert('Lỗi tải thông tin sản phẩm.');
            return;
        }
    }
    
    if (!product || product.stock < quantity) {
        alert('Sản phẩm đã hết hàng hoặc số lượng không đủ.');
        return;
    }

    if (typeof syncCartItemAPI === 'function') {
        try {
            await syncCartItemAPI(productId, quantity);
            await updateCartBadge(); // Fetch latest cart and update badge
            alert(`Đã thêm ${quantity} x ${product.name} vào giỏ hàng!`);
        } catch (e) {
            console.error("Failed to sync item to server", e);
            alert('Có lỗi xảy ra khi thêm vào giỏ hàng. ' + (e.message || ''));
        }
    } else {
        alert('Lỗi: Không tìm thấy API giỏ hàng.');
    }
}
