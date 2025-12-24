// ==========================================
// HOME.JS - Trang chủ
// ==========================================

const HomePage = {
    async init() {
        const config = await this.loadConfig();
        if (config) {
            this.renderBanners(config.banners);
            this.renderFeatures(config.features);
        }
        await this.renderFeaturedProducts();
        await this.renderLatestPosts();
    },

    async loadConfig() {
        try {
            const res = await fetch('data/config.json');
            return await res.json();
        } catch (e) {
            console.error('[Home] Error loading config:', e);
            return null;
        }
    },

    renderBanners(banners) {
        const container = document.getElementById('banners-container');
        if (!container || !banners?.length) return;

        // Chỉ lọc banner có ảnh (không lọc theo active nữa)
        const validBanners = banners.filter(b => b.image);
        
        container.innerHTML = `
            <style>
                .banner-swiper .swiper-slide-active img {
                    animation: kenburns 4s ease-out forwards;
                }
                @keyframes kenburns {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }
            </style>
            <div class="swiper banner-swiper">
                <div class="swiper-wrapper">
                    ${validBanners.map(b => `
                        <div class="swiper-slide">
                            <a href="${b.link}" class="block relative h-64 md:h-96 rounded-xl overflow-hidden">
                                <img src="${b.image}" alt="${b.title || ''}" class="absolute inset-0 w-full h-full object-cover">
                                ${b.active !== false ? `
                                    <div class="absolute inset-0 bg-black/40"></div>
                                    <div class="absolute inset-0 flex items-center justify-center text-center p-8">
                                        <div>
                                            <h2 class="text-3xl md:text-5xl font-bold text-white mb-4">${b.title}</h2>
                                            <p class="text-lg md:text-xl text-white/80">${b.subtitle}</p>
                                        </div>
                                    </div>
                                ` : ''}
                            </a>
                        </div>
                    `).join('')}
                </div>
                <div class="swiper-pagination"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
            </div>
        `;

        // Init Swiper với autoplay 4 giây
        new Swiper('.banner-swiper', {
            loop: true,
            autoplay: { 
                delay: 4000,
                disableOnInteraction: false 
            },
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
        });
    },

    renderFeatures(features) {
        const container = document.getElementById('features-container');
        if (!container || !features?.length) return;

        const icons = {
            rocket: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>',
            shield: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>',
            support: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>'
        };

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                ${features.map(f => `
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm text-center">
                        <div class="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                ${icons[f.icon] || icons.rocket}
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">${f.title}</h3>
                        <p class="text-gray-600 dark:text-gray-400">${f.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    async renderFeaturedProducts() {
        const container = document.getElementById('featured-products');
        if (!container) return;

        try {
            const res = await fetch('data/products.json');
            const { products } = await res.json();
            const featured = products.filter(p => p.featured && p.active).slice(0, 4);

            container.innerHTML = `
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Sản phẩm nổi bật</h2>
                <div class="flex flex-wrap justify-center gap-6">
                    ${featured.map(p => `<div class="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]">${this.renderProductCard(p)}</div>`).join('')}
                </div>
                <div class="text-center mt-8">
                    <a href="shop.html" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Xem tất cả</a>
                </div>
            `;
        } catch (e) {
            console.error('[Home] Error loading products:', e);
        }
    },

    renderProductCard(p) {
        const discount = Math.round((1 - p.price / p.originalPrice) * 100);
        return `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden group">
                <div class="h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                    <span class="text-4xl">📦</span>
                </div>
                <div class="p-4">
                    <h3 class="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">${p.name}</h3>
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-lg font-bold text-blue-600 dark:text-blue-400">${p.price.toLocaleString('vi-VN')}đ</span>
                        <span class="text-sm text-gray-400 line-through">${p.originalPrice.toLocaleString('vi-VN')}đ</span>
                        <span class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">-${discount}%</span>
                    </div>
                    <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span class="text-yellow-500">★</span>
                        <span class="ml-1">${p.rating}</span>
                        <span class="mx-2">•</span>
                        <span>Đã bán ${p.sold}</span>
                    </div>
                </div>
            </div>
        `;
    },

    async renderLatestPosts() {
        const container = document.getElementById('latest-posts');
        if (!container) return;

        try {
            const res = await fetch('data/posts-index.json');
            const { posts } = await res.json();
            const latest = posts.slice(0, 3);

            container.innerHTML = `
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Bài viết mới</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${latest.map(p => `
                        <a href="post.html?slug=${p.slug}" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden group">
                            <div class="h-40 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center">
                                <span class="text-4xl">📝</span>
                            </div>
                            <div class="p-4">
                                <span class="text-xs text-blue-600 dark:text-blue-400 uppercase">${p.category}</span>
                                <h3 class="font-semibold text-gray-800 dark:text-white mt-1 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">${p.title}</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">${p.excerpt}</p>
                                <div class="flex items-center mt-3 text-xs text-gray-500 dark:text-gray-400">
                                    <span>${p.publishedAt}</span>
                                    <span class="mx-2">•</span>
                                    <span>${p.readTime} phút đọc</span>
                                </div>
                            </div>
                        </a>
                    `).join('')}
                </div>
                <div class="text-center mt-8">
                    <a href="blog.html" class="inline-block px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Xem tất cả bài viết</a>
                </div>
            `;
        } catch (e) {
            console.error('[Home] Error loading posts:', e);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => HomePage.init());
