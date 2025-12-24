// ==========================================
// GITHUB-API.JS - GitHub Contents API wrapper
// Dùng cho admin panel để CRUD data trên repo
// ==========================================

const GitHubAPI = {
    // Config - sẽ được set từ admin UI
    config: {
        owner: '',      // GitHub username
        repo: '',       // Repository name
        branch: 'main', // Branch mặc định
        token: ''       // Personal Access Token
    },

    // ==========================================
    // CONFIG
    // ==========================================
    setConfig({ owner, repo, branch = 'main', token }) {
        this.config = { owner, repo, branch, token };
        // Lưu vào localStorage (trừ token vì lý do bảo mật)
        localStorage.setItem('github_config', JSON.stringify({ owner, repo, branch }));
    },

    loadConfig() {
        const saved = localStorage.getItem('github_config');
        if (saved) {
            const { owner, repo, branch } = JSON.parse(saved);
            this.config.owner = owner;
            this.config.repo = repo;
            this.config.branch = branch || 'main';
        }
        // Token phải nhập lại mỗi session
        return this.config;
    },

    isConfigured() {
        return !!(this.config.owner && this.config.repo && this.config.token);
    },

    // ==========================================
    // BASE REQUEST
    // ==========================================
    async request(endpoint, options = {}) {
        if (!this.isConfigured()) {
            throw new Error('GitHub API chưa được cấu hình');
        }

        const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}${endpoint}`;

        const res = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.config.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || `GitHub API error: ${res.status}`);
        }

        return res.status === 204 ? null : res.json();
    },

    // ==========================================
    // GET JSON - Đọc file JSON + sha
    // ==========================================
    async getJson(path) {
        try {
            const data = await this.request(`/contents/${path}?ref=${this.config.branch}`);
            const content = JSON.parse(atob(data.content));
            return { content, sha: data.sha, path: data.path };
        } catch (e) {
            console.error(`[GitHubAPI] getJson error (${path}):`, e);
            throw e;
        }
    },

    // ==========================================
    // UPDATE JSON - Cập nhật file JSON
    // ==========================================
    async updateJson(path, json, message = 'Update via admin') {
        try {
            // Lấy sha hiện tại
            const { sha } = await this.getJson(path);
            
            // Encode content
            const content = btoa(unescape(encodeURIComponent(JSON.stringify(json, null, 2))));
            
            // Update file
            const result = await this.request(`/contents/${path}`, {
                method: 'PUT',
                body: JSON.stringify({
                    message,
                    content,
                    sha,
                    branch: this.config.branch
                })
            });
            
            return { success: true, sha: result.content.sha };
        } catch (e) {
            console.error(`[GitHubAPI] updateJson error (${path}):`, e);
            throw e;
        }
    },

    // ==========================================
    // CREATE OR UPDATE FILE - Cho markdown/ảnh
    // ==========================================
    async createOrUpdateFile(path, contentBase64, message = 'Create/update file via admin') {
        try {
            let sha = null;
            
            // Kiểm tra file đã tồn tại chưa
            try {
                const existing = await this.request(`/contents/${path}?ref=${this.config.branch}`);
                sha = existing.sha;
            } catch (e) {
                // File chưa tồn tại, tạo mới
            }

            const body = {
                message,
                content: contentBase64,
                branch: this.config.branch
            };
            
            if (sha) body.sha = sha;

            const result = await this.request(`/contents/${path}`, {
                method: 'PUT',
                body: JSON.stringify(body)
            });

            return { 
                success: true, 
                sha: result.content.sha,
                url: result.content.download_url,
                path: result.content.path
            };
        } catch (e) {
            console.error(`[GitHubAPI] createOrUpdateFile error (${path}):`, e);
            throw e;
        }
    },

    // ==========================================
    // UPLOAD IMAGE - Upload ảnh lên assets/images/
    // ==========================================
    async uploadImage(file, folder = 'assets/images') {
        try {
            // Validate file
            if (!file.type.startsWith('image/')) {
                throw new Error('File không phải là ảnh');
            }

            // Max 5MB
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Ảnh không được vượt quá 5MB');
            }

            // Generate unique filename
            const ext = file.name.split('.').pop().toLowerCase();
            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
            const filename = `${timestamp}-${safeName}`;
            const path = `${folder}/${filename}`;

            // Convert to base64
            const base64 = await this.fileToBase64(file);
            
            // Upload
            const result = await this.createOrUpdateFile(
                path,
                base64,
                `Upload image: ${filename}`
            );

            return {
                success: true,
                filename,
                path: result.path,
                url: result.url
            };
        } catch (e) {
            console.error('[GitHubAPI] uploadImage error:', e);
            throw e;
        }
    },

    // ==========================================
    // HELPER - File to Base64
    // ==========================================
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove data:*/*;base64, prefix
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    // ==========================================
    // DELETE FILE
    // ==========================================
    async deleteFile(path, message = 'Delete file via admin') {
        try {
            const { sha } = await this.request(`/contents/${path}?ref=${this.config.branch}`);
            
            await this.request(`/contents/${path}`, {
                method: 'DELETE',
                body: JSON.stringify({
                    message,
                    sha,
                    branch: this.config.branch
                })
            });

            return { success: true };
        } catch (e) {
            console.error(`[GitHubAPI] deleteFile error (${path}):`, e);
            throw e;
        }
    },

    // ==========================================
    // GET RAW FILE - Đọc file text (markdown)
    // ==========================================
    async getRawFile(path) {
        try {
            const data = await this.request(`/contents/${path}?ref=${this.config.branch}`);
            const content = decodeURIComponent(escape(atob(data.content)));
            return { content, sha: data.sha, path: data.path };
        } catch (e) {
            console.error(`[GitHubAPI] getRawFile error (${path}):`, e);
            throw e;
        }
    }
};

// Export for use
window.GitHubAPI = GitHubAPI;
