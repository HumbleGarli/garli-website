// ==========================================
// ABOUT.JS - Trang giới thiệu
// ==========================================

const AboutPage = {
    async init() {
        try {
            const res = await fetch('data/config.json');
            const config = await res.json();
            this.render(config.about || this.getDefaultContent(config));
        } catch (e) {
            console.error('[About] Error:', e);
            this.render(this.getDefaultContent({}));
        }
    },

    getDefaultContent(config) {
        return {
            title: config.siteName || 'Garli',
            description: 'Chào mừng bạn đến với website của chúng tôi',
            paragraphs: [
                'Chúng tôi cung cấp các sản phẩm và dịch vụ chất lượng.',
                'Liên hệ với chúng tôi để được hỗ trợ tốt nhất.'
            ],
            stats: [
                { value: '10K+', label: 'Khách hàng' },
                { value: '50+', label: 'Sản phẩm' },
                { value: '100+', label: 'Đánh giá 5 sao' }
            ]
        };
    },

    render(about) {
        const container = document.getElementById('about-content');
        if (!container) return;

        container.innerHTML = `
            <div class="glass-card bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">${about.title || 'Giới thiệu'}</h2>
                
                ${about.description ? `<p class="text-lg text-gray-600 dark:text-gray-400 mb-6">${about.description}</p>` : ''}
                
                ${(about.paragraphs || []).map(p => `
                    <p class="text-gray-600 dark:text-gray-400 mb-4">${p}</p>
                `).join('')}
                
                ${about.stats?.length ? `
                    <div class="grid grid-cols-1 md:grid-cols-${Math.min(about.stats.length, 4)} gap-6 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                        ${about.stats.map(s => `
                            <div class="text-center">
                                <div class="text-4xl font-bold text-blue-600 dark:text-blue-400">${s.value}</div>
                                <div class="text-gray-500 dark:text-gray-400 mt-1">${s.label}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => AboutPage.init());
