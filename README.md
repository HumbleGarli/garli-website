# Garli Website

Static website với admin panel, deploy trên GitHub Pages.

## 🚀 Quick Start

```bash
# Clone repo
git clone https://github.com/HumbleGarli/garli-website.git
cd garli-website

# Chạy local server
npx serve .

# Mở browser: http://localhost:3000
```

## 📁 Cấu trúc

```
├── index.html, shop.html, blog.html...  # Trang public
├── admin.html                            # Admin panel
├── components/                           # Header, Footer
├── data/                                 # JSON data
├── content/posts/                        # Markdown bài viết
├── js/
│   ├── app.js                           # Core layout loader
│   ├── config.js                        # Site config
│   ├── api/github-api.js                # GitHub API wrapper
│   ├── pages/                           # Page scripts
│   └── admin/                           # Admin modules
└── assets/images/                        # Ảnh
```

## 🔐 Admin

1. Mở `/admin.html`
2. Nhập GitHub username, repo name, Personal Access Token
3. Token cần quyền `repo`

## License

MIT
