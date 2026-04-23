// admin.js - Logic for the admin pages
const currentUserStr = localStorage.getItem("currentUser") || localStorage.getItem("petshop_current_user");
const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

if (!currentUser) {
    window.location.href = "login.html";
} else {
    const role = currentUser.role.toUpperCase();
    if (role !== "ADMIN" && role !== "STAFF") {
        window.location.href = "index.html";
    }
}
function checkAdmin() {
    const userStr = localStorage.getItem('currentUser') || localStorage.getItem('petshop_current_user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) {
        window.location.href = 'login.html';
        return null;
    }

    if (user.role == 'CUSTOMER') {
        window.location.href = 'index.html';
        return null;
    }

    return user;
}

function renderAdminSidebar(activePage) {
    const currentUserStr = localStorage.getItem("currentUser") || localStorage.getItem("petshop_current_user");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    const sidebar = document.getElementById('adminSidebar');
    if (!sidebar || !currentUser) return;

    const role = currentUser.role;

    let navItems = '';

    if (role == 'ADMIN') {
        navItems = `
            <li class="nav-item mb-1">
                <a href="admin-dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active bg-primary-custom' : 'link-dark'}">
                    <i class="fa-solid fa-gauge me-2"></i> Bảng điều khiển
                </a>
            </li>
            <li class="nav-item mb-1">
                <a href="admin-users.html" class="nav-link ${activePage === 'users' ? 'active bg-primary-custom' : 'link-dark'}">
                    <i class="fa-solid fa-users me-2"></i> Tài khoản
                </a>
            </li>
            <li class="nav-item mb-1">
                <a href="admin-products.html" class="nav-link ${activePage === 'products' ? 'active bg-primary-custom' : 'link-dark'}">
                    <i class="fa-solid fa-tags me-2"></i> Sản phẩm
                </a>
            </li>
            <li class="nav-item mb-1">
                <a href="admin-categories.html" class="nav-link ${activePage === 'categories' ? 'active bg-primary-custom' : 'link-dark'}">
                    <i class="fa-solid fa-layer-group me-2"></i> Danh mục
                </a>
            </li>
            <li class="nav-item mb-1">
                <a href="admin-orders.html" class="nav-link ${activePage === 'orders' ? 'active bg-primary-custom' : 'link-dark'}">
                    <i class="fa-solid fa-box-open me-2"></i> Đơn hàng
                </a>
            </li>
        `;
    } else if (role == 'STAFF') {
        navItems = `
            <li class="nav-item mb-1">
                <a href="admin-dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active bg-primary-custom' : 'link-dark'}">
                    <i class="fa-solid fa-gauge me-2"></i> Bảng điều khiển
                </a>
            </li>
            <li class="nav-item mb-1">
                <a href="admin-users.html" class="nav-link ${activePage === 'users' ? 'active bg-primary-custom' : 'link-dark'}">
                    <i class="fa-solid fa-users me-2"></i> Tài khoản
                </a>
            </li>
            <li class="nav-item mb-1">
                <a href="admin-products.html" class="nav-link ${activePage === 'products' ? 'active bg-primary-custom' : 'link-dark'}">
                    <i class="fa-solid fa-tags me-2"></i> Sản phẩm
                </a>
            </li>
            <li class="nav-item mb-1">
                <a href="admin-categories.html" class="nav-link ${activePage === 'categories' ? 'active bg-primary-custom' : 'link-dark'}">
                    <i class="fa-solid fa-layer-group me-2"></i> Danh mục
                </a>
            </li>
            <li class="nav-item mb-1">
                <a href="admin-orders.html" class="nav-link ${activePage === 'orders' ? 'active bg-primary-custom' : 'link-dark'}">
                    <i class="fa-solid fa-box-open me-2"></i> Đơn hàng
                </a>
            </li>
        `;
    }

    sidebar.innerHTML = `
        <div class="d-flex flex-column flex-shrink-0 p-3 bg-white shadow-sm h-100" style="width: 280px;">
            <a href="index.html" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none border-bottom pb-3 w-100">
                <i class="fa-solid fa-paw text-primary-custom fs-4 me-2"></i>
                <span class="fs-5 fw-bold text-primary-custom">Quản trị PetShop</span>
            </a>
            <hr>
            <ul class="nav nav-pills flex-column mb-auto">
                ${navItems}
            </ul>
        </div>
    `;
}

function updateTopHeaderProfile() {
    const currentUserStr = localStorage.getItem("currentUser") || localStorage.getItem("petshop_current_user");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    if (currentUser) {
        const profileImg = document.querySelector('.admin-header .profile-img');
        const profileName = document.querySelector('.admin-header .profile-name');

        if (profileImg) profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName)}&background=random`;
        if (profileName) profileName.innerText = currentUser.role;
    }
}

// ---------------- DASHBOARD ----------------
async function renderDashboard() {
    const user = checkAdmin();
    if (!user) return;
    renderAdminSidebar('dashboard');
    updateTopHeaderProfile();

    try {
        const dashboardData = await getDashboardStatsAPI();

        document.getElementById('stat-products').innerText = dashboardData.stats.products;
        document.getElementById('stat-users').innerText = dashboardData.stats.users;
        document.getElementById('stat-orders').innerText = dashboardData.stats.orders;
        document.getElementById('stat-revenue').innerText = formatCurrency(dashboardData.stats.revenue);

        // Render Charts
        renderCharts(dashboardData.charts);

        // Recent orders table
        const tbody = document.getElementById('recent-orders-body');
        if (!dashboardData.recentOrders || dashboardData.recentOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Chưa có đơn hàng nào</td></tr>';
            return;
        }

        tbody.innerHTML = dashboardData.recentOrders.map(o => {
            const dateStr = new Date(o.date).toLocaleDateString('vi-VN');
            return `
                <tr>
                    <td class="ps-4 fw-semibold">#${o.id}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(o.userName)}&background=random&size=30" class="rounded-circle me-2">
                            ${o.userName}
                        </div>
                    </td>
                    <td class="text-truncate" style="max-width: 150px;" title="${o.itemsSummary}">${o.itemsSummary || 'N/A'}</td>
                    <td class="fw-bold">${formatCurrency(o.total)}</td>
                    <td><span class="badge ${o.status === 'pending' ? 'bg-warning text-dark' : (o.status === 'approved' ? 'bg-success' : 'bg-danger')} rounded-pill">${o.status === 'pending' ? 'Chờ xử lý' : (o.status === 'approved' ? 'Đã duyệt' : 'Đã hủy')}</span></td>
                    <td>${dateStr}</td>
                    <td class="pe-4"><a href="admin-orders.html" class="btn btn-sm btn-light border btn-icon"><i class="fa-solid fa-chevron-right"></i></a></td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error("Dashboard error", error);
    }
}

function renderCharts(chartsData) {
    if (!document.getElementById('revenueChart') || !document.getElementById('categoryChart')) return;

    const ctxRev = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctxRev, {
        type: 'line',
        data: {
            labels: chartsData.revenue.labels,
            datasets: [{
                label: 'Doanh thu (VNĐ)',
                data: chartsData.revenue.data,
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#0d6efd',
                pointBorderWidth: 2,
                pointRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
                x: { grid: { display: false } }
            }
        }
    });

    const ctxCat = document.getElementById('categoryChart').getContext('2d');
    new Chart(ctxCat, {
        type: 'doughnut',
        data: {
            labels: chartsData.category.labels,
            datasets: [{
                data: chartsData.category.data,
                backgroundColor: [
                    '#0d6efd', '#198754', '#ffc107', '#dc3545', '#0dcaf0', '#6f42c1'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
            }
        }
    });
}

// ---------------- PRODUCTS ----------------
function renderAdminProducts() {
    const user = checkAdmin();
    if (!user) return;
    renderAdminSidebar('products');
    loadProductsTable();
    populateCategoryDropdowns();

    if (user.role === 'STAFF') {
        const addBtn = document.querySelector('button[data-bs-target="#productModal"]');
        if (addBtn) addBtn.style.display = 'none';
        
        const saveBtn = document.querySelector('#productForm button[type="submit"]');
        if (saveBtn) saveBtn.style.display = 'none';
    }
}

async function loadProductsTable() {
    const tbody = document.getElementById('admin-products-body');
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>';

    try {
        const [products, categories] = await Promise.all([getProductsAPI(), getCategoriesAPI()]);

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Chưa có sản phẩm nào. Hãy thêm mới!</td></tr>';
            return;
        }

        const user = checkAdmin();
        tbody.innerHTML = products.map((p, index) => {
            const catName = categories.find(c => c.id === p.categoryId)?.name || `ID: ${p.categoryId}`;
            
            const actionButtons = user && user.role === 'STAFF' ? `
                    <button class="btn btn-sm btn-outline-secondary me-1" disabled><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-outline-danger" disabled><i class="fa-solid fa-trash"></i></button>
            ` : `
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="editProduct(${p.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>
            `;
            return `
            <tr>
                <td>${p.id}</td>
                <td><img src="${p.image || ''}" width="40" height="40" class="rounded object-fit-cover"></td>
                <td class="fw-semibold">${p.name}</td>
                <td>${catName}</td>
                <td>${formatCurrency(p.price)}</td>
                <td>${p.stock}</td>
                <td>
                    ${actionButtons}
                </td>
            </tr>
        `}).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Lỗi tải sản phẩm</td></tr>';
    }
}

async function populateCategoryDropdowns() {
    try {
        const cats = await getCategoriesAPI();
        let sel = document.getElementById('prodCategory');
        if (sel) {
            sel.innerHTML = '<option value="">-- Không chọn --</option>' + cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }
    } catch (e) {
        console.error(e);
    }
}

async function saveProduct(event) {
    event.preventDefault();
    const id = document.getElementById('prodId').value;
    const name = document.getElementById('prodName').value;
    const price = parseFloat(document.getElementById('prodPrice').value);
    const catVal = document.getElementById('prodCategory').value;
    const categoryId = catVal ? parseInt(catVal) : null;
    const stock = parseInt(document.getElementById('prodStock').value);
    const desc = document.getElementById('prodDesc').value;
    let image = document.getElementById('prodImage').value || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&w=300&q=80';
    
    let productId = id;
    let productData = { name, price, categoryId, stock, desc, image };

    try {
        // Create/Update the product FIRST so we have a valid ID
        if (id) {
            await updateProductAPI(id, productData);
        } else {
            const res = await createProductAPI(productData);
            productId = res.id;
        }

        // Now, if an image is queued for upload, send it with the exact productId to the API
        const fileInput = document.getElementById('prodImageFile');
        if (fileInput && fileInput.files.length > 0) {
            const formData = new FormData();
            formData.append('image', fileInput.files[0]);
            // productId is now in the URL

            const submitBtn = document.querySelector('#productForm button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang tải ảnh...';
            submitBtn.disabled = true;

            const uploadRes = await fetchAPI(`/upload/${productId}`, {
                method: 'POST',
                body: formData
            });

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }

        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('productModal'));
        modal.hide();
        loadProductsTable();
    } catch (e) {
        alert("Lỗi lưu sản phẩm: " + e.message);
    }
}

async function editProduct(id) {
    try {
        const p = await getProductByIdAPI(id);
        
        document.getElementById('prodId').value = p.id;
        document.getElementById('prodName').value = p.name;
        document.getElementById('prodPrice').value = p.price;
        document.getElementById('prodCategory').value = p.categoryId;
        document.getElementById('prodStock').value = p.stock;
        document.getElementById('prodDesc').value = p.desc;
        document.getElementById('prodImage').value = p.image || '';
        document.getElementById('prodImageFile').value = '';
        const previewContainer = document.getElementById('prodImagePreviewContainer');
        const previewImage = document.getElementById('prodImagePreview');
        if (p.image) {
            previewContainer.style.display = 'block';
            previewImage.src = p.image;
        } else {
            previewContainer.style.display = 'none';
        }
        document.getElementById('productModalLabel').innerText = 'Sửa sản phẩm';

        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('productModal'));
        modal.show();
    } catch (e) {
        alert("Không tìm thấy sản phẩm");
    }
}

async function deleteProduct(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) return;
    try {
        const res = await deleteProductAPI(id);
        if (res && res.detail) alert(res.detail);
        loadProductsTable();
    } catch (e) {
        alert("Lỗi khi xóa sản phẩm: " + e.message);
    }
}

function resetProductForm() {
    document.getElementById('productForm').reset();
    document.getElementById('prodId').value = '';
    document.getElementById('prodImage').value = '';
    document.getElementById('prodImagePreviewContainer').style.display = 'none';
    document.getElementById('prodImagePreview').src = '';
    document.getElementById('productModalLabel').innerText = 'Thêm sản phẩm';
}

function previewProductImage(input) {
    const previewContainer = document.getElementById('prodImagePreviewContainer');
    const previewImage = document.getElementById('prodImagePreview');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewContainer.style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// ---------------- ORDERS ----------------
function renderAdminOrders() {
    const user = checkAdmin();
    if (!user) return;
    renderAdminSidebar('orders');
    loadOrdersTable();
}

async function loadOrdersTable() {
    const tbody = document.getElementById('admin-orders-body');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>';

    try {
        const orders = await getOrdersAPI();

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Không tìm thấy đơn hàng.</td></tr>';
            return;
        }

        const sortedOrders = orders.sort((a, b) => b.id - a.id);

        tbody.innerHTML = sortedOrders.map(o => `
            <tr>
                <td class="fw-semibold">#${o.id}</td>
                <td>Hôm nay</td>
                <td>User ID: ${o.userId}</td>
                <td>${formatCurrency(o.total)}</td>
                <td>
                    <select class="form-select form-select-sm status-select ${o.status === 'pending' ? 'bg-warning text-dark' : (o.status === 'approved' ? 'bg-success text-white' : 'bg-danger text-white')}" 
                            onchange="updateOrderStatus(this, '${o.id}', this.value)" style="width: 120px;">
                        <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="approved" ${o.status === 'approved' ? 'selected' : ''}>Approved</option>
                        <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="viewOrderDetails('${o.id}')"><i class="fa-solid fa-eye"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Lỗi tải dữ liệu.</td></tr>';
    }
}

async function updateOrderStatus(selectEl, id, newStatus) {
    try {
        await updateOrderStatusAPI(id, newStatus);
        
        if (selectEl) {
            selectEl.className = `form-select form-select-sm status-select ${newStatus === 'pending' ? 'bg-warning text-dark' : (newStatus === 'approved' ? 'bg-success text-white' : 'bg-danger text-white')}`;
        }

        loadOrdersTable(); // Refresh table
    } catch (e) {
        alert("Lỗi khi cập nhật trạng thái đơn hàng: " + e.message);
    }
}

async function viewOrderDetails(id) {
    const content = document.getElementById('orderDetailsContent');
    content.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>';
    
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('orderModal'));
    modal.show();

    try {
        const orders = await getOrdersAPI();
        const order = orders.find(o => o.id == id);
        if (!order) {
            content.innerHTML = '<div class="alert alert-danger">Không tìm thấy đơn hàng</div>';
            return;
        }

        let approverHtml = 'Chưa duyệt / Không có';
        if (order.approvedBy) {
            approverHtml = `<br>ID: ${order.approvedById}<br>Tên: ${order.approvedBy}`;
        }

        content.innerHTML = `
            <div class="mb-3">
                <strong>Mã đơn:</strong> #${order.id}<br>
                <strong>Ngày:</strong> Hôm nay<br>
                <strong>Trạng thái:</strong> <span class="badge ${order.status === 'pending' ? 'bg-warning text-dark' : (order.status === 'approved' ? 'bg-success' : 'bg-danger')}">${order.status === 'pending' ? 'Chờ xử lý' : (order.status === 'approved' ? 'Đã duyệt' : 'Đã hủy')}</span><br>
                <strong>Nhân viên xử lý:</strong> ${approverHtml}
            </div>
            <table class="table table-sm">
                <thead><tr><th>Sản phẩm</th><th>SL</th><th class="text-end">Giá</th></tr></thead>
                <tbody>
                    ${(order.items || []).map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td class="text-end">${formatCurrency(i.price)}</td></tr>`).join('')}
                </tbody>
                <tfoot>
                    <tr><th colspan="2" class="text-end">Tổng tiền:</th><th class="text-end">${formatCurrency(order.total)}</th></tr>
                </tfoot>
            </table>
        `;
    } catch (e) {
        content.innerHTML = '<div class="alert alert-danger">Lỗi tải dữ liệu đơn hàng</div>';
    }
}

// ---------------- USERS ----------------
function renderAdminUsers() {
    const user = checkAdmin();
    if (!user) return;
    renderAdminSidebar('users');
    loadUsersTable();

    if (user.role === 'STAFF') {
        const addBtn = document.querySelector('button[data-bs-target="#userModal"]');
        if (addBtn) addBtn.style.display = 'none';
        
        const saveBtn = document.querySelector('#userForm button[type="submit"]');
        if (saveBtn) saveBtn.style.display = 'none';
    }
}

async function loadUsersTable() {
    const tbody = document.getElementById('admin-users-body');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>';

    try {
        const users = await getUsersAPI();
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Không tìm thấy người dùng.</td></tr>';
            return;
        }

        const currentUser = getCurrentUser();

        tbody.innerHTML = users.map(u => {
            let badgeClass = 'bg-secondary';
            if (u.role === 'ADMIN') badgeClass = 'bg-primary';
            if (u.role === 'STAFF') badgeClass = 'bg-warning text-dark';

            const rowClass = u.status === 'banned' ? 'table-danger' : '';
            const isSelf = currentUser && u.id === currentUser.id;

            const isStaff = currentUser && currentUser.role === 'STAFF';
            const actionBtns = isStaff ? `
                        <button class="btn btn-sm btn-outline-secondary me-1" disabled><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-sm ${u.status === 'banned' ? 'btn-success' : 'btn-danger'} disabled">
                            ${u.status === 'banned' ? 'Mở khóa' : 'Khóa'}
                        </button>
                        <button class="btn btn-sm btn-outline-danger ms-1 disabled"><i class="fa-solid fa-trash"></i></button>
            ` : `
                        <button class="btn btn-sm btn-outline-secondary me-1" onclick="editUser(${u.id})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-sm ${u.status === 'banned' ? 'btn-success' : 'btn-danger'} ${isSelf ? 'disabled' : ''}" 
                                onclick="handleBanUnban(${u.id}, '${u.status}')">
                            ${u.status === 'banned' ? 'Mở khóa' : 'Khóa'}
                        </button>
                        <button class="btn btn-sm btn-outline-danger ms-1 ${isSelf ? 'disabled' : ''}" onclick="deleteUser(${u.id})"><i class="fa-solid fa-trash"></i></button>
            `;

            return `
                <tr class="${rowClass}">
                    <td>${u.id}</td>
                    <td class="fw-semibold">${u.fullName || '—'}</td>
                    <td>${u.email || '—'}</td>
                    <td>${u.username}</td>
                    <td><span class="badge ${badgeClass}">${u.role}</span></td>
                    <td>${u.status === 'banned' ? (u.banReason || 'Đã khóa') : '—'}</td>
                    <td>
                        ${actionBtns}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Lỗi tải dữ liệu người dùng</td></tr>';
    }
}

function resetUserForm() {
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userUsername').readOnly = false;
    document.getElementById('userModalLabel').innerText = 'Thêm người dùng';
    const pwdInput = document.getElementById('userPassword');
    if (pwdInput) pwdInput.parentElement.style.display = 'block';
}

async function saveUser(event) {
    event.preventDefault();
    const id = document.getElementById('userId').value;
    const fullName = document.getElementById('userFullName').value;
    const email = document.getElementById('userEmail').value;
    const username = document.getElementById('userUsername').value;
    const role = document.getElementById('userRole').value;
    const password = document.getElementById('userPassword').value;

    if (!id) {
        try {
            await createUserAPI({ fullName, email, username, password, role });
            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('userModal'));
            modal.hide();
            loadUsersTable();
        } catch (e) {
            alert("Lỗi khi tạo người dùng: " + e.message);
        }
        return;
    }

    try {
        await updateUserAPI(id, { fullName, role });

        const currentUser = getCurrentUser();
        if (currentUser && id == currentUser.id) {
            currentUser.fullName = fullName;
            currentUser.role = role;
            localStorage.setItem('petshop_current_user', JSON.stringify(currentUser));
        }

        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('userModal'));
        modal.hide();
        loadUsersTable();
    } catch (e) {
        alert("Lỗi khi lưu người dùng: " + e.message);
    }
}

async function editUser(id) {
    try {
        const users = await getUsersAPI();
        const u = users.find(user => user.id == id);
        if (!u) return;

        document.getElementById('userId').value = u.id;
        document.getElementById('userFullName').value = u.fullName || '';
        document.getElementById('userEmail').value = u.email || '';
        document.getElementById('userUsername').value = u.username;
        document.getElementById('userUsername').readOnly = true; // Cannot edit username
        
        const pwdInput = document.getElementById('userPassword');
        if (pwdInput) pwdInput.parentElement.style.display = 'none'; // Hide password field
        
        document.getElementById('userRole').value = u.role;

        document.getElementById('userModalLabel').innerText = 'Sửa người dùng';

        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('userModal'));
        modal.show();
    } catch(e) {
        alert("Lỗi tải thông tin user");
    }
}

async function deleteUser(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) return;
    try {
        const res = await deleteUserAPI(id);
        if (res && res.detail) alert(res.detail);
        loadUsersTable();
    } catch(e) {
        alert("Lỗi khi xóa người dùng: " + e.message);
    }
}

// Global variable to store context for ban modal
let currentBanUserId = null;

async function handleBanUnban(id, currentStatus) {
    if (currentStatus === 'banned') {
        if (!confirm('Bạn có chắc chắn muốn mở khóa người dùng này không?')) return;
        try {
            await updateUserAPI(id, { status: 'active' });
            loadUsersTable();
        } catch (e) {
            alert("Lỗi khi mở khóa: " + e.message);
        }
    } else {
        currentBanUserId = id;
        document.getElementById('banReasonForm').reset();
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('banModal'));
        modal.show();
    }
}

async function submitBanReason(event) {
    event.preventDefault();
    if (!currentBanUserId) return;

    // Reason note logic omitted due to schema limits but could be saved locally or dropped
    try {
        await updateUserAPI(currentBanUserId, { status: 'banned' });
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('banModal'));
        modal.hide();
        loadUsersTable();
    } catch (e) {
        alert("Lỗi khi khóa: " + e.message);
    }
}

// ---------------- CATEGORIES ----------------
function renderAdminCategories() {
    const user = checkAdmin();
    if (!user) return;
    renderAdminSidebar('categories');
    loadCategoriesTable();
    
    if (user.role === 'STAFF') {
        const addBtn = document.querySelector('button[data-bs-target="#categoryModal"]');
        if (addBtn) addBtn.style.display = 'none';
        
        const saveBtn = document.querySelector('#categoryForm button[type="submit"]');
        if (saveBtn) saveBtn.style.display = 'none';
    }
}

async function loadCategoriesTable() {
    const tbody = document.getElementById('admin-categories-body');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>';

    try {
        const categories = await getCategoriesAPI();
        
        if (categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Không tìm thấy danh mục.</td></tr>';
            return;
        }

        const user = checkAdmin();
        tbody.innerHTML = categories.map(c => {
            const actionButtons = user && user.role === 'STAFF' ? `
                    <button class="btn btn-sm btn-outline-secondary me-1" disabled><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-outline-danger" disabled><i class="fa-solid fa-trash"></i></button>
            ` : `
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="editCategory(${c.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${c.id})"><i class="fa-solid fa-trash"></i></button>
            `;
            return `
            <tr>
                <td>${c.id}</td>
                <td class="fw-bold">${c.name}</td>
                <td>${c.desc || ''}</td>
                <td>
                    ${actionButtons}
                </td>
            </tr>
        `}).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Lỗi khi tải danh mục</td></tr>';
    }
}

async function saveCategory(event) {
    event.preventDefault();
    const id = document.getElementById('catId').value;
    const name = document.getElementById('catName').value;
    const desc = document.getElementById('catDesc').value;

    const data = { name, desc };

    try {
        if (id) {
            await updateCategoryAPI(id, data);
        } else {
            await createCategoryAPI(data);
        }

        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('categoryModal'));
        modal.hide();
        loadCategoriesTable();
        // Also refresh product dropdowns if we are on products page (just in case)
        if (typeof populateCategoryDropdowns === 'function') populateCategoryDropdowns();
    } catch (e) {
        alert("Lỗi khi lưu danh mục: " + e.message);
    }
}

async function editCategory(id) {
    try {
        const categories = await getCategoriesAPI();
        const c = categories.find(cat => cat.id == id);
        if (!c) return;

        document.getElementById('catId').value = c.id;
        document.getElementById('catName').value = c.name;
        document.getElementById('catDesc').value = c.desc || '';
        document.getElementById('categoryModalLabel').innerText = 'Sửa danh mục';

        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('categoryModal'));
        modal.show();
    } catch (e) {
        alert("Lỗi khi tải thông tin danh mục");
    }
}

async function deleteCategory(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này? (Các sản phẩm thuộc danh mục sẽ không bị xóa tự động)")) return;
    try {
        const res = await deleteCategoryAPI(id);
        if (res && res.detail) alert(res.detail);
        loadCategoriesTable();
    } catch (e) {
        alert("Lỗi khi xóa danh mục: " + e.message);
    }
}

function resetCategoryForm() {
    document.getElementById('categoryForm').reset();
    document.getElementById('catId').value = '';
    document.getElementById('categoryModalLabel').innerText = 'Thêm danh mục';
}
