// ==========================================
// CONFIG-MANAGER.JS - Quản lý cấu hình site
// ==========================================

const ConfigManager = {
    config: null,
    pendingImages: {}, // Lưu ảnh chờ upload cho từng banner

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
        const c = this.config;
        
        container.innerHTML = `
            <form id="config-form" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <h3 class="font-bold text-gray-800 dark:text-white">Thông tin chung</h3>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên website</label>
                            <input type="text" name="siteName" value="${c.siteName || ''}" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tagline</label>
                            <input type="text" name="tagline" value="${c.tagline || ''}" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input type="email" name="email" value="${c.email || ''}" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
                            <input type="text" name="phone" value="${c.phone || ''}" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Địa chỉ</label>
                            <input type="text" name="address" value="${c.address || ''}" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                    </div>
                    <div class="space-y-4">
                        <h3 class="font-bold text-gray-800 dark:text-white">Mạng xã hội</h3>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook</label>
                            <input type="url" name="facebook" value="${c.socialLinks?.facebook || ''}" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zalo</label>
                            <input type="url" name="zalo" value="${c.socialLinks?.zalo || ''}" placeholder="https://zalo.me/..." class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter</label>
                            <input type="url" name="twitter" value="${c.socialLinks?.twitter || ''}" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub</label>
                            <input type="url" name="github" value="${c.socialLinks?.github || ''}" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">YouTube</label>
                            <input type="url" name="youtube" value="${c.socialLinks?.youtube || ''}" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    <h3 class="font-bold text-gray-800 dark:text-white">Banners</h3>
                    <div id="banners-list" class="space-y-4"></div>
                    <button type="button" onclick="ConfigManager.addBanner()" class="px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 w-full">+ Thêm banner</button>
                </div>

                <div id="config-error" class="text-red-500 text-sm hidden"></div>
                <button type="submit" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu cấu hình</button>
            </form>
        `;

        this.renderBanners();
        document.getElementById('config-form').addEventListener('submit', (e) => this.handleSubmit(e));
    },

    renderBanners() {
        const container = document.getElementById('banners-list');
        const banners = this.config.banners || [];
        
        container.innerHTML = banners.map((b, i) => `
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3" data-banner-index="${i}">
                <div class="flex justify-between items-center">
                    <span class="font-medium text-gray-800 dark:text-white">Banner ${i + 1}</span>
                    <button type="button" onclick="ConfigManager.removeBanner(${i})" class="text-red-500 hover:text-red-700">🗑️ Xóa</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="text" name="banner_title_${i}" value="${b.title || ''}" placeholder="Tiêu đề" class="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                    <input type="text" name="banner_subtitle_${i}" value="${b.subtitle || ''}" placeholder="Phụ đề" class="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                    <input type="text" name="banner_link_${i}" value="${b.link || ''}" placeholder="Link (vd: shop.html)" class="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                    <select name="banner_active_${i}" class="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                        <option value="true" ${b.active !== false ? 'selected' : ''}>Hiển thị chữ</option>
                        <option value="false" ${b.active === false ? 'selected' : ''}>Ẩn chữ</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">Ảnh banner</label>
                    <div class="flex items-center gap-3">
                        <input type="file" accept="image/*" onchange="ConfigManager.handleBannerImage(${i}, this)" class="text-sm">
                        <span class="text-xs text-gray-500" id="banner-image-path-${i}">${b.image || 'Chưa có ảnh'}</span>
                    </div>
                    <div id="banner-preview-${i}" class="mt-2 ${b.image ? '' : 'hidden'}">
                        <img src="${b.image || ''}" class="h-20 rounded object-cover" onerror="this.style.display='none'">
                    </div>
                </div>
            </div>
        `).join('');
    },

    async handleBannerImage(index, input) {
        const file = input.files[0];
        if (!file) return;

        const pathEl = document.getElementById(`banner-image-path-${index}`);
        const previewEl = document.getElementById(`banner-preview-${index}`);

        try {
            pathEl.textContent = 'Đang xử lý...';

            // Validate và nén ảnh
            const validation = ImageTools.validate(file);
            if (!validation.valid) {
                throw new Error(validation.errors.join('. '));
            }

            const result = await ImageTools.compress(file, {
                maxWidth: 1600,
                maxHeight: 900,
                quality: 0.85
            });

            // Preview
            const preview = await ImageTools.getPreview(result.file);
            previewEl.innerHTML = `
                <img src="${preview}" class="h-20 rounded object-cover">
                <p class="text-xs text-green-600 mt-1">Đã nén: ${ImageTools.formatSize(result.compressedSize)} (giảm ${result.savings}%)</p>
            `;
            previewEl.classList.remove('hidden');

            // Lưu file để upload khi save
            this.pendingImages[index] = result.file;
            pathEl.textContent = result.file.name;

        } catch (err) {
            pathEl.textContent = 'Lỗi: ' + err.message;
            previewEl.classList.add('hidden');
        }
    },

    addBanner() {
        this.config.banners = this.config.banners || [];
        this.config.banners.push({
            id: Date.now(),
            title: 'Banner mới',
            subtitle: 'Mô tả banner',
            image: '',
            link: 'index.html',
            active: true
        });
        this.renderBanners();
    },

    removeBanner(index) {
        if (!confirm('Xác nhận xóa banner này?')) return;
        this.config.banners.splice(index, 1);
        delete this.pendingImages[index];
        this.renderBanners();
    },

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const errorEl = document.getElementById('config-error');
        const submitBtn = form.querySelector('button[type="submit"]');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang lưu...';

            // Upload pending banner images
            for (const [index, file] of Object.entries(this.pendingImages)) {
                submitBtn.textContent = `Đang upload ảnh banner ${parseInt(index) + 1}...`;
                const result = await GitHubAPI.uploadImage(file, 'assets/images/banners');
                this.config.banners[index].image = result.path;
            }
            this.pendingImages = {};

            // Update basic info
            this.config.siteName = form.siteName.value;
            this.config.tagline = form.tagline.value;
            this.config.email = form.email.value;
            this.config.phone = form.phone.value;
            this.config.address = form.address.value;

            // Update social links
            this.config.socialLinks = {
                facebook: form.facebook.value,
                zalo: form.zalo.value,
                twitter: form.twitter.value,
                github: form.github.value,
                youtube: form.youtube.value,
                discord: this.config.socialLinks?.discord || ''
            };

            // Update banners from form
            this.config.banners = this.config.banners.map((b, i) => ({
                ...b,
                title: form[`banner_title_${i}`]?.value || b.title,
                subtitle: form[`banner_subtitle_${i}`]?.value || b.subtitle,
                link: form[`banner_link_${i}`]?.value || b.link,
                active: form[`banner_active_${i}`]?.value === 'true'
            }));

            // Save to GitHub
            submitBtn.textContent = 'Đang lưu cấu hình...';
            await GitHubAPI.updateJson('data/config.json', this.config, 'Update site config');

            // Reload data để lấy SHA mới
            await this.loadData();
            
            alert('Đã lưu cấu hình thành công!');
            this.renderBanners(); // Refresh để hiện path ảnh mới

        } catch (err) {
            errorEl.textContent = 'Lỗi: ' + err.message;
            errorEl.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Lưu cấu hình';
        }
    }
};

window.ConfigManager = ConfigManager;
