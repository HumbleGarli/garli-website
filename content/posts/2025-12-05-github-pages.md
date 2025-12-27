# Hướng dẫn deploy website lên GitHub Pages

GitHub Pages là dịch vụ hosting miễn phí của GitHub, cho phép bạn deploy website tĩnh một cách dễ dàng. Trong bài viết này, mình sẽ hướng dẫn các bạn từng bước deploy website lên GitHub Pages.

## Bước 1: Chuẩn bị repository

Đầu tiên, bạn cần có một repository trên GitHub chứa code website của bạn.

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

## Bước 2: Cấu hình GitHub Pages

1. Vào **Settings** của repository
2. Tìm mục **Pages** ở sidebar bên trái
3. Trong phần **Source**, chọn branch `main` và folder `/ (root)`
4. Click **Save**

## Bước 3: Chờ deploy

GitHub sẽ tự động build và deploy website của bạn. Quá trình này thường mất 1-2 phút.

Sau khi hoàn tất, website của bạn sẽ có địa chỉ:
```
https://username.github.io/repo-name/
```

## Lưu ý quan trọng

- GitHub Pages chỉ hỗ trợ website tĩnh (HTML, CSS, JS)
- Nếu dùng custom domain, cần tạo file `CNAME`
- Có thể dùng GitHub Actions để tự động deploy

## Kết luận

GitHub Pages là giải pháp tuyệt vời để host các website tĩnh miễn phí. Hy vọng bài viết này giúp ích cho bạn!
