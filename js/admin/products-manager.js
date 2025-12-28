// ==========================================
// PRODUCTS-MANAGER.JS - CRUD Products
// ==========================================

const ProductsManager = {
    products: [],
    categories: [],
    currentSha: null,
    editingId: null,
    selectedIds: new Set(), // Track selected items for bulk delete

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
                    <div class="flex gap-2">
                        <button id="bulk-delete-products-btn" class="hidden px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                            🗑️ Xóa (<span id="selected-products-count">0</span>)
                        </button>
                        <button id="bulk-import-btn" class="px-4 py-2 border border-green-500 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20">
                            📥 Import hàng loạt
                        </button>
                        <button id="manage-categories-btn" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
                            📁 Danh mục
                        </button>
                        <button id="add-product-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            + Thêm sản phẩm
                        </button>
                    </div>
                </div>
                <div id="products-list" class="space-y-2"></div>
            </div>
            <div id="product-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"></div>
            </div>
            <div id="category-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"></div>
            </div>
            <div id="import-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"></div>
            </div>
        `;
        this.selectedIds.clear();
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
                <input type="checkbox" class="product-checkbox w-5 h-5 rounded border-gray-300 dark:border-gray-600" 
                    data-id="${p.id}" ${this.selectedIds.has(p.id) ? 'checked' : ''} onchange="ProductsManager.toggleSelect(${p.id})">
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

    toggleSelect(id) {
        if (this.selectedIds.has(id)) {
            this.selectedIds.delete(id);
        } else {
            this.selectedIds.add(id);
        }
        this.updateBulkDeleteBtn();
    },

    updateBulkDeleteBtn() {
        const btn = document.getElementById('bulk-delete-products-btn');
        const count = document.getElementById('selected-products-count');
        if (btn && count) {
            count.textContent = this.selectedIds.size;
            btn.classList.toggle('hidden', this.selectedIds.size === 0);
        }
    },

    async bulkDelete() {
        const count = this.selectedIds.size;
        if (count === 0) return;

        if (!confirm(`Bạn có chắc muốn xóa ${count} sản phẩm đã chọn?\n\n⚠️ Hành động này không thể hoàn tác!`)) return;

        try {
            const btn = document.getElementById('bulk-delete-products-btn');
            btn.disabled = true;
            btn.textContent = 'Đang xóa...';

            this.products = this.products.filter(p => !this.selectedIds.has(p.id));
            
            await GitHubAPI.updateJson('data/products.json', {
                products: this.products,
                categories: this.categories
            }, `Bulk delete ${count} products`);

            await this.loadData();
            this.selectedIds.clear();
            this.renderList();
            this.updateBulkDeleteBtn();
            
            alert(`✅ Đã xóa ${count} sản phẩm thành công!`);
        } catch (err) {
            alert('❌ Lỗi: ' + err.message + '\n\n💡 Thử nhấn Ctrl+Shift+R để refresh rồi thử lại.');
        } finally {
            const btn = document.getElementById('bulk-delete-products-btn');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '🗑️ Xóa (<span id="selected-products-count">0</span>)';
            }
        }
    },

    setupEvents() {
        document.getElementById('product-search')?.addEventListener('input', (e) => {
            this.renderList(e.target.value);
        });
        document.getElementById('add-product-btn')?.addEventListener('click', () => this.showForm());
        document.getElementById('manage-categories-btn')?.addEventListener('click', () => this.showCategoryManager());
        document.getElementById('bulk-delete-products-btn')?.addEventListener('click', () => this.bulkDelete());
        document.getElementById('bulk-import-btn')?.addEventListener('click', () => this.showImportModal());
    },

    // ==========================================
    // BULK IMPORT
    // ==========================================
    showImportModal() {
        const modal = document.getElementById('import-modal');
        const content = modal.querySelector('div');
        
        content.innerHTML = `
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">📥 Import sản phẩm hàng loạt</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Paste dữ liệu từ Excel hoặc nhập theo format bên dưới</p>
                
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
                    <p class="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Format (mỗi dòng 1 sản phẩm, phân cách bằng Tab hoặc |):</p>
                    <code class="text-xs text-blue-600 dark:text-blue-400">Tên | Giá | Giá gốc | Danh mục | Mô tả</code>
                    <p class="text-xs text-gray-500 mt-2">Ví dụ:</p>
                    <code class="text-xs text-gray-600 dark:text-gray-400 block">Youtube Premium | 45000 | 50000 | course | Gói 1 năm</code>
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Danh mục mặc định</label>
                    <select id="import-default-category" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        ${this.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dữ liệu sản phẩm</label>
                    <textarea id="import-data" rows="10" placeholder="Paste dữ liệu từ Excel vào đây...&#10;&#10;Hoặc nhập theo format:&#10;Tên | Giá | Giá gốc | Danh mục | Mô tả" 
                        class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white font-mono text-sm"></textarea>
                </div>

                <div id="import-preview" class="hidden mb-4">
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xem trước (<span id="import-count">0</span> sản phẩm):</p>
                    <div id="import-preview-list" class="max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-sm"></div>
                </div>

                <div id="import-error" class="text-red-500 text-sm mb-4 hidden"></div>

                <div class="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onclick="ProductsManager.closeImportModal()" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">Hủy</button>
                    <button onclick="ProductsManager.previewImport()" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Xem trước</button>
                    <button onclick="ProductsManager.executeImport()" id="import-btn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Import</button>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
    },

    parseImportData(text) {
        const lines = text.trim().split('\n').filter(line => line.trim());
        const products = [];
        const defaultCategory = document.getElementById('import-default-category')?.value || this.categories[0]?.id || 'course';
        
        for (const line of lines) {
            // Hỗ trợ cả Tab và | làm separator
            const parts = line.includes('\t') ? line.split('\t') : line.split('|');
            const [name, price, originalPrice, category, description] = parts.map(p => p?.trim());
            
            if (!name) continue;
            
            products.push({
                name,
                slug: Validators.slugify(name),
                price: parseInt(price) || 0,
                originalPrice: parseInt(originalPrice) || parseInt(price) || 0,
                category: category || defaultCategory,
                description: description || '',
                content: '',
                currency: 'VND',
                tags: [],
                active: true,
                featured: false,
                rating: 0,
                reviewCount: 0,
                sold: 0,
                image: 'assets/images/products/default.jpg',
                createdAt: new Date().toISOString().split('T')[0]
            });
        }
        
        return products;
    },

    previewImport() {
        const text = document.getElementById('import-data')?.value || '';
        const previewEl = document.getElementById('import-preview');
        const listEl = document.getElementById('import-preview-list');
        const countEl = document.getElementById('import-count');
        const errorEl = document.getElementById('import-error');
        
        if (!text.trim()) {
            errorEl.textContent = 'Vui lòng nhập dữ liệu sản phẩm';
            errorEl.classList.remove('hidden');
            previewEl.classList.add('hidden');
            return;
        }

        const products = this.parseImportData(text);
        
        if (products.length === 0) {
            errorEl.textContent = 'Không tìm thấy sản phẩm hợp lệ';
            errorEl.classList.remove('hidden');
            previewEl.classList.add('hidden');
            return;
        }

        errorEl.classList.add('hidden');
        countEl.textContent = products.length;
        listEl.innerHTML = products.map((p, i) => `
            <div class="flex justify-between py-1 border-b border-gray-200 dark:border-gray-600 last:border-0">
                <span class="text-gray-800 dark:text-white">${i + 1}. ${p.name}</span>
                <span class="text-gray-500">${p.price.toLocaleString()}đ - ${p.category}</span>
            </div>
        `).join('');
        previewEl.classList.remove('hidden');
        
        this.pendingImport = products;
    },

    async executeImport() {
        if (!this.pendingImport?.length) {
            alert('Vui lòng nhấn "Xem trước" trước khi import');
            return;
        }

        const btn = document.getElementById('import-btn');
        btn.disabled = true;
        btn.textContent = 'Đang import...';

        try {
            // Tạo ID mới cho từng sản phẩm
            let maxId = Math.max(0, ...this.products.map(p => p.id));
            for (const product of this.pendingImport) {
                product.id = ++maxId;
                this.products.push(product);
            }

            await GitHubAPI.updateJson('data/products.json', {
                products: this.products,
                categories: this.categories
            }, `Bulk import ${this.pendingImport.length} products`);

            await this.loadData();
            this.closeImportModal();
            this.renderList();
            
            alert(`✅ Đã import ${this.pendingImport.length} sản phẩm thành công!`);
            this.pendingImport = null;
        } catch (err) {
            document.getElementById('import-error').textContent = 'Lỗi: ' + err.message;
            document.getElementById('import-error').classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Import';
        }
    },

    closeImportModal() {
        document.getElementById('import-modal').classList.add('hidden');
        this.pendingImport = null;
    },

    // ==========================================
    // CATEGORY MANAGEMENT
    // ==========================================
    showCategoryManager() {
        const modal = document.getElementById('category-modal');
        const content = modal.querySelector('div');
        
        content.innerHTML = `
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Quản lý danh mục sản phẩm</h3>
                <div id="categories-list" class="space-y-2 mb-4"></div>
                <div class="flex gap-2">
                    <input type="text" id="new-category-name" placeholder="Tên danh mục mới" 
                        class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <button onclick="ProductsManager.addCategory()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Thêm</button>
                </div>
                <div id="category-error" class="text-red-500 text-sm mt-2 hidden"></div>
                <div class="flex justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onclick="ProductsManager.closeCategoryManager()" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">Đóng</button>
                </div>
            </div>
        `;
        
        this.renderCategories();
        modal.classList.remove('hidden');
    },

    renderCategories() {
        const list = document.getElementById('categories-list');
        if (!list) return;
        
        list.innerHTML = this.categories.map(c => `
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex items-center gap-2">
                    <span class="text-gray-800 dark:text-white font-medium">${c.name}</span>
                    <span class="text-xs text-gray-500">(${c.id})</span>
                </div>
                <button onclick="ProductsManager.deleteCategory('${c.id}')" class="text-red-500 hover:text-red-700 p-1">🗑️</button>
            </div>
        `).join('');
    },

    async addCategory() {
        const input = document.getElementById('new-category-name');
        const errorEl = document.getElementById('category-error');
        const name = input.value.trim();
        
        if (!name) {
            errorEl.textContent = 'Vui lòng nhập tên danh mục';
            errorEl.classList.remove('hidden');
            return;
        }

        // Generate ID from name
        const id = name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        if (this.categories.some(c => c.id === id)) {
            errorEl.textContent = 'Danh mục này đã tồn tại';
            errorEl.classList.remove('hidden');
            return;
        }

        try {
            this.categories.push({ id, name, icon: 'folder' });
            
            await GitHubAPI.updateJson('data/products.json', {
                products: this.products,
                categories: this.categories
            }, `Add category: ${name}`);

            await this.loadData();
            
            input.value = '';
            errorEl.classList.add('hidden');
            this.renderCategories();
            alert('Đã thêm danh mục!');
        } catch (err) {
            errorEl.textContent = 'Lỗi: ' + err.message;
            errorEl.classList.remove('hidden');
        }
    },

    async deleteCategory(id) {
        const category = this.categories.find(c => c.id === id);
        if (!category) return;

        // Check if any products use this category
        const productsInCategory = this.products.filter(p => p.category === id);
        if (productsInCategory.length > 0) {
            alert(`Không thể xóa! Có ${productsInCategory.length} sản phẩm đang dùng danh mục này.`);
            return;
        }

        if (!confirm(`Xác nhận xóa danh mục "${category.name}"?`)) return;

        try {
            this.categories = this.categories.filter(c => c.id !== id);
            
            await GitHubAPI.updateJson('data/products.json', {
                products: this.products,
                categories: this.categories
            }, `Delete category: ${category.name}`);

            await this.loadData();
            this.renderCategories();
            alert('Đã xóa danh mục!');
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    },

    closeCategoryManager() {
        document.getElementById('category-modal').classList.add('hidden');
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
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả ngắn (hiển thị ở danh sách)</label>
                            <textarea name="description" rows="2" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">${product?.description || ''}</textarea>
                        </div>
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nội dung chi tiết (hiển thị ở trang sản phẩm)</label>
                            <textarea name="content" rows="5" placeholder="Mô tả đầy đủ về sản phẩm, tính năng, hướng dẫn sử dụng..." class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">${product?.content || ''}</textarea>
                        </div>
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (phân cách bằng dấu phẩy)</label>
                            <input type="text" name="tags" value="${product?.tags?.join(', ') || ''}" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ảnh sản phẩm</label>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">📐 Kích thước khuyến nghị: 920 x 430px (tỷ lệ 2.14:1)</p>
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
            content: form.content.value.trim(),
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
                    data.content = data.content || this.products[idx].content || '';
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

            // Reload data để lấy SHA mới (tránh lỗi SHA mismatch khi save tiếp)
            await this.loadData();

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
            
            // Reload data để lấy SHA mới
            await this.loadData();
            
            this.renderList();
            alert('Đã xóa thành công!');
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    }
};

window.ProductsManager = ProductsManager;
