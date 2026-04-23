# 🐾 PetShop - Web Bán Đồ Thú Cưng

## 1. Mô tả web
PetShop là một ứng dụng web thương mại điện tử chuyên cung cấp các sản phẩm dành cho thú cưng (như thức ăn, đồ chơi, phụ kiện, v.v.). Hệ thống cung cấp trải nghiệm mua sắm trực tuyến thuận tiện cho khách hàng, đồng thời tích hợp hệ thống quản lý toàn diện (dashboard) dành cho nhân viên và quản trị viên (Admin) để quản lý sản phẩm, danh mục, đơn hàng và khách hàng.

## 2. Các công nghệ sử dụng
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla), LocalStorage (để lưu trữ Token xác thực).
- **Backend**: Node.js, Express.js.
- **Cơ sở dữ liệu**: MySQL.
- **Xác thực**: JSON Web Token (JWT).
- **Công cụ kiểm thử API**: Postman.
- **Khác**: Quản lý file upload (multer), mã hóa mật khẩu (bcrypt).

---

## 3. Các Use Case & Đặc Tả Use Case

### 3.1. Danh sách các tác nhân (Actors)
1. **Khách hàng (Customer)**: Người dùng truy cập hệ thống để xem và mua sản phẩm. Có thể là khách vãng lai hoặc đã đăng ký tài khoản.
2. **Nhân viên (Staff)**: Người hỗ trợ quản lý sản phẩm, đơn hàng, và xem báo cáo.
3. **Quản trị viên (Admin)**: Người có toàn quyền trên hệ thống, quản lý tài khoản, phân quyền nhân viên, và cấu hình hệ thống.

### 3.2. Đặc tả các Use Case

#### UC01: Đăng nhập
- **Tên Use Case**: Đăng nhập
- **Tác nhân**: Khách hàng, Nhân viên, Quản trị viên
- **Mô tả**: Cho phép người dùng đăng nhập vào hệ thống để sử dụng các chức năng theo phân quyền.
- **Tiền điều kiện**: Người dùng đã có tài khoản trên hệ thống.
- **Hậu điều kiện**: Phiên làm việc (session/token) được tạo ra. Người dùng được chuyển hướng về trang chủ hoặc trang quản trị.
- **Các luồng xử lý (Luồng chính)**:
  1. Người dùng nhập username và password.
  2. Bấm "Đăng nhập".
  3. Hệ thống kiểm tra thông tin.
  4. Hệ thống cấp JWT token và đăng nhập thành công.
- **Luồng thay thế**: 
  - Sai thông tin: Hệ thống báo lỗi "Sai tài khoản hoặc mật khẩu".

#### UC02: Quản lý Giỏ Hàng
- **Tên Use Case**: Quản lý Giỏ Hàng
- **Tác nhân**: Khách hàng
- **Mô tả**: Khách hàng thêm, sửa, hoặc xóa sản phẩm khỏi giỏ hàng.
- **Tiền điều kiện**: Hệ thống có sẵn sản phẩm.
- **Hậu điều kiện**: Số lượng/sản phẩm trong giỏ hàng được cập nhật (lưu trực tiếp trong Database thông qua API).
- **Các luồng xử lý**:
  1. Khách hàng chọn sản phẩm và bấm "Thêm vào giỏ".
  2. Hệ thống cập nhật giỏ hàng.
  3. Khách hàng có thể thay đổi số lượng hoặc xóa sản phẩm trong trang "Giỏ hàng".
- **Luồng thay thế**:
  - Hết hàng trong kho: Hệ thống báo lỗi "Số lượng sản phẩm không đủ".

#### UC03: Đặt Hàng (Checkout)
- **Tên Use Case**: Đặt Hàng (Checkout)
- **Tác nhân**: Khách hàng
- **Mô tả**: Khách hàng tiến hành đặt mua các sản phẩm trong giỏ hàng.
- **Tiền điều kiện**: Khách hàng đã đăng nhập và có sản phẩm trong giỏ hàng.
- **Hậu điều kiện**: Đơn hàng mới được tạo với trạng thái `pending`, giỏ hàng trống, và kho hàng bị trừ tạm thời số lượng sản phẩm tương ứng.
- **Các luồng xử lý**:
  1. Khách hàng xem lại giỏ hàng và chọn thanh toán.
  2. Điền thông tin giao hàng.
  3. Bấm "Đặt hàng".
  4. Hệ thống tạo đơn hàng và thông báo thành công.
- **Luồng thay thế**:
  - Số lượng kho không đủ: Hệ thống báo lỗi và hủy quá trình tạo đơn.

#### UC04: Quản lý Sản Phẩm (Thêm/Sửa/Xóa)
- **Tên Use Case**: Quản lý Sản Phẩm
- **Tác nhân**: Quản trị viên, Nhân viên
- **Mô tả**: Thêm mới, cập nhật thông tin (giá, tên, ảnh, số lượng) hoặc xóa sản phẩm.
- **Tiền điều kiện**: Tác nhân đã đăng nhập và có quyền `ADMIN` hoặc `STAFF`.
- **Hậu điều kiện**: Dữ liệu sản phẩm trên DB được cập nhật.
- **Các luồng xử lý**:
  1. Tác nhân vào trang quản lý Sản phẩm.
  2. Chọn "Thêm mới" hoặc "Sửa" một sản phẩm.
  3. Điền các thông tin (Tên, Giá, Ảnh, Danh mục, Số lượng tồn).
  4. Bấm "Lưu".
  5. Hệ thống lưu vào cơ sở dữ liệu và hiển thị danh sách mới.
- **Luồng thay thế**:
  - Thiếu thông tin bắt buộc: Hệ thống báo lỗi yêu cầu điền đầy đủ.

#### UC05: Phê duyệt / Hủy Đơn Hàng
- **Tên Use Case**: Phê duyệt / Hủy Đơn Hàng
- **Tác nhân**: Quản trị viên, Nhân viên
- **Mô tả**: Đổi trạng thái đơn hàng từ `pending` sang `approved` (duyệt) hoặc `cancelled` (hủy).
- **Tiền điều kiện**: Tác nhân đã đăng nhập (`ADMIN`/`STAFF`), và có đơn hàng trong hệ thống.
- **Hậu điều kiện**: Trạng thái đơn hàng thay đổi. Nếu đơn bị hủy, số lượng kho được hoàn trả.
- **Các luồng xử lý**:
  1. Tác nhân vào danh sách Đơn hàng.
  2. Chọn một đơn hàng `pending`.
  3. Bấm "Duyệt" hoặc "Hủy".
  4. Hệ thống cập nhật trạng thái đơn hàng.
- **Luồng thay thế**: Không có.

#### UC06: Quản lý Người Dùng
- **Tên Use Case**: Quản lý Người Dùng
- **Tác nhân**: Quản trị viên
- **Mô tả**: Quản trị viên xem, phân quyền (`STAFF`/`USER`), khóa (ban) hoặc xóa tài khoản.
- **Tiền điều kiện**: Đăng nhập quyền `ADMIN`.
- **Hậu điều kiện**: Thông tin/trạng thái người dùng được cập nhật.
- **Các luồng xử lý**:
  1. Vào trang Quản lý Người dùng.
  2. Chọn sửa một người dùng.
  3. Thay đổi vai trò hoặc trạng thái (ví dụ: ban).
  4. Lưu lại.

---

## 4. Các API Của Hệ Thống

*Mặc định Base URL: `http://127.0.0.1:8000/api`*

### 4.1. Xác Thực (Auth)

| Tên API | Method | Endpoint | Auth | Request (Body/Query/Params) | Response / Ghi chú |
|---------|--------|----------|------|-----------------------------|-------------------|
| Đăng nhập | POST | `/auth/login` | Guest | Body: `{ username, password }` | Trả về JWT (`access_token`). |
| Đăng ký | POST | `/auth/register` | Guest | Body: `{ username, password, email, fullName }` | Đăng ký tài khoản khách hàng mới. |
| Quên mật khẩu | POST | `/auth/forgot-password` | Guest | Body: `{ email }` | Cấp lại mật khẩu mới qua phản hồi. |

### 4.2. Người Dùng (Users)

| Tên API | Method | Endpoint | Auth | Request (Body/Query/Params) | Response / Ghi chú |
|---------|--------|----------|------|-----------------------------|-------------------|
| Lấy thông tin bản thân | GET | `/users/me` | User, Staff, Admin | None | Trả về thông tin user đang đăng nhập. |
| Lấy danh sách users | GET | `/users/` | Admin, Staff | None | Trả về toàn bộ danh sách users. |
| Cập nhật user | PUT | `/users/:id` | Admin, Staff | Params: `id`<br>Body: `{ role, status }` | Thay đổi vai trò / trạng thái của user. |
| Xóa user | DELETE | `/users/:id` | Admin | Params: `id` | Xóa user khỏi hệ thống. |

### 4.3. Danh Mục & Sản Phẩm (Categories & Products)

| Tên API | Method | Endpoint | Auth | Request (Body/Query/Params) | Response / Ghi chú |
|---------|--------|----------|------|-----------------------------|-------------------|
| Lấy danh sách danh mục | GET | `/categories/` | Guest | None | Trả về danh sách danh mục. |
| Thêm danh mục mới | POST | `/categories/` | Admin | Body: `{ name, description }` | Tạo mới một danh mục. |
| Lấy danh sách sản phẩm | GET | `/products/` | Guest | None | Trả về danh sách sản phẩm. |
| Tìm kiếm sản phẩm | GET | `/products/search` | Guest | Query: `?q=keyword` | Tìm kiếm sản phẩm theo tên hoặc mô tả. |
| Xem chi tiết sản phẩm | GET | `/products/:id` | Guest | Params: `id` | Trả về chi tiết của một sản phẩm. |
| Thêm sản phẩm mới | POST | `/products/` | Admin, Staff | Body: `{ name, price, categoryId, stock, ... }` | Thêm sản phẩm mới. |
| Upload ảnh sản phẩm | POST | `/upload/:productId` | Admin, Staff | Params: `productId`<br>Body: `multipart/form-data` | Upload hình ảnh cho sản phẩm. |

### 4.4. Đơn Hàng (Orders)

| Tên API | Method | Endpoint | Auth | Request (Body/Query/Params) | Response / Ghi chú |
|---------|--------|----------|------|-----------------------------|-------------------|
| Lấy danh sách đơn hàng | GET | `/orders/` | User, Staff, Admin | None | User chỉ thấy đơn của mình, Staff/Admin thấy toàn cục. |
| Tạo đơn hàng mới | POST | `/orders/` | User | Body: `{ items, shippingAddress... }` | Tạo đơn mới, giảm số lượng trong kho. |
| Duyệt/Hủy đơn hàng | PUT | `/orders/:id/approve` | Admin, Staff | Params: `id`<br>Body: `{ status: 'approved' / 'cancelled' }` | Cập nhật status của đơn hàng. |

### 4.5. Giỏ Hàng (Cart)

| Tên API | Method | Endpoint | Auth | Request (Body/Query/Params) | Response / Ghi chú |
|---------|--------|----------|------|-----------------------------|-------------------|
| Lấy giỏ hàng | GET | `/cart/` | User | None | Lấy danh sách sản phẩm trong giỏ của User. |
| Thêm vào giỏ hàng | POST | `/cart/add` | User | Body: `{ productId, quantity }` | Thêm hoặc đồng bộ số lượng sản phẩm vào giỏ. |
| Sửa số lượng | PUT | `/cart/:productId` | User | Params: `productId`<br>Body: `{ quantity }` | Cập nhật số lượng sản phẩm trong giỏ. |
| Xóa khỏi giỏ hàng | DELETE | `/cart/:productId` | User | Params: `productId` | Xóa sản phẩm khỏi giỏ. |

### 4.6. Báo Cáo (Reports)

| Tên API | Method | Endpoint | Auth | Request (Body/Query/Params) | Response / Ghi chú |
|---------|--------|----------|------|-----------------------------|-------------------|
| Lấy thống kê tổng quan | GET | `/reports/dashboard` | Admin, Staff | None | Lấy thống kê số người dùng, doanh thu, đơn hàng. |

---

## 5. Hướng dẫn Khởi động MySQL Workbench
*(Hoặc dùng XAMPP / phpMyAdmin, nhưng nếu dùng MySQL Workbench làm máy khách, các bước như sau)*

1. Mở ứng dụng **MySQL Workbench**.
2. Tại màn hình chính, nhấn vào dấu **+** cạnh chữ **MySQL Connections** để tạo kết nối mới, hoặc nhấn vào một Connection đã có sẵn (VD: `Local instance 3306`).
3. Điền thông tin kết nối (mặc định của MySQL local):
   - **Hostname**: `127.0.0.1`
   - **Port**: `3306`
   - **Username**: `root` (hoặc username tương ứng của bạn)
   - **Password**: Bấm "Store in Vault..." để điền mật khẩu của MySQL.
4. Bấm **Test Connection** để kiểm tra, nếu báo `Successfully made the MySQL connection` là thành công. Bấm **OK** để lưu.
5. Click đúp vào kết nối vừa tạo để mở không gian làm việc.
6. Hệ thống Backend Node.js sẽ tự động tạo Schema `petshop` và các bảng dữ liệu khi khởi động server nhờ cơ chế đồng bộ của ORM/Database.

---

## 6. Hướng dẫn Khởi động Server

1. **Chuẩn bị Database**: 
   - Đảm bảo MySQL Server đang chạy (thông qua MySQL Workbench hoặc XAMPP Control Panel).
   - Đảm bảo file `.env` trong thư mục gốc đã cấu hình đúng thông tin kết nối (ví dụ: `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`).

2. **Cài đặt thư viện**:
   Mở terminal tại thư mục gốc của dự án (cùng cấp với `package.json`), chạy lệnh:
   ```bash
   npm install
   ```

3. **Chạy Server**:
   Để chạy server cho mục đích phát triển (sẽ tự reload nếu có thay đổi code, dùng nodemon):
   ```bash
   npm run dev //
   ```
   Hoặc chạy môi trường thật (production):
   ```bash
   npm start
   ```
node backend/server.js
4. **Kiểm tra**:
   - Mở trình duyệt hoặc Postman, truy cập `http://127.0.0.1:8000/api/products/`
   - Nếu trả về danh sách JSON hợp lệ hoặc mảng rỗng `[]`, nghĩa là Server đã kết nối Database thành công và đang hoạt động tốt.
   - Để mở giao diện web, bạn có thể vào thư mục `frontend/` và dùng Live Server mở các file `.html` (như `index.html`).