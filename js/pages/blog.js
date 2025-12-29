// ==========================================
// BLOG.JS - Trang blog
// ==========================================

const BlogPage = {
    posts: [],
    categories: [],
    filters: { category: '', search: '' },

    async init() {
        await this.loadData();
        this.renderFilters();
        this.renderPosts();
        this.setupEvents();
    },

    async loadData() {
        try {
            const res = await fetch('data/posts-index.json');
            const data = await res.json();
            this.posts = data.posts;
            this.categories = data.categories;
        } catch (e) {
            console.error('[Blog] Error loading:', e);
        }
    },

    renderFilters() {
        const container = document.getElementById('blog-filters');
        if (!container) return;
        container.innerHTML = `
            <div class="flex flex-wrap gap-4 items-center justify-between glass-card bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                <div class="flex flex-wrap gap-3">
                    <button data-cat="" class="cat-btn active px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white">Tất cả</button>
                    ${this.categories.map(c => `<button data-cat="${c.id}" class="cat-btn px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">${c.name}</button>`).join('')}
                </div>
                <input type="text" id="blog-search" placeholder="Tìm bài viết..." class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
            </div>`;
    },

    renderPosts() {
        const container = document.getElementById('posts-grid');
        if (!container) return;
        let filtered = [...this.posts];
        if (this.filters.category) filtered = filtered.filter(p => p.category === this.filters.category);
        if (this.filters.search) {
            const q = this.filters.search.toLowerCase();
            filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q));
        }
        if (!filtered.length) {
            container.innerHTML = `<div class="col-span-full text-center py-12"><p class="text-gray-500 dark:text-gray-400">Không tìm thấy bài viết</p></div>`;
            return;
        }
        container.innerHTML = filtered.map(p => this.renderPostCard(p)).join('');
    },

    renderPostCard(p) {
        const catInfo = this.categories.find(c => c.id === p.category) || {};
        const colors = { blue: 'bg-blue-100 text-blue-600', green: 'bg-green-100 text-green-600', purple: 'bg-purple-100 text-purple-600', pink: 'bg-pink-100 text-pink-600' };
        return `
            <a href="post.html?slug=${p.slug}" class="glass-card bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow">
                <div class="h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center">
                    <span class="text-5xl">📝</span>
                </div>
                <div class="p-5">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs px-2 py-1 rounded ${colors[catInfo.color] || 'bg-gray-100 text-gray-600'}">${catInfo.name || p.category}</span>
                        ${p.featured ? '<span class="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">Nổi bật</span>' : ''}
                    </div>
                    <h3 class="font-semibold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">${p.title}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">${p.excerpt}</p>
                    <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div class="flex items-center gap-2"><span>${p.author.name}</span><span>•</span><span>${p.publishedAt}</span></div>
                        <span>${p.readTime} phút</span>
                    </div>
                </div>
            </a>`;
    },

    setupEvents() {
        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.cat-btn').forEach(b => { b.classList.remove('active', 'bg-blue-600', 'text-white'); b.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-gray-700'); });
                btn.classList.add('active', 'bg-blue-600', 'text-white'); btn.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-gray-700');
                this.filters.category = btn.dataset.cat;
                this.renderPosts();
            });
        });
        let t; document.getElementById('blog-search')?.addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { this.filters.search = e.target.value; this.renderPosts(); }, 300); });
    }
};

document.addEventListener('DOMContentLoaded', () => BlogPage.init());
