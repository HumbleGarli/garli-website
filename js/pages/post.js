// ==========================================
// POST.JS - Trang chi tiết bài viết
// Sử dụng marked + DOMPurify để render markdown an toàn
// ==========================================

const PostPage = {
    async init() {
        const slug = new URLSearchParams(window.location.search).get('slug');
        if (!slug) {
            this.renderError('Không tìm thấy bài viết');
            return;
        }
        const post = await this.getPostBySlug(slug);
        if (!post) {
            this.renderError('Bài viết không tồn tại');
            return;
        }
        await this.renderPost(post);
    },

    async getPostBySlug(slug) {
        try {
            const res = await fetch('data/posts-index.json');
            const { posts } = await res.json();
            return posts.find(p => p.slug === slug);
        } catch (e) {
            console.error('[Post] Error:', e);
            return null;
        }
    },

    async renderPost(post) {
        const container = document.getElementById('post-content');
        if (!container) return;

        let content = '';
        try {
            const res = await fetch(post.content);
            const md = await res.text();
            // Parse markdown với marked, sanitize với DOMPurify
            const rawHtml = marked.parse(md);
            content = DOMPurify.sanitize(rawHtml);
        } catch (e) {
            content = DOMPurify.sanitize(`<p>${post.excerpt}</p>`);
        }

        // Sanitize tất cả data từ JSON trước khi render
        const safeTitle = DOMPurify.sanitize(post.title);
        const safeAuthor = DOMPurify.sanitize(post.author.name);
        const safeCategory = DOMPurify.sanitize(post.category);

        const safeTags = post.tags.map(t => DOMPurify.sanitize(t));

        container.innerHTML = DOMPurify.sanitize(`
            <article class="max-w-3xl mx-auto">
                <header class="mb-8">
                    <span class="text-sm text-blue-600 dark:text-blue-400 uppercase">${safeCategory}</span>
                    <h1 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mt-2 mb-4">${safeTitle}</h1>
                    <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>${safeAuthor}</span>
                        <span>•</span>
                        <span>${post.publishedAt}</span>
                        <span>•</span>
                        <span>${post.readTime} phút đọc</span>
                        <span>•</span>
                        <span>${post.views.toLocaleString()} lượt xem</span>
                    </div>
                </header>
                <div class="h-64 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-xl flex items-center justify-center mb-8">
                    <span class="text-6xl">📝</span>
                </div>
                <div class="prose-content max-w-none">${content}</div>
                <footer class="mt-8 pt-8">
                    <div class="flex flex-wrap gap-3">
                        ${safeTags.map(t => `<span class="px-4 py-2 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm shadow-sm">#${t}</span>`).join('')}
                    </div>
                </footer>
            </article>
        `);
    },

    renderError(msg) {
        const container = document.getElementById('post-content');
        if (container) {
            container.innerHTML = DOMPurify.sanitize(`
                <div class="text-center py-12">
                    <p class="text-gray-500 dark:text-gray-400">${msg}</p>
                    <a href="blog.html" class="text-blue-600 hover:underline mt-4 inline-block">← Quay lại blog</a>
                </div>
            `);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => PostPage.init());
