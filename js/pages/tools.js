// ==========================================
// TOOLS.JS - Trang Tiện ích
// ==========================================

const ToolsPage = {
    currentTab: '2fa',
    countdownInterval: null,
    bookmarks: { groups: [], items: [] },

    init() {
        this.setupTabs();
        this.loadBookmarks();
        this.setupForms();
    },

    // ==========================================
    // TAB NAVIGATION
    // ==========================================
    setupTabs() {
        const tabs = document.querySelectorAll('.tools-tab');
        const indicator = document.getElementById('tools-tab-indicator');

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                // Update active state
                tabs.forEach(t => {
                    t.classList.remove('active', 'text-white');
                    t.classList.add('text-gray-600', 'dark:text-gray-300');
                });
                tab.classList.add('active', 'text-white');
                tab.classList.remove('text-gray-600', 'dark:text-gray-300');

                // Move indicator
                const tabWidth = 100 / tabs.length;
                indicator.style.width = `calc(${tabWidth}% - 8px)`;
                indicator.style.left = `calc(${index * tabWidth}% + 4px)`;

                // Show panel
                const tabName = tab.dataset.tab;
                this.currentTab = tabName;
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
                document.getElementById(`tab-${tabName}`).classList.remove('hidden');

                // Load bookmarks if needed
                if (tabName === 'bookmarks') {
                    this.renderBookmarks();
                }
            });
        });
    },

    // ==========================================
    // 2FA GENERATOR
    // ==========================================
    generate2FA() {
        const input = document.getElementById('input-2fa-keys').value.trim();
        if (!input) {
            alert('Vui lòng nhập KEY 2FA');
            return;
        }

        const lines = input.split('\n').filter(l => l.trim());
        const results = [];

        lines.forEach(line => {
            try {
                // Extract 2FA key from various formats
                let key = line.trim();
                
                // Format: ID | Pass | 2FA
                if (line.includes('|')) {
                    const parts = line.split('|');
                    key = parts[parts.length - 1].trim();
                }

                // Remove spaces from key
                key = key.replace(/\s+/g, '').toUpperCase();

                // Generate TOTP
                const totp = new OTPAuth.TOTP({
                    secret: OTPAuth.Secret.fromBase32(key),
                    digits: 6,
                    period: 30
                });

                const code = totp.generate();
                results.push({ key: key.substring(0, 8) + '...', code, success: true });
            } catch (e) {
                results.push({ key: line.substring(0, 20) + '...', code: 'Lỗi', success: false });
            }
        });

        this.display2FAResults(results);
        this.startCountdown();
    },

    display2FAResults(results) {
        const container = document.getElementById('2fa-results');
        const codesEl = document.getElementById('2fa-codes');

        container.classList.remove('hidden');
        codesEl.innerHTML = results.map((r, i) => `
            <div class="flex items-center justify-between p-3 rounded-lg ${r.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}">
                <div class="flex items-center gap-3">
                    <span class="text-sm text-gray-500 dark:text-gray-400">#${i + 1}</span>
                    <span class="text-sm text-gray-600 dark:text-gray-400 font-mono">${r.key}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xl font-bold font-mono ${r.success ? 'text-green-600 dark:text-green-400' : 'text-red-500'}">${r.code}</span>
                    ${r.success ? `<button onclick="ToolsPage.copyCode('${r.code}')" class="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded">📋</button>` : ''}
                </div>
            </div>
        `).join('');

        this.lastResults = results;
    },

    startCountdown() {
        if (this.countdownInterval) clearInterval(this.countdownInterval);

        const update = () => {
            const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);
            document.getElementById('2fa-countdown').textContent = `Còn ${remaining}s`;

            if (remaining === 30) {
                // Auto refresh
                this.generate2FA();
            }
        };

        update();
        this.countdownInterval = setInterval(update, 1000);
    },

    copyCode(code) {
        navigator.clipboard.writeText(code);
        alert('Đã copy: ' + code);
    },

    copy2FAResults() {
        if (!this.lastResults) return;
        const text = this.lastResults.filter(r => r.success).map(r => r.code).join('\n');
        navigator.clipboard.writeText(text);
        alert('Đã copy tất cả code!');
    },

    // ==========================================
    // VIETQR GENERATOR
    // ==========================================
    generateQR() {
        const bank = document.getElementById('qr-bank').value;
        const account = document.getElementById('qr-account').value.trim();
        const name = document.getElementById('qr-name').value.trim();
        const amount = document.getElementById('qr-amount').value.trim();
        const content = document.getElementById('qr-content').value.trim();

        if (!account) {
            alert('Vui lòng nhập số tài khoản');
            return;
        }

        // Build VietQR URL
        let url = `https://img.vietqr.io/image/${bank}-${account}-compact.png`;
        
        const params = [];
        if (amount) params.push(`amount=${amount}`);
        if (content) params.push(`addInfo=${encodeURIComponent(content)}`);
        if (name) params.push(`accountName=${encodeURIComponent(name)}`);
        
        if (params.length) {
            url += '?' + params.join('&');
        }

        // Display QR
        const preview = document.getElementById('qr-preview');
        preview.innerHTML = `<img src="${url}" alt="VietQR" class="w-full h-full object-contain rounded-xl" id="qr-image">`;
        
        document.getElementById('qr-download-btn').classList.remove('hidden');
        this.currentQRUrl = url;
    },

    downloadQR() {
        if (!this.currentQRUrl) return;
        
        const link = document.createElement('a');
        link.href = this.currentQRUrl;
        link.download = 'vietqr.png';
        link.click();
    },

    // ==========================================
    // BOOKMARKS
    // ==========================================
    loadBookmarks() {
        const saved = localStorage.getItem('garli_bookmarks');
        if (saved) {
            try {
                this.bookmarks = JSON.parse(saved);
            } catch (e) {
                this.bookmarks = { groups: [], items: [] };
            }
        }

        // Default group if empty
        if (!this.bookmarks.groups.length) {
            this.bookmarks.groups = [{ id: 'default', name: 'Chung' }];
            this.saveBookmarks();
        }
    },

    saveBookmarks() {
        localStorage.setItem('garli_bookmarks', JSON.stringify(this.bookmarks));
    },

    renderBookmarks() {
        const container = document.getElementById('bookmarks-container');
        if (!container) return;

        if (!this.bookmarks.items.length) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p class="text-4xl mb-4">🔖</p>
                    <p>Chưa có bookmark nào</p>
                    <p class="text-sm mt-2">Nhấn "Thêm bookmark" để bắt đầu</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.bookmarks.groups.map(group => {
            const items = this.bookmarks.items.filter(b => b.group === group.id);
            
            return `
                <div class="glass-card rounded-2xl p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-[#0d544c]"></span>
                            ${group.name}
                        </h3>
                        ${group.id !== 'default' ? `
                            <button onclick="ToolsPage.deleteGroup('${group.id}')" class="text-red-500 hover:text-red-700 text-sm">🗑️ Xóa nhóm</button>
                        ` : ''}
                    </div>
                    <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                        ${items.map(b => this.renderBookmarkItem(b)).join('')}
                        ${items.length === 0 ? '<p class="col-span-full text-center text-gray-400 text-sm py-4">Nhóm trống</p>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    },

    renderBookmarkItem(bookmark) {
        const favicon = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=128`;
        
        return `
            <div class="group relative">
                <a href="${bookmark.url}" target="_blank" rel="noopener" 
                   class="flex flex-col items-center text-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div class="w-14 h-14 rounded-2xl bg-white dark:bg-gray-600 shadow-md flex items-center justify-center mb-2 overflow-hidden">
                        <img src="${favicon}" alt="${bookmark.title}" class="w-10 h-10 object-contain"
                             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%230d544c%22><path d=%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z%22/></svg>'">
                    </div>
                    <span class="text-xs text-gray-700 dark:text-gray-300 truncate w-full">${bookmark.title}</span>
                </a>
                <div class="absolute top-0 right-0 hidden group-hover:flex gap-1">
                    <button onclick="event.preventDefault(); ToolsPage.editBookmark(${bookmark.id})" class="p-1 bg-blue-500 text-white rounded text-xs">✏️</button>
                    <button onclick="event.preventDefault(); ToolsPage.deleteBookmark(${bookmark.id})" class="p-1 bg-red-500 text-white rounded text-xs">🗑️</button>
                </div>
            </div>
        `;
    },

    setupForms() {
        // Bookmark form
        document.getElementById('bookmark-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBookmarkForm();
        });

        // Group form
        document.getElementById('group-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveGroupForm();
        });
    },

    showAddBookmark() {
        document.getElementById('bookmark-modal-title').textContent = 'Thêm bookmark';
        document.getElementById('bookmark-edit-id').value = '';
        document.getElementById('bookmark-title').value = '';
        document.getElementById('bookmark-url').value = '';
        
        // Populate groups
        const select = document.getElementById('bookmark-group');
        select.innerHTML = this.bookmarks.groups.map(g => 
            `<option value="${g.id}">${g.name}</option>`
        ).join('');

        document.getElementById('bookmark-modal').classList.remove('hidden');
    },

    editBookmark(id) {
        const bookmark = this.bookmarks.items.find(b => b.id === id);
        if (!bookmark) return;

        document.getElementById('bookmark-modal-title').textContent = 'Sửa bookmark';
        document.getElementById('bookmark-edit-id').value = id;
        document.getElementById('bookmark-title').value = bookmark.title;
        document.getElementById('bookmark-url').value = bookmark.url;

        const select = document.getElementById('bookmark-group');
        select.innerHTML = this.bookmarks.groups.map(g => 
            `<option value="${g.id}" ${g.id === bookmark.group ? 'selected' : ''}>${g.name}</option>`
        ).join('');

        document.getElementById('bookmark-modal').classList.remove('hidden');
    },

    saveBookmarkForm() {
        const editId = document.getElementById('bookmark-edit-id').value;
        const title = document.getElementById('bookmark-title').value.trim();
        const url = document.getElementById('bookmark-url').value.trim();
        const group = document.getElementById('bookmark-group').value;

        if (!title || !url) return;

        if (editId) {
            // Edit
            const idx = this.bookmarks.items.findIndex(b => b.id === parseInt(editId));
            if (idx !== -1) {
                this.bookmarks.items[idx] = { ...this.bookmarks.items[idx], title, url, group };
            }
        } else {
            // Add
            const id = Math.max(0, ...this.bookmarks.items.map(b => b.id), 0) + 1;
            this.bookmarks.items.push({ id, title, url, group });
        }

        this.saveBookmarks();
        this.renderBookmarks();
        this.closeModal('bookmark-modal');
    },

    deleteBookmark(id) {
        if (!confirm('Xóa bookmark này?')) return;
        this.bookmarks.items = this.bookmarks.items.filter(b => b.id !== id);
        this.saveBookmarks();
        this.renderBookmarks();
    },

    showAddGroup() {
        document.getElementById('group-name').value = '';
        document.getElementById('group-modal').classList.remove('hidden');
    },

    saveGroupForm() {
        const name = document.getElementById('group-name').value.trim();
        if (!name) return;

        const id = name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-');

        if (this.bookmarks.groups.some(g => g.id === id)) {
            alert('Nhóm này đã tồn tại');
            return;
        }

        this.bookmarks.groups.push({ id, name });
        this.saveBookmarks();
        this.renderBookmarks();
        this.closeModal('group-modal');
    },

    deleteGroup(id) {
        const items = this.bookmarks.items.filter(b => b.group === id);
        if (items.length > 0) {
            alert(`Không thể xóa! Có ${items.length} bookmark trong nhóm này.`);
            return;
        }
        if (!confirm('Xóa nhóm này?')) return;

        this.bookmarks.groups = this.bookmarks.groups.filter(g => g.id !== id);
        this.saveBookmarks();
        this.renderBookmarks();
    },

    closeModal(id) {
        document.getElementById(id).classList.add('hidden');
    },

    // Import/Export
    exportBookmarks() {
        const data = JSON.stringify(this.bookmarks, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'garli-bookmarks.json';
        a.click();
        
        URL.revokeObjectURL(url);
    },

    importBookmarks(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.groups && data.items) {
                    if (confirm(`Nhập ${data.items.length} bookmark từ ${data.groups.length} nhóm?\n\nDữ liệu hiện tại sẽ bị thay thế.`)) {
                        this.bookmarks = data;
                        this.saveBookmarks();
                        this.renderBookmarks();
                        alert('✅ Đã nhập thành công!');
                    }
                } else {
                    alert('File không đúng định dạng');
                }
            } catch (err) {
                alert('Lỗi đọc file: ' + err.message);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => ToolsPage.init());
