// ==========================================
// RESOURCES.JS - Trang tài nguyên
// ==========================================

const ResourcesPage = {
    resources: [],
    types: [],
    filters: {
        type: '',
        search: ''
    },

    async init() {
        await this.loadData();
        this.renderFilters();
        this.renderResources();
        this.setupEvents();
    },

    async loadData() {
        try {
            const res = await fetch(SiteConfig.getNoCacheUrl('data/resources.json'));
            const data = await res.json();
            this.resources = data.resources;
            this.types = data.types;
        } catch (e) {
            console.error('[Resources] Error loading:', e);
        }
    },

    renderFilters() {
        const container = document.getElementById('resources-filters');
        if (!container) return;

        container.innerHTML = `
            <div class="flex flex-wrap gap-4 items-center justify-between glass-card bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                <div class="tab-container" id="resources-tabs">
                    <div class="tab-indicator"></div>
                    <button data-type="" class="tab-btn type-btn active">Tất cả</button>
                    ${this.types.map(t => `
                        <button data-type="${t.id}" class="tab-btn type-btn">${t.name}</button>
                    `).join('')}
                </div>
                <input type="text" id="resources-search" placeholder="Tìm tài nguyên..." class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
        `;

        setTimeout(() => this.initTabIndicator('resources-tabs'), 0);
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

    renderResources() {
        const container = document.getElementById('resources-grid');
        if (!container) return;

        let filtered = [...this.resources];

        if (this.filters.type) {
            filtered = filtered.filter(r => r.type === this.filters.type);
        }

        if (this.filters.search) {
            const q = this.filters.search.toLowerCase();
            filtered = filtered.filter(r =>
                r.title.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q) ||
                r.tags.some(t => t.toLowerCase().includes(q))
            );
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-gray-500 dark:text-gray-400">Không tìm thấy tài nguyên nào</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(r => this.renderResourceCard(r)).join('');
    },

    renderResourceCard(r) {
        const typeInfo = this.types.find(t => t.id === r.type) || { name: r.type };
        const formatColors = {
            pdf: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
            zip: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
            md: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
            mp4: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
        };

        return `
            <div class="glass-card bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                <div class="h-40 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900 dark:to-teal-900 flex items-center justify-center">
                    <span class="text-5xl">${r.type === 'video' ? '🎬' : r.type === 'code' ? '💻' : '📄'}</span>
                </div>
                <div class="p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs px-2 py-1 rounded ${formatColors[r.format] || 'bg-gray-100 text-gray-600'}">${r.format.toUpperCase()}</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">${typeInfo.name}</span>
                    </div>
                    <h3 class="font-semibold text-gray-800 dark:text-white mb-2">${r.title}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">${r.description}</p>
                    <div class="flex flex-wrap gap-1 mb-3">
                        ${r.tags.map(t => `<span class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">${t}</span>`).join('')}
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-500 dark:text-gray-400">
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                            </svg>
                            ${r.downloadCount.toLocaleString()}
                        </span>
                        <a href="${r.url}" target="_blank" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">Tải xuống</a>
                    </div>
                </div>
            </div>
        `;
    },

    setupEvents() {
        const container = document.getElementById('resources-tabs');
        const indicator = container?.querySelector('.tab-indicator');

        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                if (indicator) {
                    this.moveIndicator(indicator, btn);
                }

                this.filters.type = btn.dataset.type;
                this.renderResources();
            });
        });

        let searchTimeout;
        document.getElementById('resources-search')?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filters.search = e.target.value;
                this.renderResources();
            }, 300);
        });

        window.addEventListener('resize', () => {
            const activeBtn = container?.querySelector('.tab-btn.active');
            if (indicator && activeBtn) {
                this.moveIndicator(indicator, activeBtn);
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => ResourcesPage.init());
