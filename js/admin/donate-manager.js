// ==========================================
// DONATE-MANAGER.JS - Quản lý Widget Donate
// ==========================================

const DonateManager = {
    config: null,
    pendingAvatar: null,
    pendingQR: null,

    async init() {
        await this.loadData();
        this.render();
    },

    async loadData() {
        try {
            const { content } = await GitHubAPI.getJson('data/config.json');
            this.config = content;
        } catch (e) {
            const res = await fetch('data/config.json');
            this.config = await res.json();
        }
    },

    render() {
        const container = document.getElementById('tab-content');
        const donate = this.config.donate || {
            enabled: false,
            avatar: '',
            buttonLabel: 'Donate',
            qrCode: '',
            title: 'Ủng hộ tác giả',
            message: 'Chủ web đói quá, xin được nuôi 🐱',
            thankYou: 'Cảm ơn bạn rất nhiều! ❤️'
        };

        container.innerHTML = `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-xl font-bold text-gray-800 dark:text-white">🎁 Quản lý Widget Donate</h2>
                </div>

                <form id="donate-form" class="space-y-6">
                    <!-- Bật/Tắt -->
                    <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <input type="checkbox" id="donate-enabled" name="enabled" ${donate.enabled ? 'checked' : ''} 
                            class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                        <label for="donate-enabled" class="font-medium text-gray-800 dark:text-white">
                            Bật Widget Donate
                        </label>
                        <span class="text-sm text-gray-500">(Hiển thị nút donate ở góc phải màn hình)</span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Cột trái: Nội dung -->
                        <div class="space-y-4">
                            <h3 class="font-semibold text-gray-800 dark:text-white">📝 Nội dung</h3>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nhãn nút (hiển thị dưới avatar)</label>
                                <input type="text" name="buttonLabel" value="${donate.buttonLabel || ''}" 
                                    placeholder="Donate"
                                    class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiêu đề popup</label>
                                <input type="text" name="title" value="${donate.title || ''}" 
                                    placeholder="Ủng hộ tác giả"
                                    class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lời kêu gọi</label>
                                <textarea name="message" rows="2" placeholder="Chủ web đói quá, xin được nuôi 🐱"
                                    class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">${donate.message || ''}</textarea>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lời cảm ơn</label>
                                <input type="text" name="thankYou" value="${donate.thankYou || ''}" 
                                    placeholder="Cảm ơn bạn rất nhiều! ❤️"
                                    class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                            </div>
                        </div>

                        <!-- Cột phải: Hình ảnh -->
                        <div class="space-y-4">
                            <h3 class="font-semibold text-gray-800 dark:text-white">🖼️ Hình ảnh</h3>
                            
                            <!-- Avatar -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ảnh đại diện (nút widget)</label>
                                <p class="text-xs text-gray-500 mb-2">📐 Kích thước: 80 x 80px (hình vuông)</p>
                                <input type="file" id="donate-avatar" accept="image/*" class="w-full text-sm">
                                <div id="avatar-preview" class="mt-2 ${donate.avatar ? '' : 'hidden'}">
                                    <img src="${donate.avatar || ''}" class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg">
                                </div>
                            </div>

                            <!-- QR Code -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mã QR chuyển khoản</label>
                                <p class="text-xs text-gray-500 mb-2">📐 Kích thước: 300 x 300px (hình vuông)</p>
                                <input type="file" id="donate-qr" accept="image/*" class="w-full text-sm">
                                <div id="qr-preview" class="mt-2 ${donate.qrCode ? '' : 'hidden'}">
                                    <img src="${donate.qrCode || ''}" class="w-32 h-32 rounded-lg object-cover border">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Preview -->
                    <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h3 class="font-semibold text-gray-800 dark:text-white mb-3">👁️ Xem trước</h3>
                        <div class="flex items-start gap-4">
                            <div class="relative flex flex-col items-center">
                                <div class="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center text-2xl animate-bounce shadow-lg">
                                    ${donate.avatar ? `<img src="${donate.avatar}" class="w-full h-full rounded-full object-cover">` : '🎁'}
                                </div>
                                <span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
                                <span class="mt-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full shadow">${donate.buttonLabel || 'Donate'}</span>
                            </div>
                            <div class="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg max-w-xs">
                                <h4 class="font-bold text-gray-800 dark:text-white">${donate.title || 'Ủng hộ tác giả'}</h4>
                                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${donate.message || 'Lời kêu gọi...'}</p>
                                <div class="mt-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-center">
                                    ${donate.qrCode ? `<img src="${donate.qrCode}" class="w-24 h-24 mx-auto rounded">` : '<span class="text-4xl">📱</span>'}
                                </div>
                                <p class="text-xs text-center text-gray-500 mt-2">${donate.thankYou || 'Cảm ơn!'}</p>
                            </div>
                        </div>
                    </div>

                    <div id="donate-error" class="text-red-500 text-sm hidden"></div>

                    <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Lưu cấu hình
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('donate-form').addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('donate-avatar')?.addEventListener('change', (e) => this.handleAvatarChange(e));
        document.getElementById('donate-qr')?.addEventListener('change', (e) => this.handleQRChange(e));
    },

    async handleAvatarChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        const previewEl = document.getElementById('avatar-preview');
        previewEl.innerHTML = '<p class="text-gray-500 text-sm">Đang xử lý...</p>';
        previewEl.classList.remove('hidden');

        try {
            const validation = ImageTools.validate(file);
            if (!validation.valid) throw new Error(validation.errors.join('. '));

            const result = await ImageTools.compress(file, { maxWidth: 200, maxHeight: 200, quality: 0.9 });
            const preview = await ImageTools.getPreview(result.file);
            
            previewEl.innerHTML = `<img src="${preview}" class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg">`;
            this.pendingAvatar = result.file;
        } catch (err) {
            previewEl.innerHTML = `<p class="text-red-500 text-sm">${err.message}</p>`;
        }
    },

    async handleQRChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        const previewEl = document.getElementById('qr-preview');
        previewEl.innerHTML = '<p class="text-gray-500 text-sm">Đang xử lý...</p>';
        previewEl.classList.remove('hidden');

        try {
            const validation = ImageTools.validate(file);
            if (!validation.valid) throw new Error(validation.errors.join('. '));

            const result = await ImageTools.compress(file, { maxWidth: 400, maxHeight: 400, quality: 0.9 });
            const preview = await ImageTools.getPreview(result.file);
            
            previewEl.innerHTML = `<img src="${preview}" class="w-32 h-32 rounded-lg object-cover border">`;
            this.pendingQR = result.file;
        } catch (err) {
            previewEl.innerHTML = `<p class="text-red-500 text-sm">${err.message}</p>`;
        }
    },

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const errorEl = document.getElementById('donate-error');
        const btn = form.querySelector('button[type="submit"]');

        try {
            btn.disabled = true;
            btn.textContent = 'Đang lưu...';
            errorEl.classList.add('hidden');

            // Upload images if pending
            let avatarPath = this.config.donate?.avatar || '';
            let qrPath = this.config.donate?.qrCode || '';

            if (this.pendingAvatar) {
                btn.textContent = 'Đang upload avatar...';
                const result = await GitHubAPI.uploadImage(this.pendingAvatar, 'assets/images/donate');
                avatarPath = result.path;
                this.pendingAvatar = null;
            }

            if (this.pendingQR) {
                btn.textContent = 'Đang upload QR...';
                const result = await GitHubAPI.uploadImage(this.pendingQR, 'assets/images/donate');
                qrPath = result.path;
                this.pendingQR = null;
            }

            // Update config
            this.config.donate = {
                enabled: form.enabled.checked,
                avatar: avatarPath,
                buttonLabel: form.buttonLabel.value.trim(),
                qrCode: qrPath,
                title: form.title.value.trim(),
                message: form.message.value.trim(),
                thankYou: form.thankYou.value.trim()
            };

            btn.textContent = 'Đang lưu cấu hình...';
            await GitHubAPI.updateJson('data/config.json', this.config, 'Update donate widget config');

            await this.loadData();
            AdminPanel.hardRefresh('Đã lưu cấu hình donate!');
            this.render();

        } catch (err) {
            errorEl.textContent = 'Lỗi: ' + err.message;
            errorEl.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Lưu cấu hình';
        }
    }
};

window.DonateManager = DonateManager;
