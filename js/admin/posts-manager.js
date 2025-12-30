// ==========================================
// POSTS-MANAGER.JS - CRUD Blog Posts
// Tách file: index JSON + markdown files
// With Quill Rich Text Editor
// ==========================================

const PostsManager = {
    posts: [],
    categories: [],
    editingId: null,
    editingContent: '',
    selectedIds: new Set(),
    quillEditor: null, // Quill instance

    async init() {
        await this.loadData();
        this.render();
    },

    async loadData() {
        try {
            const { content } = await GitHubAPI.getJson('data/posts-index.json');
            this.posts = content.posts || [];
            this.categories = content.categories || [];
        } catch (e) {
            const res = await fetch('data/posts-index.json');
            const data = await res.json();
            this.posts = data.posts || [];
            this.categories = data.categories || [];
        }
    },

    render() {
        const container = document.getElementById('tab-content');
        container.innerHTML = `
            <div class="space-y-4">
                <div class="flex flex-wrap gap-4 items-center justify-between">
                    <input type="text" id="post-search" placeholder="Tìm bài viết..."
                        class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <div class="flex gap-2">
                        <button id="bulk-delete-posts-btn" class="hidden px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                            🗑️ Xóa (<span id="selected-posts-count">0</span>)
                        </button>
                        <button id="manage-post-categories-btn" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
                            📁 Danh mục
                        </button>
                        <button id="add-post-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            + Thêm bài viết
                        </button>
                    </div>
                </div>
                <div id="posts-list" class="space-y-2"></div>
            </div>
            <div id="post-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"></div>
            </div>
            <div id="post-category-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"></div>
            </div>
        `;
        this.selectedIds.clear();
        this.renderList();
        this.setupEvents();
    },

    renderList(filter = '') {
        const list = document.getElementById('posts-list');
        let filtered = [...this.posts].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        
        if (filter) {
            const q = filter.toLowerCase();
            filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
        }

        if (!filtered.length) {
            list.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-8">Không có bài viết nào</p>';
            return;
        }

        list.innerHTML = filtered.map(p => `
            <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <input type="checkbox" class="post-checkbox w-5 h-5 rounded border-gray-300 dark:border-gray-600" 
                    data-id="${p.id}" ${this.selectedIds.has(p.id) ? 'checked' : ''} onchange="PostsManager.toggleSelect(${p.id})">
                <div class="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center text-2xl">📝</div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-gray-800 dark:text-white truncate">${p.title}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${p.category} • ${p.publishedAt} • ${p.readTime} phút • ${p.views.toLocaleString()} views</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="px-2 py-1 text-xs rounded ${p.featured ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'}">${p.featured ? 'Featured' : 'Normal'}</span>
                    <button onclick="PostsManager.edit(${p.id})" class="p-2 text-blue-600 hover:bg-blue-50 rounded">✏️</button>
                    <button onclick="PostsManager.delete(${p.id})" class="p-2 text-red-600 hover:bg-red-50 rounded">🗑️</button>
                </div>
            </div>
        `).join('');
    },

    toggleSelect(id) {
        if (this.selectedIds.has(id)) {
            this.selectedIds.delete(id);
        } else {
            this.selectedIds.add(id);
        }
        this.updateBulkDeleteBtn();
    },

    updateBulkDeleteBtn() {
        const btn = document.getElementById('bulk-delete-posts-btn');
        const count = document.getElementById('selected-posts-count');
        if (btn && count) {
            count.textContent = this.selectedIds.size;
            btn.classList.toggle('hidden', this.selectedIds.size === 0);
        }
    },

    async bulkDelete() {
        const count = this.selectedIds.size;
        if (count === 0) return;

        const deleteFiles = confirm(`Bạn có muốn xóa cả file markdown không?\n\nOK = Xóa cả file\nCancel = Chỉ xóa khỏi index`);
        
        if (!confirm(`Bạn có chắc muốn xóa ${count} bài viết đã chọn?\n\n⚠️ Hành động này không thể hoàn tác!`)) return;

        try {
            const btn = document.getElementById('bulk-delete-posts-btn');
            btn.disabled = true;
            btn.textContent = 'Đang xóa...';

            // Get posts to delete (for file deletion)
            const postsToDelete = this.posts.filter(p => this.selectedIds.has(p.id));
            
            // Remove from index
            this.posts = this.posts.filter(p => !this.selectedIds.has(p.id));
            
            await GitHubAPI.updateJson('data/posts-index.json', {
                posts: this.posts,
                categories: this.categories
            }, `Bulk delete ${count} posts`);

            await this.loadData();

            // Optionally delete markdown files
            if (deleteFiles) {
                for (const post of postsToDelete) {
                    if (post.content) {
                        try {
                            await GitHubAPI.deleteFile(post.content, `Delete post file: ${post.title}`);
                        } catch (e) {
                            console.warn('Could not delete markdown file:', e);
                        }
                    }
                }
            }

            this.selectedIds.clear();
            this.renderList();
            this.updateBulkDeleteBtn();
            
            alert(`✅ Đã xóa ${count} bài viết thành công!`);
        } catch (err) {
            alert('❌ Lỗi: ' + err.message + '\n\n💡 Thử nhấn Ctrl+Shift+R để refresh rồi thử lại.');
        } finally {
            const btn = document.getElementById('bulk-delete-posts-btn');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '🗑️ Xóa (<span id="selected-posts-count">0</span>)';
            }
        }
    },

    setupEvents() {
        document.getElementById('post-search')?.addEventListener('input', (e) => this.renderList(e.target.value));
        document.getElementById('add-post-btn')?.addEventListener('click', () => this.showForm());
        document.getElementById('manage-post-categories-btn')?.addEventListener('click', () => this.showCategoryManager());
        document.getElementById('bulk-delete-posts-btn')?.addEventListener('click', () => this.bulkDelete());
    },

    // ==========================================
    // CATEGORY MANAGEMENT
    // ==========================================
    showCategoryManager() {
        const modal = document.getElementById('post-category-modal');
        const content = modal.querySelector('div');
        
        content.innerHTML = `
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Quản lý danh mục bài viết</h3>
                <div id="post-categories-list" class="space-y-2 mb-4"></div>
                <div class="flex gap-2">
                    <input type="text" id="new-post-category-name" placeholder="Tên danh mục mới" 
                        class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <button onclick="PostsManager.addCategory()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Thêm</button>
                </div>
                <div id="post-category-error" class="text-red-500 text-sm mt-2 hidden"></div>
                <div class="flex justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onclick="PostsManager.closeCategoryManager()" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">Đóng</button>
                </div>
            </div>
        `;
        
        this.renderCategories();
        modal.classList.remove('hidden');
    },

    renderCategories() {
        const list = document.getElementById('post-categories-list');
        if (!list) return;
        
        list.innerHTML = this.categories.map(c => `
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full" style="background-color: ${c.color || '#888'}"></span>
                    <span class="text-gray-800 dark:text-white font-medium">${c.name}</span>
                    <span class="text-xs text-gray-500">(${c.id})</span>
                </div>
                <button onclick="PostsManager.deleteCategory('${c.id}')" class="text-red-500 hover:text-red-700 p-1">🗑️</button>
            </div>
        `).join('');
    },

    async addCategory() {
        const input = document.getElementById('new-post-category-name');
        const errorEl = document.getElementById('post-category-error');
        const name = input.value.trim();
        
        if (!name) {
            errorEl.textContent = 'Vui lòng nhập tên danh mục';
            errorEl.classList.remove('hidden');
            return;
        }

        const id = name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        if (this.categories.some(c => c.id === id)) {
            errorEl.textContent = 'Danh mục này đã tồn tại';
            errorEl.classList.remove('hidden');
            return;
        }

        const colors = ['blue', 'green', 'purple', 'pink', 'orange', 'red', 'yellow', 'teal'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        try {
            this.categories.push({ id, name, color: randomColor });
            
            await GitHubAPI.updateJson('data/posts-index.json', {
                posts: this.posts,
                categories: this.categories
            }, `Add category: ${name}`);

            await this.loadData();
            
            input.value = '';
            errorEl.classList.add('hidden');
            this.renderCategories();
            alert('Đã thêm danh mục!');
        } catch (err) {
            errorEl.textContent = 'Lỗi: ' + err.message;
            errorEl.classList.remove('hidden');
        }
    },

    async deleteCategory(id) {
        const category = this.categories.find(c => c.id === id);
        if (!category) return;

        const postsInCategory = this.posts.filter(p => p.category === id);
        if (postsInCategory.length > 0) {
            alert(`Không thể xóa! Có ${postsInCategory.length} bài viết đang dùng danh mục này.`);
            return;
        }

        if (!confirm(`Xác nhận xóa danh mục "${category.name}"?`)) return;

        try {
            this.categories = this.categories.filter(c => c.id !== id);
            
            await GitHubAPI.updateJson('data/posts-index.json', {
                posts: this.posts,
                categories: this.categories
            }, `Delete category: ${category.name}`);

            await this.loadData();
            this.renderCategories();
            alert('Đã xóa danh mục!');
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    },

    closeCategoryManager() {
        document.getElementById('post-category-modal').classList.add('hidden');
    },

    async showForm(post = null) {
        this.editingId = post?.id || null;
        this.editingContent = '';
        
        // Load markdown content nếu edit
        if (post?.content) {
            try {
                const { content } = await GitHubAPI.getRawFile(post.content);
                this.editingContent = content;
            } catch (e) {
                console.error('Error loading post content:', e);
            }
        }

        const modal = document.getElementById('post-modal');
        const container = modal.querySelector('div');
        
        container.innerHTML = `
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">${post ? 'Sửa' : 'Thêm'} bài viết</h3>
                <form id="post-form" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiêu đề</label>
                            <input type="text" name="title" id="post-title" value="${post?.title || ''}" required 
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
                            <input type="text" name="slug" id="post-slug" value="${post?.slug || ''}" required 
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Danh mục</label>
                            <select name="category" required class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                ${this.categories.map(c => `<option value="${c.id}" ${post?.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả ngắn</label>
                            <textarea name="excerpt" rows="2" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">${post?.excerpt || ''}</textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tác giả</label>
                            <input type="text" name="authorName" value="${post?.author?.name || 'Admin'}" 
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thời gian đọc (phút)</label>
                            <input type="number" name="readTime" value="${post?.readTime || 5}" min="1" 
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                            <input type="text" name="tags" value="${post?.tags?.join(', ') || ''}" 
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nổi bật?</label>
                            <select name="featured" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                <option value="false" ${!post?.featured ? 'selected' : ''}>Không</option>
                                <option value="true" ${post?.featured ? 'selected' : ''}>Có</option>
                            </select>
                        </div>
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ảnh banner</label>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">📐 Kích thước khuyến nghị: 1200 x 630px (tỷ lệ 1.9:1)</p>
                            <input type="file" id="post-image" accept="image/*" class="w-full">
                            <div id="post-image-preview" class="mt-2 ${post?.image && !post.image.includes('default') ? '' : 'hidden'}">
                                <img src="${post?.image || ''}" class="h-32 rounded-lg object-cover">
                            </div>
                        </div>
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nội dung bài viết</label>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">💡 Nhấn nút 🖼️ trên toolbar để chọn và upload ảnh từ máy tính</p>
                            <div id="quill-editor" class="bg-white dark:bg-gray-800 rounded-lg"></div>
                            <input type="hidden" name="content" id="post-content">
                        </div>
                    </div>
                    <div id="form-error" class="text-red-500 text-sm hidden"></div>
                    <div class="flex gap-3 justify-end pt-4">
                        <button type="button" onclick="PostsManager.closeForm()" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">Hủy</button>
                        <button type="submit" id="post-submit-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu</button>
                    </div>
                </form>
            </div>
        `;

        modal.classList.remove('hidden');
        
        // Initialize Quill Editor
        this.initQuillEditor();
        
        // Auto generate slug from title
        document.getElementById('post-title')?.addEventListener('input', (e) => {
            if (!this.editingId) {
                document.getElementById('post-slug').value = Validators.slugify(e.target.value);
            }
        });
        
        document.getElementById('post-form').addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('post-image')?.addEventListener('change', (e) => this.handleImageChange(e));
    },

    initQuillEditor() {
        // Custom image handler - upload from local file
        const imageHandler = async () => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = async () => {
                const file = input.files[0];
                if (!file) return;

                try {
                    // Show loading
                    const range = this.quillEditor.getSelection(true);
                    this.quillEditor.insertText(range.index, '⏳ Đang upload ảnh...', { italic: true });

                    // Compress image
                    const result = await ImageTools.compress(file, {
                        maxWidth: 1200,
                        maxHeight: 800,
                        quality: 0.85
                    });

                    // Upload to GitHub
                    const uploadResult = await GitHubAPI.uploadImage(result.file, 'assets/images/posts');
                    
                    // Remove loading text and insert image
                    this.quillEditor.deleteText(range.index, '⏳ Đang upload ảnh...'.length);
                    this.quillEditor.insertEmbed(range.index, 'image', uploadResult.path);
                    this.quillEditor.setSelection(range.index + 1);

                } catch (err) {
                    alert('Lỗi upload ảnh: ' + err.message);
                    // Remove loading text
                    const content = this.quillEditor.getText();
                    const loadingIdx = content.indexOf('⏳ Đang upload ảnh...');
                    if (loadingIdx !== -1) {
                        this.quillEditor.deleteText(loadingIdx, '⏳ Đang upload ảnh...'.length);
                    }
                }
            };
        };

        // Initialize Quill
        this.quillEditor = new Quill('#quill-editor', {
            theme: 'snow',
            placeholder: 'Viết nội dung bài viết tại đây...',
            modules: {
                toolbar: {
                    container: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        ['blockquote', 'code-block'],
                        ['link', 'image'],
                        [{ 'align': [] }],
                        ['clean']
                    ],
                    handlers: {
                        image: imageHandler
                    }
                }
            }
        });

        // Load existing content (convert markdown to HTML if needed)
        if (this.editingContent) {
            const htmlContent = this.markdownToHtml(this.editingContent);
            this.quillEditor.root.innerHTML = htmlContent;
        }
    },

    // Simple markdown to HTML converter
    markdownToHtml(md) {
        let html = md
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold & Italic
            .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            // Images
            .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1">')
            // Links
            .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
            // Code blocks
            .replace(/```([\s\S]*?)```/gim, '<pre class="ql-syntax">$1</pre>')
            // Inline code
            .replace(/`(.*?)`/gim, '<code>$1</code>')
            // Blockquotes
            .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
            // Unordered lists
            .replace(/^\- (.*$)/gim, '<li>$1</li>')
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            // Line breaks
            .replace(/\n\n/gim, '</p><p>')
            .replace(/\n/gim, '<br>');
        
        // Wrap in paragraph if not already wrapped
        if (!html.startsWith('<')) {
            html = '<p>' + html + '</p>';
        }
        
        return html;
    },

    // HTML to Markdown converter
    htmlToMarkdown(html) {
        let md = html
            // Remove Quill specific classes
            .replace(/<p class="ql-[^"]*">/gi, '<p>')
            .replace(/<span class="ql-[^"]*">/gi, '')
            .replace(/<\/span>/gi, '')
            // Headers
            .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
            .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
            .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
            // Bold & Italic
            .replace(/<strong><em>(.*?)<\/em><\/strong>/gi, '***$1***')
            .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
            .replace(/<b>(.*?)<\/b>/gi, '**$1**')
            .replace(/<em>(.*?)<\/em>/gi, '*$1*')
            .replace(/<i>(.*?)<\/i>/gi, '*$1*')
            // Images
            .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
            .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
            // Links
            .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
            // Code blocks
            .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '```\n$1\n```\n\n')
            // Inline code
            .replace(/<code>(.*?)<\/code>/gi, '`$1`')
            // Blockquotes
            .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
            // Lists
            .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '$1\n')
            .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, '$1\n')
            .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
            // Paragraphs & line breaks
            .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
            .replace(/<br\s*\/?>/gi, '\n')
            // Clean up
            .replace(/<[^>]+>/g, '') // Remove remaining HTML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/\n{3,}/g, '\n\n') // Max 2 newlines
            .trim();
        
        return md;
    },

    async handleImageChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        const previewEl = document.getElementById('post-image-preview');
        previewEl.innerHTML = '<p class="text-gray-500">Đang xử lý ảnh...</p>';
        previewEl.classList.remove('hidden');

        try {
            const validation = ImageTools.validate(file);
            if (!validation.valid) {
                throw new Error(validation.errors.join('. '));
            }

            const result = await ImageTools.compress(file, {
                maxWidth: 1200,
                maxHeight: 630,
                quality: 0.85
            });
            
            const preview = await ImageTools.getPreview(result.file);
            
            previewEl.innerHTML = `
                <img src="${preview}" class="h-32 rounded-lg object-cover">
                <p class="text-xs text-gray-500 mt-1">
                    ${ImageTools.formatSize(result.originalSize)} → ${ImageTools.formatSize(result.compressedSize)} 
                    <span class="text-green-600">(giảm ${result.savings}%)</span>
                </p>
            `;
            
            this.pendingImage = result.file;
        } catch (err) {
            previewEl.innerHTML = `<p class="text-red-500 text-sm">${err.message}</p>`;
            this.pendingImage = null;
        }
    },

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const errorEl = document.getElementById('form-error');
        const submitBtn = document.getElementById('post-submit-btn');
        
        const slug = form.slug.value.trim();
        const today = new Date().toISOString().split('T')[0];
        
        // Get content from Quill editor and convert to markdown
        const htmlContent = this.quillEditor.root.innerHTML;
        const content = this.htmlToMarkdown(htmlContent);
        
        const metadata = {
            title: form.title.value.trim(),
            slug: slug,
            excerpt: form.excerpt.value.trim(),
            category: form.category.value,
            author: {
                name: form.authorName.value.trim() || 'Admin',
                avatar: 'assets/images/authors/default.jpg'
            },
            tags: form.tags.value.split(',').map(t => t.trim()).filter(Boolean),
            readTime: parseInt(form.readTime.value) || 5,
            featured: form.featured.value === 'true'
        };

        // Validate
        const errors = Validators.post(metadata);
        if (!content || content === '<p><br></p>') errors.push('Nội dung không được trống');
        if (errors.length) {
            errorEl.textContent = errors.join(', ');
            errorEl.classList.remove('hidden');
            return;
        }

        // Check slug unique (for new posts)
        if (!this.editingId && this.posts.some(p => p.slug === slug)) {
            errorEl.textContent = 'Slug đã tồn tại, vui lòng chọn slug khác';
            errorEl.classList.remove('hidden');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang lưu...';

            // Upload image if pending
            let imagePath = null;
            if (this.pendingImage) {
                const result = await GitHubAPI.uploadImage(this.pendingImage, 'assets/images/posts');
                imagePath = result.path;
                this.pendingImage = null;
            }

            // Generate file path
            const mdPath = `content/posts/${today}-${slug}.md`;
            
            // Encode markdown content to base64
            const contentBase64 = btoa(unescape(encodeURIComponent(content)));

            if (this.editingId) {
                // UPDATE existing post
                const idx = this.posts.findIndex(p => p.id === this.editingId);
                if (idx !== -1) {
                    const oldPost = this.posts[idx];
                    
                    // Update markdown file
                    await GitHubAPI.createOrUpdateFile(
                        oldPost.content, // Use existing path
                        contentBase64,
                        `Update post: ${metadata.title}`
                    );

                    // Update metadata in index
                    this.posts[idx] = {
                        ...oldPost,
                        ...metadata,
                        id: this.editingId,
                        image: imagePath || oldPost.image
                    };
                }
            } else {
                // CREATE new post
                // 1. Create markdown file
                await GitHubAPI.createOrUpdateFile(
                    mdPath,
                    contentBase64,
                    `Create post: ${metadata.title}`
                );

                // 2. Add to index
                const newPost = {
                    ...metadata,
                    id: Math.max(0, ...this.posts.map(p => p.id)) + 1,
                    content: mdPath,
                    image: imagePath || 'assets/images/posts/default.jpg',
                    views: 0,
                    publishedAt: today
                };
                this.posts.push(newPost);
            }

            // 3. Update posts-index.json
            await GitHubAPI.updateJson('data/posts-index.json', {
                posts: this.posts,
                categories: this.categories
            }, `${this.editingId ? 'Update' : 'Add'} post index: ${metadata.title}`);

            // Reload data để lấy SHA mới (tránh lỗi SHA mismatch khi save tiếp)
            await this.loadData();

            this.closeForm();
            this.renderList();
            alert('Đã lưu thành công!');

        } catch (err) {
            errorEl.textContent = 'Lỗi: ' + err.message;
            errorEl.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Lưu';
        }
    },

    closeForm() {
        document.getElementById('post-modal').classList.add('hidden');
        this.editingId = null;
        this.editingContent = '';
        this.quillEditor = null;
    },

    edit(id) {
        const post = this.posts.find(p => p.id === id);
        if (post) this.showForm(post);
    },

    async delete(id) {
        const post = this.posts.find(p => p.id === id);
        if (!post) return;

        const deleteFile = confirm('Bạn có muốn xóa cả file markdown không?\n\nOK = Xóa cả file\nCancel = Chỉ xóa khỏi index');
        
        if (!confirm(`Xác nhận xóa bài viết "${post.title}"?`)) return;

        try {
            // Remove from index
            this.posts = this.posts.filter(p => p.id !== id);
            
            // Update index first
            await GitHubAPI.updateJson('data/posts-index.json', {
                posts: this.posts,
                categories: this.categories
            }, `Delete post from index: ${post.title}`);

            // Reload data để lấy SHA mới
            await this.loadData();

            // Optionally delete markdown file
            if (deleteFile && post.content) {
                try {
                    await GitHubAPI.deleteFile(post.content, `Delete post file: ${post.title}`);
                } catch (e) {
                    console.warn('Could not delete markdown file:', e);
                }
            }

            this.renderList();
            alert('Đã xóa thành công!');
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    }
};

window.PostsManager = PostsManager;
