// cart.js - Handles cart logic and checkout parsing

async function getCartFromServer() {
    const token = localStorage.getItem('token');
    if (!token) return [];
    try {
        const cart = await getCartAPI();
        return Array.isArray(cart) ? cart : [];
    } catch (e) {
        console.error("Failed to fetch cart", e);
        return [];
    }
}

async function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    const summaryContainer = document.getElementById('cart-summary');
    if (!container || !summaryContainer) return;

    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><br>Đang tải giỏ hàng...</div>';

    const cart = await getCartFromServer();

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fa-solid fa-cart-shopping text-muted mb-3" style="font-size: 4rem;"></i>
                <h4 class="fw-bold">Giỏ hàng của bạn đang trống</h4>
                <p class="text-muted">Có vẻ như bạn chưa thêm gì vào giỏ hàng.</p>
                <a href="products.html" class="btn btn-primary mt-3">Bắt đầu mua sắm</a>
            </div>
        `;
        summaryContainer.style.display = 'none';
        return;
    }

    summaryContainer.style.display = 'block';
    
    // Render list
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table align-middle border-bottom">
                <thead>
                    <tr class="text-muted small text-uppercase">
                        <th scope="col" style="width: 50%;">Sản phẩm</th>
                        <th scope="col" style="width: 15%;">Giá</th>
                        <th scope="col" style="width: 20%;">Số lượng</th>
                        <th scope="col" style="width: 15%;" class="text-end">Tổng phụ</th>
                    </tr>
                </thead>
                <tbody>
                    ${cart.map((item) => `
                        <tr>
                            <td>
                                <div class="d-flex align-items-center gap-3">
                                    <img src="${item.image}" alt="${item.name}" class="rounded bg-light p-1" width="60" height="60" style="object-fit: contain;">
                                    <div>
                                        <a href="product-detail.html?id=${item.id}" class="text-decoration-none text-dark fw-bold d-block">${item.name}</a>
                                        <button onclick="removeFromCart(${item.id})" class="btn btn-link text-danger p-0 text-decoration-none small mt-1"><i class="fa-solid fa-trash-can"></i> Xóa</button>
                                    </div>
                                </div>
                            </td>
                            <td class="fw-semibold">${formatCurrency(item.price)}</td>
                            <td>
                                <div class="input-group input-group-sm" style="width: 100px;">
                                    <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity(${item.id}, ${item.quantity}, -1, ${item.stock})">-</button>
                                    <input type="text" class="form-control text-center px-1" value="${item.quantity}" readonly>
                                    <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity(${item.id}, ${item.quantity}, 1, ${item.stock})">+</button>
                                </div>
                            </td>
                            <td class="text-end fw-bold">${formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    // Render summary
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% dummy tax
    const total = subtotal + tax;

    document.getElementById('cart-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('cart-tax').textContent = formatCurrency(tax);
    document.getElementById('cart-total').textContent = formatCurrency(total);
}

async function updateQuantity(productId, currentQty, change, stock) {
    const newQty = currentQty + change;
    
    if (newQty < 1) return; // Can't have 0 quantity, use remove instead
    if (newQty > stock) {
        alert('Không thể vượt quá số lượng có sẵn.');
        return;
    }

    try {
        await updateCartItemAPI(productId, newQty);
        await renderCartItems();
        if (typeof updateCartBadge === 'function') await updateCartBadge();
    } catch (e) {
        console.error("Failed to sync quantity to server", e);
        alert('Lỗi cập nhật số lượng: ' + e.message);
    }
}

async function removeFromCart(productId) {
    try {
        await removeCartItemAPI(productId);
        await renderCartItems();
        if (typeof updateCartBadge === 'function') await updateCartBadge();
    } catch (e) {
        console.error("Failed to remove item from server", e);
        alert('Lỗi xóa sản phẩm: ' + e.message);
    }
}

async function checkout() {
    const user = getCurrentUser();
    if (!user) {
        alert('Vui lòng đăng nhập để tiến hành thanh toán.');
        window.location.href = 'login.html';
        return;
    }

    const cart = await getCartFromServer();
    if (cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống.');
        return;
    }

    window.location.href = 'checkout.html';
}

async function processCheckout(event) {
    event.preventDefault();
    
    const user = getCurrentUser();
    if (!user) {
        alert('Vui lòng đăng nhập.');
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xử lý...';
    }

    try {
        const cart = await getCartFromServer();
        if (cart.length === 0) {
            alert('Giỏ hàng trống!');
            throw new Error("Cart is empty");
        }

        const paymentMethod = document.getElementById('paymentMethod').value;
        const address = document.getElementById('address').value;
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal * 1.08;
        
        await createOrderAPI({ items: cart, total: total });

        // Backend doesn't automatically clear cart on create order currently, so we remove manually.
        for (const item of cart) {
            try {
                await removeCartItemAPI(item.id);
            } catch(ex){}
        }

        if (typeof updateCartBadge === 'function') await updateCartBadge();
        
        // Show success and redirect
        document.getElementById('checkout-form').classList.add('d-none');
        document.getElementById('checkout-success').classList.remove('d-none');
    } catch (e) {
        alert('Lỗi khi thanh toán: ' + e.message);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Thanh toán';
        }
    }
}

// Order History Render
async function renderOrders() {
    const container = document.getElementById('orders-container');
    if (!container) return;

    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><br><span class="text-muted mt-2 d-inline-block">Đang tải đơn hàng...</span></div>';

    try {
        const allOrders = await getOrdersAPI();
        const userOrders = allOrders.filter(o => o.userId === user.id).sort((a,b) => b.id - a.id); // Or date if added later

        if (userOrders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 bg-white rounded shadow-sm">
                    <i class="fa-solid fa-box-open text-muted mb-3" style="font-size: 3rem;"></i>
                    <h5>Chưa có đơn hàng nào</h5>
                    <p class="text-muted">Bạn chưa đặt đơn hàng nào.</p>
                    <a href="products.html" class="btn btn-primary mt-2">Bắt đầu mua sắm</a>
                </div>
            `;
            return;
        }

        container.innerHTML = userOrders.map(order => `
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-light border-bottom border-light py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <span class="text-muted small d-block">Ngày đặt</span>
                        <span class="fw-bold">Hôm nay</span>
                    </div>
                    <div>
                        <span class="text-muted small d-block">Tổng tiền</span>
                        <span class="fw-bold">${formatCurrency(order.total)}</span>
                    </div>
                    <div>
                        <span class="text-muted small d-block">Mã đơn</span>
                        <span class="fw-bold">ORD#${order.id}</span>
                    </div>
                    <div>
                        <span class="badge ${order.status === 'pending' ? 'bg-warning' : (order.status === 'approved' ? 'bg-success' : 'bg-danger')}">${order.status === 'pending' ? 'Chờ xử lý' : (order.status === 'approved' ? 'Đã duyệt' : 'Đã hủy')}</span>
                    </div>
                </div>
                <div class="card-body p-0">
                    <ul class="list-group list-group-flush">
                        ${order.items.map(item => `
                            <li class="list-group-item p-3 d-flex align-items-center gap-3 border-light">
                                <div class="flex-grow-1">
                                    <h6 class="mb-0 fw-bold"><a href="product-detail.html?id=${item.productId}" class="text-decoration-none text-dark">${item.name}</a></h6>
                                    <span class="text-muted small">Qty: ${item.quantity}</span>
                                </div>
                                <div class="fw-bold">
                                    ${formatCurrency(item.price * item.quantity)}
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = '<div class="alert alert-danger text-center">Lỗi khi tải đơn hàng. Vui lòng thử lại.</div>';
    }
}
