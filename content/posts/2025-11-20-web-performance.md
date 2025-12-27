# Tối ưu performance cho website

Performance là yếu tố quan trọng ảnh hưởng đến trải nghiệm người dùng và SEO. Bài viết này sẽ hướng dẫn các kỹ thuật tối ưu hiệu quả nhất.

## Core Web Vitals

Google đánh giá website qua 3 chỉ số chính:

### 1. LCP (Largest Contentful Paint)
- Thời gian load phần tử lớn nhất
- Mục tiêu: < 2.5 giây

### 2. FID (First Input Delay)
- Thời gian phản hồi tương tác đầu tiên
- Mục tiêu: < 100ms

### 3. CLS (Cumulative Layout Shift)
- Độ ổn định layout
- Mục tiêu: < 0.1

## Kỹ thuật tối ưu

### Tối ưu hình ảnh

```html
<!-- Sử dụng format hiện đại -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>
```

### Lazy Loading

```javascript
// Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.src = entry.target.dataset.src;
      observer.unobserve(entry.target);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});
```

### Code Splitting

```javascript
// Dynamic import
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Caching

```javascript
// Service Worker caching
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

## Công cụ đo lường

1. **Lighthouse** - Audit tổng hợp
2. **PageSpeed Insights** - Phân tích từ Google
3. **WebPageTest** - Test chi tiết
4. **Chrome DevTools** - Debug realtime

## Checklist tối ưu

- [ ] Nén và tối ưu hình ảnh
- [ ] Minify CSS/JS
- [ ] Enable Gzip/Brotli compression
- [ ] Sử dụng CDN
- [ ] Lazy load images và videos
- [ ] Preload critical resources
- [ ] Optimize fonts loading
- [ ] Remove unused CSS/JS

## Kết luận

Tối ưu performance là quá trình liên tục. Hãy đo lường thường xuyên và cải thiện từng bước!
