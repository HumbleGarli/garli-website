// ==========================================
// BOOKMARKS-MANAGER.JS - CRUD Bookmarks
// ==========================================

const BookmarksManager = {
    data: { groups: [], bookmarks: [], layout: {} },
    editingId: null,

    async init() {
        await this.loadData();
        this.render();
    },

    async loadData() {
        try {
            const { content } = await GitHubAPI.getJson('data/bookmarks.json');
            this.data = content;
        } catch (e) {
            const res = await fetch('data/bookmarks.json');
            this.data = await res.json();
        }
    },

    render() {
        const container = document.getElementById('tab-content');
        container.innerHTML = `
            <div class="space-y-6">
                <!-- Layout Settings -->
                <div class="glass-card p-4 rounded-xl">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">⚙️ Cài đặt bố cục</h3>
                    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">Kích thước icon</label>
                            <input type="range" id="layout-iconSize" min="32" max="128" value="${this.data.layout?.iconSize || 64}" 
                                class="w-full" onchange="BookmarksManager.updateLayout()">
                            <span id="iconSize-value" class="text-sm text-gray-500">${this.data.layout?.iconSize || 64}px</span>
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">Khoảng cách</label>
                            <input type="range" id="layout-gap" min="8" max="48" value="${this.data.layout?.gap || 24}" 
                                class="w-full" onchange="BookmarksManager.updateLayout()">
                            <span id="gap-value" class="text-sm text-gray-500">${this.data.layout?.gap || 24}px</span>
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">Số cột</label>
                            <input type="range" id="layout-columns" min="4" max="12" value="${this.data.layout?.columns || 8}" 
                                class="w-full" onchange="BookmarksManager.updateLayout()">
                            <span id="columns-value" class="text-sm text-gray-500">${this.data.layout?.columns || 8} cột</span>
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">Độ rộng</label>
                            <select id="layout-containerWidth" class="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" onchange="BookmarksManager.updateLayout()">
                                <option value="full" ${this.data.layout?.containerWidth === 'full' ? 'selected' : ''}>Toàn màn hình</option>
                                <option value="6xl" ${this.data.layout?.containerWidth === '6xl' ? 'selected' : ''}>Rộng (6xl)</option>
                                <option value="5xl" ${this.data.layout?.containerWidth === '5xl' ? 'selected' : ''}>Vừa (5xl)</option>
                                <option value="4xl" ${this.data.layout?.containerWidth === '4xl' ? 'selected' : ''}>Hẹp (4xl)</option>
                            </select>
                        </div>
                        <div class="flex items-end">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" id="layout-showGroupTitle" ${this.data.layout?.showGroupTitle !== false ? 'checked' : ''} 
                                    class="w-5 h-5 rounded" onchange="BookmarksManager.updateLayout()">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Hiện tên nhóm</span>
                            </label>
                        </div>
                    </div>
                    <button onclick="BookmarksManager.saveLayout()" class="mt-4 px-4 py-2 bg-[#0d544c] text-white rounded-lg hover:bg-[#0a443e]">
                        💾 Lưu bố cục
                    </button>
                </div>

                <!-- Actions -->
                <div class="flex flex-wrap gap-4 items-center justify-between">
                    <input type="text" id="bookmark-search" placeholder="Tìm bookmark..."
                        class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <div class="flex gap-2">
                        <button onclick="BookmarksManager.showGroupManager()" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
                            📁 Quản lý nhóm
                        </button>
                        <button onclick="BookmarksManager.showForm()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            + Thêm bookmark
                        </button>
                    </div>
                </div>

                <!-- Bookmarks List -->
                <div id="bookmarks-list" class="space-y-4"></div>
            </div>

            <!-- Bookmark Modal -->
            <div id="bookmark-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"></div>
            </div>

            <!-- Group Modal -->
            <div id="group-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"></div>
            </div>
        `;

        this.renderList();
        this.setupEvents();
    },

    updateLayout() {
        const iconSize = document.getElementById('layout-iconSize').value;
        const gap = document.getElementById('layout-gap').value;
        const columns = document.getElementById('layout-columns').value;

        document.getElementById('iconSize-value').textContent = iconSize + 'px';
        document.getElementById('gap-value').textContent = gap + 'px';
        document.getElementById('columns-value').textContent = columns + ' cột';
    },

    async saveLayout() {
        try {
            this.data.layout = {
                iconSize: parseInt(document.getElementById('layout-iconSize').value),
                gap: parseInt(document.getElementById('layout-gap').value),
                columns: parseInt(document.getElementById('layout-columns').value),
                containerWidth: document.getElementById('layout-containerWidth').value,
                showGroupTitle: document.getElementById('layout-showGroupTitle').checked
            };

            await GitHubAPI.updateJson('data/bookmarks.json', this.data, 'Update bookmarks layout');
            await this.loadData();
            alert('✅ Đã lưu bố cục!');
        } catch (err) {
            alert('❌ Lỗi: ' + err.message);
        }
    },

    renderList(filter = '') {
        const list = document.getElementById('bookmarks-list');
        const { groups, bookmarks } = this.data;

        // Sort groups
        const sortedGroups = [...groups].sort((a, b) => a.order - b.order);

        let html = '';
        sortedGroups.forEach(group => {
            let groupBookmarks = bookmarks.filter(b => b.group === group.id);
            
            if (filter) {
                const q = filter.toLowerCase();
                groupBookmarks = groupBookmarks.filter(b => 
                    b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q)
                );
            }

            if (groupBookmarks.length === 0 && filter) return;

            groupBookmarks.sort((a, b) => a.order - b.order);

            html += `
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <h4 class="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-[#0d544c]"></span>
                        ${group.name} (${groupBookmarks.length})
                    </h4>
                    <div class="space-y-2">
                        ${groupBookmarks.map(b => `
                            <div class="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg">
                                <img src="${b.icon || `https://www.google.com/s2/favicons?domain=${new URL(b.url).hostname}&sz=64`}" 
                                     alt="${b.title}" class="w-10 h-10 rounded-lg object-contain bg-gray-100 dark:bg-gray-600 p-1">
                                <div class="flex-1 min-w-0">
                                    <h5 class="font-medium text-gray-800 dark:text-white truncate">${b.title}</h5>
                                    <p class="text-sm text-gray-500 dark:text-gray-400 truncate">${b.url}</p>
                                </div>
                                <div class="flex gap-1">
                                    <button onclick="BookmarksManager.edit(${b.id})" class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">✏️</button>
                                    <button onclick="BookmarksManager.delete(${b.id})" class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">🗑️</button>
                                </div>
                            </div>
                        `).join('')}
                        ${groupBookmarks.length === 0 ? '<p class="text-gray-400 text-sm text-center py-2">Chưa có bookmark</p>' : ''}
                    </div>
                </div>
            `;
        });

        list.innerHTML = html || '<p class="text-gray-500 text-center py-8">Không tìm thấy bookmark nào</p>';
    },

    setupEvents() {
        document.getElementById('bookmark-search')?.addEventListener('input', (e) => this.renderList(e.target.value));
    },


    // ==========================================
    // BOOKMARK CRUD
    // ==========================================
    showForm(bookmark = null) {
        this.editingId = bookmark?.id || null;
        const modal = document.getElementById('bookmark-modal');
        const content = modal.querySelector('div');

        content.innerHTML = `
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800 dark:text-white">${bookmark ? 'Sửa' : 'Thêm'} bookmark</h3>
                    <button onclick="BookmarksManager.closeForm()" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">&times;</button>
                </div>
                <form id="bookmark-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiêu đề</label>
                        <input type="text" name="title" value="${bookmark?.title || ''}" required 
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
                        <input type="url" name="url" value="${bookmark?.url || ''}" required 
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            placeholder="https://example.com">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon URL (để trống = tự động)</label>
                        <input type="text" name="icon" value="${bookmark?.icon || ''}" 
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            placeholder="https://example.com/favicon.ico">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nhóm</label>
                            <select name="group" required class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                ${this.data.groups.map(g => `<option value="${g.id}" ${bookmark?.group === g.id ? 'selected' : ''}>${g.name}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thứ tự</label>
                            <input type="number" name="order" value="${bookmark?.order || 1}" min="1"
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                    </div>
                    <div id="form-error" class="text-red-500 text-sm hidden"></div>
                    <div class="flex gap-3 justify-end pt-4">
                        <button type="button" onclick="BookmarksManager.closeForm()" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white">Hủy</button>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu</button>
                    </div>
                </form>
            </div>
        `;

        modal.classList.remove('hidden');
        document.getElementById('bookmark-form').addEventListener('submit', (e) => this.handleSubmit(e));
    },

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const errorEl = document.getElementById('form-error');

        const data = {
            title: form.title.value.trim(),
            url: form.url.value.trim(),
            icon: form.icon.value.trim() || '',
            group: form.group.value,
            order: parseInt(form.order.value) || 1
        };

        if (!data.title || !data.url) {
            errorEl.textContent = 'Vui lòng điền đầy đủ thông tin';
            errorEl.classList.remove('hidden');
            return;
        }

        try {
            form.querySelector('button[type="submit"]').disabled = true;
            form.querySelector('button[type="submit"]').textContent = 'Đang lưu...';

            if (this.editingId) {
                const idx = this.data.bookmarks.findIndex(b => b.id === this.editingId);
                if (idx !== -1) {
                    data.id = this.editingId;
                    this.data.bookmarks[idx] = data;
                }
            } else {
                data.id = Math.max(0, ...this.data.bookmarks.map(b => b.id)) + 1;
                this.data.bookmarks.push(data);
            }

            await GitHubAPI.updateJson('data/bookmarks.json', this.data, `${this.editingId ? 'Update' : 'Add'} bookmark: ${data.title}`);
            await this.loadData();

            this.closeForm();
            this.renderList();
            alert('✅ Đã lưu bookmark!');
        } catch (err) {
            errorEl.textContent = 'Lỗi: ' + err.message;
            errorEl.classList.remove('hidden');
        }
    },

    closeForm() {
        document.getElementById('bookmark-modal').classList.add('hidden');
        this.editingId = null;
    },

    edit(id) {
        const bookmark = this.data.bookmarks.find(b => b.id === id);
        if (bookmark) this.showForm(bookmark);
    },

    async delete(id) {
        if (!confirm('Xác nhận xóa bookmark này?')) return;
        try {
            this.data.bookmarks = this.data.bookmarks.filter(b => b.id !== id);
            await GitHubAPI.updateJson('data/bookmarks.json', this.data, `Delete bookmark #${id}`);
            await this.loadData();
            this.renderList();
            alert('✅ Đã xóa!');
        } catch (err) {
            alert('❌ Lỗi: ' + err.message);
        }
    },

    // ==========================================
    // GROUP MANAGEMENT
    // ==========================================
    showGroupManager() {
        const modal = document.getElementById('group-modal');
        const content = modal.querySelector('div');

        content.innerHTML = `
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800 dark:text-white">Quản lý nhóm</h3>
                    <button onclick="BookmarksManager.closeGroupManager()" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">&times;</button>
                </div>
                <div id="groups-list" class="space-y-2 mb-4"></div>
                <div class="flex gap-2">
                    <input type="text" id="new-group-name" placeholder="Tên nhóm mới" 
                        class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <button onclick="BookmarksManager.addGroup()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Thêm</button>
                </div>
                <div id="group-error" class="text-red-500 text-sm mt-2 hidden"></div>
            </div>
        `;

        this.renderGroups();
        modal.classList.remove('hidden');
    },

    renderGroups() {
        const list = document.getElementById('groups-list');
        if (!list) return;

        const sortedGroups = [...this.data.groups].sort((a, b) => a.order - b.order);
        list.innerHTML = sortedGroups.map(g => {
            const count = this.data.bookmarks.filter(b => b.group === g.id).length;
            return `
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-[#0d544c]"></span>
                        <span class="text-gray-800 dark:text-white font-medium">${g.name}</span>
                        <span class="text-xs text-gray-500">(${count} bookmarks)</span>
                    </div>
                    <button onclick="BookmarksManager.deleteGroup('${g.id}')" class="text-red-500 hover:text-red-700 p-1" ${count > 0 ? 'disabled title="Không thể xóa nhóm có bookmark"' : ''}>🗑️</button>
                </div>
            `;
        }).join('');
    },

    async addGroup() {
        const input = document.getElementById('new-group-name');
        const errorEl = document.getElementById('group-error');
        const name = input.value.trim();

        if (!name) {
            errorEl.textContent = 'Vui lòng nhập tên nhóm';
            errorEl.classList.remove('hidden');
            return;
        }

        const id = name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        if (this.data.groups.some(g => g.id === id)) {
            errorEl.textContent = 'Nhóm này đã tồn tại';
            errorEl.classList.remove('hidden');
            return;
        }

        try {
            const maxOrder = Math.max(0, ...this.data.groups.map(g => g.order));
            this.data.groups.push({ id, name, order: maxOrder + 1 });

            await GitHubAPI.updateJson('data/bookmarks.json', this.data, `Add group: ${name}`);
            await this.loadData();

            input.value = '';
            errorEl.classList.add('hidden');
            this.renderGroups();
            alert('✅ Đã thêm nhóm!');
        } catch (err) {
            errorEl.textContent = 'Lỗi: ' + err.message;
            errorEl.classList.remove('hidden');
        }
    },

    async deleteGroup(id) {
        const group = this.data.groups.find(g => g.id === id);
        if (!group) return;

        const count = this.data.bookmarks.filter(b => b.group === id).length;
        if (count > 0) {
            alert(`Không thể xóa! Có ${count} bookmark trong nhóm này.`);
            return;
        }

        if (!confirm(`Xác nhận xóa nhóm "${group.name}"?`)) return;

        try {
            this.data.groups = this.data.groups.filter(g => g.id !== id);
            await GitHubAPI.updateJson('data/bookmarks.json', this.data, `Delete group: ${group.name}`);
            await this.loadData();
            this.renderGroups();
            alert('✅ Đã xóa nhóm!');
        } catch (err) {
            alert('❌ Lỗi: ' + err.message);
        }
    },

    closeGroupManager() {
        document.getElementById('group-modal').classList.add('hidden');
    }
};

window.BookmarksManager = BookmarksManager;
