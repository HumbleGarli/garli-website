// ==========================================
// SHOP.JS - Trang cửa hàng
// ==========================================

const ShopPage = {
    products: [],
    categories: [],
    filters: {
        category: '',
        sort: 'newest',
        search: ''
    },

    async init() {
        await this.loadData();
        this.renderFilters();
        this.renderProducts();
        this.setupEvents();
    },

    async loadData() {
        try {
            const res = await fetch(SiteConfig.getNoCacheUrl('data/products.json'));
            const data = await res.json();
            this.products = data.products.filter(p => p.active);
            this.categories = data.categories;
        } catch (e) {
            console.error('[Shop] Error loading products:', e);
        }
    },

    renderFilters() {
        const container = document.getElementById('shop-filters');
        if (!container) return;

        container.innerHTML = `
            <div class="glass-card bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm space-y-4">
                <!-- Category tabs - scrollable on mobile -->
                <div class="tab-container overflow-x-auto pb-2 -mb-2" id="category-tabs">
                    <div class="tab-indicator"></div>
                    <div class="flex gap-2 min-w-max">
                        <button data-category="" class="tab-btn filter-btn active whitespace-nowrap">Tất cả</button>
                        ${this.categories.map(c => `
                            <button data-category="${c.id}" class="tab-btn filter-btn whitespace-nowrap">${c.name}</button>
                        `).join('')}
                    </div>
                </div>
                <!-- Search and Sort -->
                <div class="flex flex-col sm:flex-row gap-3">
                    <input type="text" id="shop-search" placeholder="Tìm sản phẩm..." 
                        class="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d544c]">
                    <select id="shop-sort" class="px-4 py-2 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d544c]">
                        <option value="newest">Mới nhất</option>
                        <option value="price-asc">Giá tăng dần</option>
                        <option value="price-desc">Giá giảm dần</option>
                        <option value="popular">Bán chạy</option>
                    </select>
                </div>
            </div>
        `;

        // Initialize tab indicator
        setTimeout(() => this.initTabIndicator('category-tabs'), 0);
    },

    initTabIndicator(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const indicator = container.querySelector('.tab-indicator');
        const activeBtn = container.querySelector('.tab-btn.active');

        if (indicator && activeBtn) {
            this.moveIndicator(indicator, activeBtn, container);
        }
    },

    moveIndicator(indicator, btn, container) {
        // Get button position relative to its scrollable parent
        const btnRect = btn.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const scrollLeft = container.scrollLeft || 0;

        indicator.style.width = `${btn.offsetWidth}px`;
        indicator.style.height = `${btn.offsetHeight}px`;
        indicator.style.left = `${btn.offsetLeft}px`;
        indicator.style.top = `${btn.offsetTop}px`;
    },

    renderProducts() {
        const container = document.getElementById('products-grid');
        if (!container) return;

        let filtered = [...this.products];

        // Filter by category
        if (this.filters.category) {
            filtered = filtered.filter(p => p.category === this.filters.category);
        }

        // Filter by search
        if (this.filters.search) {
            const q = this.filters.search.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.tags.some(t => t.toLowerCase().includes(q))
            );
        }

        // Sort
        switch (this.filters.sort) {
            case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
            case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
            case 'popular': filtered.sort((a, b) => b.sold - a.sold); break;
            case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
            default: filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-gray-500 dark:text-gray-400">Không tìm thấy sản phẩm nào</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(p => this.renderProductCard(p)).join('');
    },

    renderProductCard(p) {
        const discount = Math.round((1 - p.price / p.originalPrice) * 100);
        const hasImage = p.image && !p.image.includes('default');

        return `
            <a href="/product?slug=${p.slug}" class="glass-card bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow flex flex-col h-full">
                <div class="relative aspect-[4/3] sm:aspect-[920/430] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                    ${hasImage
                ? `<img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">`
                : '<span class="text-4xl sm:text-5xl">📦</span>'
            }
                    ${p.featured ? '<span class="absolute top-2 left-2 bg-yellow-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">HOT</span>' : ''}
                    ${discount > 0 ? `<span class="absolute top-2 right-2 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">-${discount}%</span>` : ''}
                </div>
                <div class="p-3 sm:p-4 flex flex-col flex-1">
                    <span class="text-[10px] sm:text-xs text-[#0d544c] dark:text-[#4ade80] uppercase">${this.categories.find(c => c.id === p.category)?.name || p.category}</span>
                    <h3 class="font-semibold text-gray-800 dark:text-white mt-1 mb-1 sm:mb-2 line-clamp-2 text-sm sm:text-base group-hover:text-[#0d544c] transition-colors">${p.name}</h3>
                    <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 line-clamp-2 hidden sm:block">${p.description || ''}</p>
                    <div class="mt-auto">
                        <div class="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 mb-2 sm:mb-3">
                            <span class="text-base sm:text-xl font-bold text-[#0d544c] dark:text-[#4ade80]">${p.price.toLocaleString('vi-VN')}đ</span>
                            <span class="text-xs sm:text-sm text-gray-400 line-through">${p.originalPrice.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <span class="block w-full py-1.5 sm:py-2 bg-[#0d544c] text-white rounded-lg text-center text-xs sm:text-sm group-hover:bg-[#0a443e] transition-colors">Xem chi tiết</span>
                    </div>
                </div>
            </a>
        `;
    },

    setupEvents() {
        const container = document.getElementById('category-tabs');
        const indicator = container?.querySelector('.tab-indicator');

        // Category filter
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                if (indicator && container) {
                    this.moveIndicator(indicator, btn, container);
                    // Scroll button into view on mobile
                    btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }

                this.filters.category = btn.dataset.category;
                this.renderProducts();
            });
        });

        // Sort
        document.getElementById('shop-sort')?.addEventListener('change', (e) => {
            this.filters.sort = e.target.value;
            this.renderProducts();
        });

        // Search
        let searchTimeout;
        document.getElementById('shop-search')?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filters.search = e.target.value;
                this.renderProducts();
            }, 300);
        });

        // Recalculate indicator on resize
        window.addEventListener('resize', () => {
            const activeBtn = container?.querySelector('.tab-btn.active');
            if (indicator && activeBtn && container) {
                this.moveIndicator(indicator, activeBtn, container);
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => ShopPage.init());
