// ==========================================
// PRODUCT.JS - Trang chi tiết sản phẩm
// ==========================================

const ProductPage = {
    product: null,
    categories: [],
    config: null,
    selectedPackage: null,

    async init() {
        const slug = new URLSearchParams(window.location.search).get('slug');
        if (!slug) {
            this.renderNotFound();
            return;
        }
        await this.loadConfig();
        await this.loadProduct(slug);
    },

    async loadConfig() {
        try {
            const res = await fetch('data/config.json');
            this.config = await res.json();
        } catch (e) {
            console.error('[Product] Error loading config:', e);
        }
    },

    async loadProduct(slug) {
        try {
            const res = await fetch('data/products.json');
            const data = await res.json();
            this.categories = data.categories;
            this.product = data.products.find(p => p.slug === slug);
            
            if (this.product) {
                document.title = `${this.product.name} - Garli`;
                this.render();
            } else {
                this.renderNotFound();
            }
        } catch (e) {
            console.error('[Product] Error:', e);
            this.renderNotFound();
        }
    },

    render() {
        const container = document.getElementById('product-detail');
        if (!container || !this.product) return;

        const p = this.product;
        const discount = Math.round((1 - p.price / p.originalPrice) * 100);
        const category = this.categories.find(c => c.id === p.category);
        const hasImage = p.image && !p.image.includes('default');
        const hasPackages = p.packages && p.packages.length > 0;

        // Set default selected package
        if (hasPackages && !this.selectedPackage) {
            this.selectedPackage = p.packages[0];
        }

        // Get display price (from selected package or default)
        const displayPrice = this.selectedPackage ? this.selectedPackage.price : p.price;
        const displayOriginalPrice = this.selectedPackage ? this.selectedPackage.originalPrice : p.originalPrice;
        const displayDiscount = displayOriginalPrice > displayPrice 
            ? Math.round((1 - displayPrice / displayOriginalPrice) * 100) 
            : 0;

        container.innerHTML = `
            <!-- Breadcrumb -->
            <nav class="mb-6 text-sm">
                <ol class="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <li><a href="index.html" class="hover:text-blue-600">Trang chủ</a></li>
                    <li><span class="mx-2">/</span></li>
                    <li><a href="shop.html" class="hover:text-blue-600">Cửa hàng</a></li>
                    <li><span class="mx-2">/</span></li>
                    <li class="text-gray-800 dark:text-white font-medium">${p.name}</li>
                </ol>
            </nav>

            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
                    <!-- Image -->
                    <div class="relative">
                        <div class="aspect-[920/430] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl overflow-hidden flex items-center justify-center">
                            ${hasImage 
                                ? `<img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover">` 
                                : '<span class="text-8xl">📦</span>'
                            }
                        </div>
                        ${p.featured ? '<span class="absolute top-4 left-4 bg-yellow-500 text-white text-sm px-3 py-1 rounded-lg font-medium">HOT</span>' : ''}
                        ${displayDiscount > 0 ? `<span class="absolute top-4 right-4 bg-red-500 text-white text-sm px-3 py-1 rounded-lg font-medium">-${displayDiscount}%</span>` : ''}
                    </div>

                    <!-- Info -->
                    <div class="flex flex-col">
                        <span class="text-sm text-blue-600 dark:text-blue-400 uppercase font-medium">${category?.name || p.category}</span>
                        <h1 class="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mt-2">${p.name}</h1>

                        <!-- Packages Selection -->
                        ${hasPackages ? `
                        <div class="mt-4">
                            <h3 class="font-semibold text-gray-800 dark:text-white mb-3">Chọn gói</h3>
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2" id="packages-container">
                                ${p.packages.map((pkg, idx) => `
                                    <button onclick="ProductPage.selectPackage(${idx})" 
                                        class="package-btn p-3 rounded-xl border-2 transition-all text-left ${this.selectedPackage?.name === pkg.name 
                                            ? 'border-[#0d544c] bg-[#0d544c]/10 dark:bg-[#0d544c]/20' 
                                            : 'border-gray-200 dark:border-gray-600 hover:border-[#0d544c]/50'}">
                                        <div class="font-medium text-gray-800 dark:text-white text-sm">${pkg.name}</div>
                                        <div class="text-[#0d544c] dark:text-[#4ade80] font-bold">${pkg.price.toLocaleString('vi-VN')}đ</div>
                                        ${pkg.originalPrice > pkg.price ? `<div class="text-xs text-gray-400 line-through">${pkg.originalPrice.toLocaleString('vi-VN')}đ</div>` : ''}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}

                        <!-- Price -->
                        <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl" id="price-display">
                            <div class="flex items-baseline gap-3">
                                <span class="text-3xl font-bold text-[#0d544c] dark:text-[#4ade80]">${displayPrice.toLocaleString('vi-VN')}đ</span>
                                ${displayOriginalPrice > displayPrice ? `<span class="text-xl text-gray-400 line-through">${displayOriginalPrice.toLocaleString('vi-VN')}đ</span>` : ''}
                            </div>
                            ${displayDiscount > 0 ? `<p class="text-sm text-green-600 mt-1">Tiết kiệm ${(displayOriginalPrice - displayPrice).toLocaleString('vi-VN')}đ (${displayDiscount}%)</p>` : ''}
                            ${this.selectedPackage?.description ? `<p class="text-sm text-gray-600 dark:text-gray-400 mt-2">${this.selectedPackage.description}</p>` : ''}
                        </div>

                        <!-- Description -->
                        <div class="mt-6">
                            <h3 class="font-semibold text-gray-800 dark:text-white mb-2">Mô tả sản phẩm</h3>
                            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">${p.description}</p>
                        </div>

                        ${p.content ? `
                        <!-- Detailed Content -->
                        <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <h3 class="font-semibold text-gray-800 dark:text-white mb-2">Chi tiết sản phẩm</h3>
                            <div class="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">${p.content}</div>
                        </div>
                        ` : ''}

                        <!-- Tags -->
                        ${p.tags?.length ? `
                            <div class="mt-4">
                                <div class="flex flex-wrap gap-2">
                                    ${p.tags.map(t => `<span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full">#${t}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Actions -->
                        <div class="mt-auto pt-6 space-y-3">
                            <a href="${this.config?.socialLinks?.zalo || 'https://zalo.me/0868074935'}" target="_blank" rel="noopener noreferrer"
                                class="flex items-center justify-center gap-2 w-full py-3 bg-[#0d544c] text-white rounded-xl font-semibold hover:bg-[#0a443e] transition-colors">
                                <svg class="w-6 h-6" viewBox="0 0 48 48" fill="currentColor">
                                    <path d="M12.5 42C8.08 42 4.5 38.42 4.5 34V14C4.5 9.58 8.08 6 12.5 6H35.5C39.92 6 43.5 9.58 43.5 14V34C43.5 38.42 39.92 42 35.5 42H12.5ZM15.5 18C14.67 18 14 18.67 14 19.5C14 20.33 14.67 21 15.5 21H20.5V31.5C20.5 32.33 21.17 33 22 33C22.83 33 23.5 32.33 23.5 31.5V21H28.5C29.33 21 30 20.33 30 19.5C30 18.67 29.33 18 28.5 18H15.5ZM32 18C31.17 18 30.5 18.67 30.5 19.5V31.5C30.5 32.33 31.17 33 32 33C32.83 33 33.5 32.33 33.5 31.5V19.5C33.5 18.67 32.83 18 32 18Z"/>
                                </svg>
                                Liên hệ mua hàng qua Zalo
                            </a>
                            <div class="flex gap-3">
                                ${this.config?.socialLinks?.facebook ? `
                                <a href="${this.config.socialLinks.facebook}" target="_blank" rel="noopener noreferrer"
                                    class="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    Facebook
                                </a>
                                ` : ''}
                                ${this.config?.socialLinks?.telegram ? `
                                <a href="${this.config.socialLinks.telegram}" target="_blank" rel="noopener noreferrer"
                                    class="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                                    Telegram
                                </a>
                                ` : ''}
                            </div>
                            <p class="text-center text-sm text-gray-500 dark:text-gray-400">
                                📞 Hotline: ${this.config?.phone || '+84 868 074 935'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Back button -->
            <div class="mt-6">
                <a href="shop.html" class="inline-flex items-center text-[#0d544c] dark:text-[#4ade80] hover:underline">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Quay lại cửa hàng
                </a>
            </div>
        `;
    },

    selectPackage(index) {
        if (!this.product?.packages?.[index]) return;
        this.selectedPackage = this.product.packages[index];
        this.render();
    },

    renderStars(rating) {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5;
        let stars = '';
        for (let i = 0; i < 5; i++) {
            if (i < full) {
                stars += '<span class="text-yellow-500">★</span>';
            } else if (i === full && half) {
                stars += '<span class="text-yellow-500">★</span>';
            } else {
                stars += '<span class="text-gray-300">★</span>';
            }
        }
        return stars;
    },

    renderNotFound() {
        const container = document.getElementById('product-detail');
        if (!container) return;

        container.innerHTML = `
            <div class="text-center py-16">
                <span class="text-6xl">😕</span>
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white mt-4">Không tìm thấy sản phẩm</h2>
                <p class="text-gray-600 dark:text-gray-400 mt-2">Sản phẩm này không tồn tại hoặc đã bị xóa</p>
                <a href="shop.html" class="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Quay lại cửa hàng
                </a>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => ProductPage.init());
