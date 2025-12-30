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
            const res = await fetch('data/products.json');
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
            <div class="flex flex-wrap gap-4 items-center justify-between glass-card bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                <div class="tab-container" id="category-tabs">
                    <div class="tab-indicator"></div>
                    <button data-category="" class="tab-btn filter-btn active">Tất cả</button>
                    ${this.categories.map(c => `
                        <button data-category="${c.id}" class="tab-btn filter-btn">${c.name}</button>
                    `).join('')}
                </div>
                <div class="flex gap-3">
                    <input type="text" id="shop-search" placeholder="Tìm sản phẩm..." class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <select id="shop-sort" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
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
            this.moveIndicator(indicator, activeBtn);
        }
    },

    moveIndicator(indicator, btn) {
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
            <a href="product.html?slug=${p.slug}" class="glass-card bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow flex flex-col h-full">
                <div class="relative aspect-[920/430] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                    ${hasImage 
                        ? `<img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">` 
                        : '<span class="text-5xl">📦</span>'
                    }
                    ${p.featured ? '<span class="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">HOT</span>' : ''}
                    <span class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">-${discount}%</span>
                </div>
                <div class="p-4 flex flex-col flex-1">
                    <span class="text-xs text-blue-600 dark:text-blue-400 uppercase">${this.categories.find(c => c.id === p.category)?.name || p.category}</span>
                    <h3 class="font-semibold text-gray-800 dark:text-white mt-1 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3rem]">${p.name}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 min-h-[2.5rem]">${p.description || ''}</p>
                    <div class="mt-auto">
                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-xl font-bold text-blue-600 dark:text-blue-400">${p.price.toLocaleString('vi-VN')}đ</span>
                            <span class="text-sm text-gray-400 line-through">${p.originalPrice.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <span class="block w-full py-2 bg-blue-600 text-white rounded-lg text-center group-hover:bg-blue-700 transition-colors">Xem chi tiết</span>
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
                
                if (indicator) {
                    this.moveIndicator(indicator, btn);
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
            if (indicator && activeBtn) {
                this.moveIndicator(indicator, activeBtn);
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => ShopPage.init());
