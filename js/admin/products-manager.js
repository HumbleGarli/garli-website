// ==========================================
// PRODUCTS-MANAGER.JS - CRUD Products
// ==========================================

const ProductsManager = {
    products: [],
    categories: [],
    currentSha: null,
    editingId: null,

    async init() {
        await this.loadData();
        this.render();
    },

    async loadData() {
        try {
            const { content, sha } = await GitHubAPI.getJson('data/products.json');
            this.products = content.products || [];
            this.categories = content.categories || [];
            this.currentSha = sha;
        } catch (e) {
            // Fallback to local fetch
            const res = await fetch('data/products.json');
            const data = await res.json();
            this.products = data.products || [];
            this.categories = data.categories || [];
        }
    },

    render() {
        const container = document.getElementById('tab-content');
        container.innerHTML = `
            <div class="space-y-4">
                <div class="flex flex-wrap gap-4 items-center justify-between">
                    <input type="text" id="product-search" placeholder="Tìm sản phẩm..."
                        class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <button id="add-product-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        + Thêm sản phẩm
                    </button>
                </div>
                <div id="products-list" class="space-y-2"></div>
            </div>
            <div id="product-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"></div>
            </div>
        `;
        this.renderList();
        this.setupEvents();
    },

    renderList(filter = '') {
        const list = document.getElementById('products-list');
        let filtered = this.products;
        
        if (filter) {
            const q = filter.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(q) || 
                p.category.toLowerCase().includes(q)
            );
        }

        if (!filtered.length) {
            list.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-8">Không có sản phẩm nào</p>';
            return;
        }

        list.innerHTML = filtered.map(p => `
            <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center text-2xl">📦</div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-gray-800 dark:text-white truncate">${p.name}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${p.category} • ${p.price.toLocaleString()}đ</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="px-2 py-1 text-xs rounded ${p.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}">${p.active ? 'Active' : 'Draft'}</span>
                    <button onclick="ProductsManager.edit(${p.id})" class="p-2 text-blue-600 hover:bg-blue-50 rounded">✏️</button>
                    <button onclick="ProductsManager.delete(${p.id})" class="p-2 text-red-600 hover:bg-red-50 rounded">🗑️</button>
                </div>
            </div>
        `).join('');
    },

    setupEvents() {
        document.getElementById('product-search')?.addEventListener('input', (e) => {
            this.renderList(e.target.value);
        });
        document.getElementById('add-product-btn')?.addEventListener('click', () => this.showForm());
    },

    showForm(product = null) {
        this.editingId = product?.id || null;
        const modal = document.getElementById('product-modal');
        const content = modal.querySelector('div');
        
        content.innerHTML = `
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">${product ? 'Sửa' : 'Thêm'} sản phẩm</h3>
                <form id="product-form" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên sản phẩm</label>
                            <input type="text" name="name" value="${product?.name || ''}" required class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá (VND)</label>
                            <input type="number" name="price" value="${product?.price || ''}" required class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá gốc</label>
                            <input type="number" name="originalPrice" value="${product?.originalPrice || ''}" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Danh mục</label>
                            <select name="category" required class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                ${this.categories.map(c => `<option value="${c.id}" ${product?.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trạng thái</label>
                            <select name="active" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                <option value="true" ${product?.active !== false ? 'selected' : ''}>Active</option>
                                <option value="false" ${product?.active === false ? 'selected' : ''}>Draft</option>
                            </select>
                        </div>
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
                            <textarea name="description" rows="3" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">${product?.description || ''}</textarea>
                        </div>
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (phân cách bằng dấu phẩy)</label>
                            <input type="text" name="tags" value="${product?.tags?.join(', ') || ''}" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ảnh sản phẩm</label>
                            <input type="file" id="product-image" accept="image/*" class="w-full">
                            <div id="image-preview" class="mt-2 ${product?.image ? '' : 'hidden'}">
                                <img src="${product?.image || ''}" class="h-32 rounded-lg object-cover">
                            </div>
                        </div>
                    </div>
                    <div id="form-error" class="text-red-500 text-sm hidden"></div>
                    <div class="flex gap-3 justify-end pt-4">
                        <button type="button" onclick="ProductsManager.closeForm()" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Hủy</button>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu</button>
                    </div>
                </form>
            </div>
        `;

        modal.classList.remove('hidden');
        document.getElementById('product-form').addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('product-image')?.addEventListener('change', (e) => this.handleImageChange(e));
    },

    async handleImageChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        const previewEl = document.getElementById('image-preview');
        previewEl.innerHTML = '<p class="text-gray-500">Đang xử lý ảnh...</p>';
        previewEl.classList.remove('hidden');

        try {
            // Validate trước
            const validation = ImageTools.validate(file);
            if (!validation.valid) {
                throw new Error(validation.errors.join('. '));
            }

            // Nén ảnh với config tối ưu
            const result = await ImageTools.compress(file, {
                maxWidth: 800,
                maxHeight: 800,
                quality: 0.8
            });
            
            const preview = await ImageTools.getPreview(result.file);
            
            previewEl.innerHTML = `
                <img src="${preview}" class="h-32 rounded-lg object-cover">
                <p class="text-xs text-gray-500 mt-1">
                    ${ImageTools.formatSize(result.originalSize)} → ${ImageTools.formatSize(result.compressedSize)} 
                    <span class="text-green-600">(giảm ${result.savings}%)</span>
                </p>
            `;
            
            // Lưu file đã nén để upload sau
            this.pendingImage = result.file;
        } catch (err) {
            previewEl.innerHTML = `<p class="text-red-500 text-sm">${err.message}</p>`;
            this.pendingImage = null;
        }
    },

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const errorEl = document.getElementById('form-error');
        
        const data = {
            name: form.name.value.trim(),
            slug: Validators.slugify(form.name.value),
            description: form.description.value.trim(),
            price: parseInt(form.price.value) || 0,
            originalPrice: parseInt(form.originalPrice.value) || parseInt(form.price.value),
            currency: 'VND',
            category: form.category.value,
            tags: form.tags.value.split(',').map(t => t.trim()).filter(Boolean),
            active: form.active.value === 'true',
            featured: false
        };

        // Validate
        const errors = Validators.product(data);
        if (errors.length) {
            errorEl.textContent = errors.join(', ');
            errorEl.classList.remove('hidden');
            return;
        }

        try {
            form.querySelector('button[type="submit"]').disabled = true;
            form.querySelector('button[type="submit"]').textContent = 'Đang lưu...';

            // Upload ảnh nếu có
            if (this.pendingImage) {
                const result = await GitHubAPI.uploadImage(this.pendingImage, 'assets/images/products');
                data.image = result.path;
                this.pendingImage = null;
            }

            if (this.editingId) {
                // Update
                const idx = this.products.findIndex(p => p.id === this.editingId);
                if (idx !== -1) {
                    data.id = this.editingId;
                    data.createdAt = this.products[idx].createdAt;
                    data.rating = this.products[idx].rating || 0;
                    data.reviewCount = this.products[idx].reviewCount || 0;
                    data.sold = this.products[idx].sold || 0;
                    data.image = data.image || this.products[idx].image;
                    this.products[idx] = data;
                }
            } else {
                // Create
                data.id = Math.max(0, ...this.products.map(p => p.id)) + 1;
                data.createdAt = new Date().toISOString().split('T')[0];
                data.rating = 0;
                data.reviewCount = 0;
                data.sold = 0;
                data.image = data.image || 'assets/images/products/default.jpg';
                this.products.push(data);
            }

            // Save to GitHub
            await GitHubAPI.updateJson('data/products.json', {
                products: this.products,
                categories: this.categories
            }, `${this.editingId ? 'Update' : 'Add'} product: ${data.name}`);

            this.closeForm();
            this.renderList();
            alert('Đã lưu thành công!');

        } catch (err) {
            errorEl.textContent = 'Lỗi: ' + err.message;
            errorEl.classList.remove('hidden');
        } finally {
            form.querySelector('button[type="submit"]').disabled = false;
            form.querySelector('button[type="submit"]').textContent = 'Lưu';
        }
    },

    closeForm() {
        document.getElementById('product-modal').classList.add('hidden');
        this.editingId = null;
        this.pendingImage = null;
    },

    edit(id) {
        const product = this.products.find(p => p.id === id);
        if (product) this.showForm(product);
    },

    async delete(id) {
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

        try {
            this.products = this.products.filter(p => p.id !== id);
            await GitHubAPI.updateJson('data/products.json', {
                products: this.products,
                categories: this.categories
            }, `Delete product #${id}`);
            
            this.renderList();
            alert('Đã xóa thành công!');
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    }
};

window.ProductsManager = ProductsManager;
