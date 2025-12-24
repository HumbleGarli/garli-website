# 📚 Hướng Dẫn Chi Tiết: Deploy & Sử Dụng Website

## Mục Lục
1. [Chuẩn bị](#1-chuẩn-bị)
2. [Push lên GitHub](#2-push-lên-github)
3. [Bật GitHub Pages](#3-bật-github-pages)
4. [Sử dụng Website](#4-sử-dụng-website)
5. [Quản trị nội dung](#5-quản-trị-nội-dung)
6. [Xử lý lỗi thường gặp](#6-xử-lý-lỗi-thường-gặp)

---

## 1. Chuẩn bị

### Yêu cầu
- Tài khoản GitHub (đăng ký miễn phí tại github.com)
- Git đã cài trên máy
- Code editor (VS Code khuyên dùng)

### Kiểm tra Git đã cài chưa
```bash
git --version
# Nếu hiện version là OK, nếu lỗi thì cài Git
```

### Cài Git (nếu chưa có)
- Windows: Tải từ https://git-scm.com/download/win
- Mac: `brew install git`
- Linux: `sudo apt install git`

---

## 2. Push lên GitHub

### Bước 2.1: Tạo Repository trên GitHub

1. Đăng nhập GitHub → Click dấu **+** góc phải → **New repository**
2. Điền thông tin:
   - Repository name: `garli-website` (hoặc tên bạn muốn)
   - Description: `Website cá nhân`
   - Chọn **Public** (bắt buộc để dùng GitHub Pages miễn phí)
   - **KHÔNG** tick "Add a README file"
3. Click **Create repository**

### Bước 2.2: Kết nối và Push code

Mở Terminal/Command Prompt trong thư mục project:

```bash
# 1. Khởi tạo Git (nếu chưa có)
git init

# 2. Thêm tất cả files
git add .

# 3. Commit lần đầu
git commit -m "feat: initial website"

# 4. Kết nối với GitHub (thay YOUR_USERNAME bằng username của bạn)
git remote add origin https://github.com/YOUR_USERNAME/garli-website.git

# 5. Đổi branch thành main
git branch -M main

# 6. Push lên GitHub
git push -u origin main
```

### Bước 2.3: Xác thực GitHub

Khi push lần đầu, GitHub sẽ yêu cầu đăng nhập:
- **Username**: Tên đăng nhập GitHub
- **Password**: Dùng **Personal Access Token** (không phải mật khẩu)

#### Tạo Personal Access Token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Note: `git-push`
4. Expiration: 90 days (hoặc No expiration)
5. Tick: `repo` (full control)
6. Generate token → **Copy và lưu lại** (chỉ hiện 1 lần!)

---

## 3. Bật GitHub Pages

### Bước 3.1: Vào Settings

1. Vào repository trên GitHub
2. Click tab **Settings** (góc phải)
3. Sidebar trái → **Pages**

### Bước 3.2: Cấu hình Pages

1. **Source**: Chọn `Deploy from a branch`
2. **Branch**: Chọn `main` và `/ (root)`
3. Click **Save**

### Bước 3.3: Đợi Deploy

- Đợi 1-3 phút
- Refresh trang Settings → Pages
- Sẽ thấy thông báo: "Your site is live at https://YOUR_USERNAME.github.io/garli-website/"
- Click link để xem website!

### Bước 3.4: Kiểm tra Deploy Status

1. Vào tab **Actions** trong repo
2. Xem workflow "pages build and deployment"
3. ✅ Xanh = thành công, ❌ Đỏ = lỗi

---

## 4. Sử dụng Website

### 4.1 Các trang Public

| Trang | URL | Mô tả |
|-------|-----|-------|
| Trang chủ | `/index.html` | Banner, sản phẩm nổi bật, bài viết mới |
| Cửa hàng | `/shop.html` | Danh sách sản phẩm, filter, search |
| Blog | `/blog.html` | Danh sách bài viết |
| Bài viết | `/post.html?slug=xxx` | Chi tiết bài viết |
| Tài nguyên | `/resources.html` | Download tài liệu |
| Giới thiệu | `/about.html` | Thông tin về website |

### 4.2 Tính năng chung

- **Dark Mode**: Click icon 🌙/☀️ trên header
- **Responsive**: Tự động điều chỉnh theo màn hình
- **Search**: Tìm kiếm trong từng trang
- **Filter**: Lọc theo danh mục

---

## 5. Quản trị nội dung

### Cách 1: Dùng GitHub Issues (Khuyên dùng - An toàn nhất)

**Không cần code, không cần token trên web!**

#### Thêm sản phẩm mới:
1. Vào repo → Tab **Issues** → **New Issue**
2. Chọn template **"🛒 Thêm sản phẩm mới"**
3. Điền form → **Submit new issue**
4. GitHub Actions tự động xử lý và deploy
5. Đợi 2-3 phút, website tự cập nhật!

#### Thêm bài viết mới:
1. Issues → New Issue → **"📝 Thêm bài viết mới"**
2. Điền tiêu đề, slug, nội dung markdown
3. Submit → Tự động tạo file .md và cập nhật index

#### Thêm tài nguyên:
1. Issues → New Issue → **"📦 Thêm tài nguyên mới"**
2. Điền thông tin → Submit

### Cách 2: Dùng Admin Panel (Cần token)

1. Truy cập `/admin.html`
2. Đăng nhập:
   - GitHub Username
   - Repository name
   - Personal Access Token (cần quyền `repo`)
3. Sử dụng các tab để quản lý:
   - **Sản phẩm**: Thêm/sửa/xóa products
   - **Bài viết**: Quản lý blog posts
   - **Tài nguyên**: Quản lý downloads
   - **Cấu hình**: Sửa thông tin site

⚠️ **Lưu ý bảo mật**: Token chỉ lưu trong session, tự xóa khi đóng tab hoặc sau 30 phút.

### Cách 3: Sửa trực tiếp trên GitHub

1. Vào repo → folder `data/`
2. Click file cần sửa (vd: `products.json`)
3. Click icon ✏️ (Edit)
4. Sửa nội dung JSON
5. Commit changes
6. Đợi deploy

---

## 6. Xử lý lỗi thường gặp

### Lỗi: Trang trắng khi mở file://

**Nguyên nhân**: Mở file trực tiếp, không qua server

**Giải pháp**: Chạy local server
```bash
npx serve .
# Mở http://localhost:3000
```

### Lỗi: 404 trên GitHub Pages

**Nguyên nhân**: Đường dẫn sai hoặc chưa deploy xong

**Giải pháp**:
1. Kiểm tra tab Actions xem deploy thành công chưa
2. Đợi 2-3 phút sau khi push
3. Kiểm tra URL đúng format: `https://username.github.io/repo-name/`

### Lỗi: CSS/JS không load

**Nguyên nhân**: Đường dẫn tương đối bị sai

**Giải pháp**: Đảm bảo tất cả đường dẫn không bắt đầu bằng `/`
```html
<!-- Đúng -->
<script src="js/app.js"></script>

<!-- Sai -->
<script src="/js/app.js"></script>
```

### Lỗi: Admin không lưu được

**Nguyên nhân**: Token không đủ quyền hoặc hết hạn

**Giải pháp**:
1. Tạo token mới với quyền `repo`
2. Kiểm tra username/repo name đúng
3. Đăng nhập lại

### Lỗi: GitHub Actions không chạy

**Nguyên nhân**: Workflow chưa được enable

**Giải pháp**:
1. Vào tab Actions
2. Click "I understand my workflows, go ahead and enable them"
3. Tạo issue mới để test

---

## 📞 Cần hỗ trợ?

1. Kiểm tra tab **Actions** để xem log lỗi
2. Mở **Issue** trong repo để hỏi
3. Xem **Console** trình duyệt (F12) để debug

---

## 🎉 Chúc mừng!

Bạn đã có một website hoàn chỉnh với:
- ✅ Giao diện đẹp, responsive
- ✅ Dark mode
- ✅ Admin panel không cần backend
- ✅ Tự động deploy khi push
- ✅ Quản lý nội dung qua GitHub Issues

**Happy Vibe Coding! 🚀**
