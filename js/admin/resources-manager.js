// ==========================================
// RESOURCES-MANAGER.JS - CRUD Resources
// ==========================================

const ResourcesManager = {
    resources: [],
    types: [],
    editingId: null,

    async init() {
        await this.loadData();
        this.render();
    },

    async loadData() {
        try {
            const { content } = await GitHubAPI.getJson('data/resources.json');
            this.resources = content.resources || [];
            this.types = content.types || [];
        } catch (e) {
            const res = await fetch('data/resources.json');
            const data = await res.json();
            this.resources = data.resources || [];
            this.types = data.types || [];
        }
    },

    render() {
        const container = document.getElementById('tab-content');
        container.innerHTML = `
            <div class="space-y-4">
                <div class="flex flex-wrap gap-4 items-center justify-between">
                    <input type="text" id="resource-search" placeholder="Tìm tài nguyên..."
                        class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <div class="flex gap-2">
                        <button id="manage-types-btn" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
                            📁 Loại
                        </button>
                        <button id="add-resource-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            + Thêm tài nguyên
                        </button>
                    </div>
                </div>
                <div id="resources-list" class="space-y-2"></div>
            </div>
            <div id="resource-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"></div>
            </div>
            <div id="type-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"></div>
            </div>
        `;
        this.renderList();
        this.setupEvents();
    },

    renderList(filter = '') {
        const list = document.getElementById('resources-list');
        let filtered = this.resources;
        
        if (filter) {
            const q = filter.toLowerCase();
            filtered = filtered.filter(r => r.title.toLowerCase().includes(q) || r.type.toLowerCase().includes(q));
        }

        if (!filtered.length) {
            list.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-8">Không có tài nguyên nào</p>';
            return;
        }

        list.innerHTML = filtered.map(r => `
            <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center text-2xl">📄</div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-gray-800 dark:text-white truncate">${r.title}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${r.type} • ${r.format.toUpperCase()} • ${r.downloadCount.toLocaleString()} downloads</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="px-2 py-1 text-xs rounded ${r.free ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}">${r.free ? 'Free' : 'Premium'}</span>
                    <button onclick="ResourcesManager.edit(${r.id})" class="p-2 text-blue-600 hover:bg-blue-50 rounded">✏️</button>
                    <button onclick="ResourcesManager.delete(${r.id})" class="p-2 text-red-600 hover:bg-red-50 rounded">🗑️</button>
                </div>
            </div>
        `).join('');
    },

    setupEvents() {
        document.getElementById('resource-search')?.addEventListener('input', (e) => this.renderList(e.target.value));
        document.getElementById('add-resource-btn')?.addEventListener('click', () => this.showForm());
        document.getElementById('manage-types-btn')?.addEventListener('click', () => this.showTypeManager());
    },

    // ==========================================
    // TYPE MANAGEMENT
    // ==========================================
    showTypeManager() {
        const modal = document.getElementById('type-modal');
        const content = modal.querySelector('div');
        
        content.innerHTML = `
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Quản lý loại tài nguyên</h3>
                <div id="types-list" class="space-y-2 mb-4"></div>
                <div class="flex gap-2">
                    <input type="text" id="new-type-name" placeholder="Tên loại mới" 
                        class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <button onclick="ResourcesManager.addType()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Thêm</button>
                </div>
                <div id="type-error" class="text-red-500 text-sm mt-2 hidden"></div>
                <div class="flex justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onclick="ResourcesManager.closeTypeManager()" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">Đóng</button>
                </div>
            </div>
        `;
        
        this.renderTypes();
        modal.classList.remove('hidden');
    },

    renderTypes() {
        const list = document.getElementById('types-list');
        if (!list) return;
        
        list.innerHTML = this.types.map(t => `
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex items-center gap-2">
                    <span class="text-gray-800 dark:text-white font-medium">${t.name}</span>
                    <span class="text-xs text-gray-500">(${t.id})</span>
                </div>
                <button onclick="ResourcesManager.deleteType('${t.id}')" class="text-red-500 hover:text-red-700 p-1">🗑️</button>
            </div>
        `).join('');
    },

    async addType() {
        const input = document.getElementById('new-type-name');
        const errorEl = document.getElementById('type-error');
        const name = input.value.trim();
        
        if (!name) {
            errorEl.textContent = 'Vui lòng nhập tên loại';
            errorEl.classList.remove('hidden');
            return;
        }

        const id = name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        if (this.types.some(t => t.id === id)) {
            errorEl.textContent = 'Loại này đã tồn tại';
            errorEl.classList.remove('hidden');
            return;
        }

        try {
            this.types.push({ id, name, icon: 'folder' });
            
            await GitHubAPI.updateJson('data/resources.json', {
                resources: this.resources,
                types: this.types
            }, `Add type: ${name}`);

            await this.loadData();
            
            input.value = '';
            errorEl.classList.add('hidden');
            this.renderTypes();
            alert('Đã thêm loại!');
        } catch (err) {
            errorEl.textContent = 'Lỗi: ' + err.message;
            errorEl.classList.remove('hidden');
        }
    },

    async deleteType(id) {
        const type = this.types.find(t => t.id === id);
        if (!type) return;

        const resourcesOfType = this.resources.filter(r => r.type === id);
        if (resourcesOfType.length > 0) {
            alert(`Không thể xóa! Có ${resourcesOfType.length} tài nguyên đang dùng loại này.`);
            return;
        }

        if (!confirm(`Xác nhận xóa loại "${type.name}"?`)) return;

        try {
            this.types = this.types.filter(t => t.id !== id);
            
            await GitHubAPI.updateJson('data/resources.json', {
                resources: this.resources,
                types: this.types
            }, `Delete type: ${type.name}`);

            await this.loadData();
            this.renderTypes();
            alert('Đã xóa loại!');
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    },

    closeTypeManager() {
        document.getElementById('type-modal').classList.add('hidden');
    },

    showForm(resource = null) {
        this.editingId = resource?.id || null;
        const modal = document.getElementById('resource-modal');
        const content = modal.querySelector('div');
        
        content.innerHTML = `
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">${resource ? 'Sửa' : 'Thêm'} tài nguyên</h3>
                <form id="resource-form" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiêu đề</label>
                            <input type="text" name="title" value="${resource?.title || ''}" required class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loại</label>
                            <select name="type" required class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                ${this.types.map(t => `<option value="${t.id}" ${resource?.type === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
                            <select name="format" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                <option value="pdf" ${resource?.format === 'pdf' ? 'selected' : ''}>PDF</option>
                                <option value="zip" ${resource?.format === 'zip' ? 'selected' : ''}>ZIP</option>
                                <option value="md" ${resource?.format === 'md' ? 'selected' : ''}>Markdown</option>
                                <option value="mp4" ${resource?.format === 'mp4' ? 'selected' : ''}>Video</option>
                            </select>
                        </div>
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL tải xuống</label>
                            <input type="text" name="url" value="${resource?.url || ''}" required class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
                            <textarea name="description" rows="2" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">${resource?.description || ''}</textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                            <input type="text" name="tags" value="${resource?.tags?.join(', ') || ''}" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Miễn phí?</label>
                            <select name="free" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                <option value="true" ${resource?.free !== false ? 'selected' : ''}>Miễn phí</option>
                                <option value="false" ${resource?.free === false ? 'selected' : ''}>Premium</option>
                            </select>
                        </div>
                    </div>
                    <div id="form-error" class="text-red-500 text-sm hidden"></div>
                    <div class="flex gap-3 justify-end pt-4">
                        <button type="button" onclick="ResourcesManager.closeForm()" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">Hủy</button>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu</button>
                    </div>
                </form>
            </div>
        `;

        modal.classList.remove('hidden');
        document.getElementById('resource-form').addEventListener('submit', (e) => this.handleSubmit(e));
    },

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const errorEl = document.getElementById('form-error');
        
        const data = {
            title: form.title.value.trim(),
            description: form.description.value.trim(),
            type: form.type.value,
            format: form.format.value,
            url: form.url.value.trim(),
            tags: form.tags.value.split(',').map(t => t.trim()).filter(Boolean),
            free: form.free.value === 'true'
        };

        const errors = Validators.resource(data);
        if (errors.length) {
            errorEl.textContent = errors.join(', ');
            errorEl.classList.remove('hidden');
            return;
        }

        try {
            form.querySelector('button[type="submit"]').disabled = true;
            form.querySelector('button[type="submit"]').textContent = 'Đang lưu...';

            if (this.editingId) {
                const idx = this.resources.findIndex(r => r.id === this.editingId);
                if (idx !== -1) {
                    data.id = this.editingId;
                    data.downloadCount = this.resources[idx].downloadCount || 0;
                    data.createdAt = this.resources[idx].createdAt;
                    data.image = this.resources[idx].image;
                    this.resources[idx] = data;
                }
            } else {
                data.id = Math.max(0, ...this.resources.map(r => r.id)) + 1;
                data.downloadCount = 0;
                data.createdAt = new Date().toISOString().split('T')[0];
                data.image = 'assets/images/resources/default.jpg';
                this.resources.push(data);
            }

            await GitHubAPI.updateJson('data/resources.json', {
                resources: this.resources,
                types: this.types
            }, `${this.editingId ? 'Update' : 'Add'} resource: ${data.title}`);

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
        document.getElementById('resource-modal').classList.add('hidden');
        this.editingId = null;
    },

    edit(id) {
        const resource = this.resources.find(r => r.id === id);
        if (resource) this.showForm(resource);
    },

    async delete(id) {
        if (!confirm('Bạn có chắc muốn xóa tài nguyên này?')) return;
        try {
            this.resources = this.resources.filter(r => r.id !== id);
            await GitHubAPI.updateJson('data/resources.json', {
                resources: this.resources,
                types: this.types
            }, `Delete resource #${id}`);
            
            // Reload data để lấy SHA mới
            await this.loadData();
            
            this.renderList();
            alert('Đã xóa thành công!');
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    }
};

window.ResourcesManager = ResourcesManager;
