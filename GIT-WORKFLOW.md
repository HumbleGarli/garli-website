# Git Workflow - Vibe Coding Style

> Nhỏ – Nhanh – Chắc

## 🎯 Nguyên tắc

1. **Commit nhỏ** - Mỗi commit làm 1 việc rõ ràng
2. **Commit thường xuyên** - Không để code uncommitted quá lâu
3. **Message rõ ràng** - Đọc message biết ngay thay đổi gì

## 📝 Commit Message Format

```
<type>: <description>
```

### Types

| Type | Mô tả |
|------|-------|
| `feat` | Tính năng mới |
| `fix` | Sửa bug |
| `style` | UI/CSS changes |
| `refactor` | Refactor code |
| `docs` | Documentation |
| `chore` | Config, dependencies |

### Ví dụ tốt ✅

```bash
feat: add header/footer components
feat: render products page
feat: admin products CRUD
feat: image compression before upload
fix: upload image path
fix: mobile menu toggle
style: dark mode for admin
refactor: split admin into modules
docs: add README
chore: add .gitignore
```

### Ví dụ xấu ❌

```bash
update code
fix bug
wip
asdfasdf
changes
```

## 🔄 Workflow hàng ngày

```bash
# 1. Pull latest
git pull origin main

# 2. Code một feature nhỏ
# ... coding ...

# 3. Check changes
git status
git diff

# 4. Stage và commit
git add .
git commit -m "feat: add product filter"

# 5. Push
git push origin main
```

## 📦 Commit theo nhịp dự án này

```bash
# Phase 1: Setup
git commit -m "chore: init project structure"
git commit -m "feat: add base HTML template"
git commit -m "feat: add header/footer components"

# Phase 2: Public pages
git commit -m "feat: add app.js layout loader"
git commit -m "feat: render home page with banners"
git commit -m "feat: render shop page with filters"
git commit -m "feat: render blog page"
git commit -m "feat: render post page with markdown"
git commit -m "feat: add resources page"

# Phase 3: Data
git commit -m "feat: add sample products data"
git commit -m "feat: add sample posts data"
git commit -m "feat: add site config"

# Phase 4: Admin
git commit -m "feat: add GitHub API wrapper"
git commit -m "feat: admin login with token"
git commit -m "feat: admin products CRUD"
git commit -m "feat: admin resources CRUD"
git commit -m "feat: admin posts CRUD"
git commit -m "feat: image compression tools"

# Phase 5: Polish
git commit -m "fix: dark mode persistence"
git commit -m "fix: mobile responsive"
git commit -m "style: improve admin UI"
git commit -m "docs: add README"
```

## 🚀 Deploy

Push lên `main` branch → GitHub Pages tự động deploy.

```bash
git push origin main
# Đợi 1-2 phút
# Check: https://username.github.io/repo-name/
```

## 🔥 Tips

### Undo last commit (chưa push)
```bash
git reset --soft HEAD~1
```

### Sửa commit message vừa commit
```bash
git commit --amend -m "new message"
```

### Xem history đẹp
```bash
git log --oneline -10
```

### Tạo .gitignore
```bash
# Đã có sẵn trong repo
```

## 📋 Pre-push Checklist

- [ ] Chạy test-checklist.html - all passed
- [ ] Không có lỗi console
- [ ] Mobile view OK
- [ ] Dark mode OK
- [ ] Commit message đúng format
