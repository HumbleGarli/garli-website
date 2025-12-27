// ==========================================
// ABOUT-MANAGER.JS - Quản lý trang Giới thiệu
// ==========================================

const AboutManager = {
    config: null,

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
        const about = this.config.about || {
            title: 'Garli',
            description: '',
            paragraphs: [],
            stats: []
        };

        container.innerHTML = `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-xl font-bold text-gray-800 dark:text-white">Quản lý trang Giới thiệu</h2>
                    <span class="text-sm text-gray-500">💡 Nhấn Ctrl+Shift+R sau khi lưu để xem thay đổi</span>
                </div>

                <form id="about-form" class="space-y-6">
                    <!-- Tiêu đề -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiêu đề trang</label>
                        <input type="text" name="title" value="${about.title || ''}" 
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            placeholder="Tên công ty/website">
                    </div>

                    <!-- Mô tả ngắn -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả ngắn</label>
                        <textarea name="description" rows="2" 
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            placeholder="Mô tả ngắn về website/công ty">${about.description || ''}</textarea>
                    </div>

                    <!-- Nội dung chi tiết -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nội dung giới thiệu (mỗi dòng là 1 đoạn văn)
                        </label>
                        <textarea name="paragraphs" rows="6" 
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            placeholder="Đoạn 1...&#10;Đoạn 2...&#10;Đoạn 3...">${(about.paragraphs || []).join('\n')}</textarea>
                    </div>

                    <!-- Thống kê -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Thống kê nổi bật
                        </label>
                        <div id="stats-list" class="space-y-3">
                            ${(about.stats || []).map((s, i) => this.renderStatRow(s, i)).join('')}
                        </div>
                        <button type="button" onclick="AboutManager.addStat()" 
                            class="mt-3 px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 w-full">
                            + Thêm thống kê
                        </button>
                    </div>

                    <div id="about-error" class="text-red-500 text-sm hidden"></div>

                    <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('about-form').addEventListener('submit', (e) => this.handleSubmit(e));
    },

    renderStatRow(stat = {}, index) {
        return `
            <div class="flex gap-3 items-center stat-row" data-index="${index}">
                <input type="text" name="stat-value-${index}" value="${stat.value || ''}" placeholder="10K+" 
                    class="w-24 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-center font-bold">
                <input type="text" name="stat-label-${index}" value="${stat.label || ''}" placeholder="Học viên" 
                    class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                <button type="button" onclick="AboutManager.removeStat(${index})" class="p-2 text-red-500 hover:bg-red-50 rounded">🗑️</button>
            </div>
        `;
    },

    addStat() {
        const list = document.getElementById('stats-list');
        const index = list.querySelectorAll('.stat-row').length;
        list.insertAdjacentHTML('beforeend', this.renderStatRow({}, index));
    },

    removeStat(index) {
        const row = document.querySelector(`.stat-row[data-index="${index}"]`);
        if (row) row.remove();
    },

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const errorEl = document.getElementById('about-error');
        const btn = form.querySelector('button[type="submit"]');

        // Collect stats
        const stats = [];
        document.querySelectorAll('.stat-row').forEach((row, i) => {
            const value = form[`stat-value-${row.dataset.index}`]?.value?.trim();
            const label = form[`stat-label-${row.dataset.index}`]?.value?.trim();
            if (value && label) {
                stats.push({ value, label });
            }
        });

        const aboutData = {
            title: form.title.value.trim(),
            description: form.description.value.trim(),
            paragraphs: form.paragraphs.value.split('\n').map(p => p.trim()).filter(Boolean),
            stats
        };

        try {
            btn.disabled = true;
            btn.textContent = 'Đang lưu...';
            errorEl.classList.add('hidden');

            this.config.about = aboutData;

            await GitHubAPI.updateJson('data/config.json', this.config, 'Update about page content');

            alert('✅ Đã lưu thành công!');
            await this.loadData();
        } catch (err) {
            errorEl.textContent = 'Lỗi: ' + err.message;
            errorEl.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Lưu thay đổi';
        }
    }
};

window.AboutManager = AboutManager;
