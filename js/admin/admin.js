// ==========================================
// ADMIN.JS - Admin Panel Core
// Login flow với session TTL
// ==========================================

const AdminAuth = {
    SESSION_KEY: 'admin_session',
    TTL_MINUTES: 30,
    timerInterval: null,

    // ==========================================
    // SESSION MANAGEMENT
    // ==========================================
    saveSession(owner, repo, token) {
        const session = {
            owner,
            repo,
            token,
            expiresAt: Date.now() + (this.TTL_MINUTES * 60 * 1000)
        };
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    },

    getSession() {
        const data = sessionStorage.getItem(this.SESSION_KEY);
        if (!data) return null;
        
        const session = JSON.parse(data);
        
        // Check expiry
        if (Date.now() > session.expiresAt) {
            this.clearSession();
            return null;
        }
        
        return session;
    },

    clearSession() {
        sessionStorage.removeItem(this.SESSION_KEY);
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    },

    extendSession() {
        const session = this.getSession();
        if (session) {
            session.expiresAt = Date.now() + (this.TTL_MINUTES * 60 * 1000);
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        }
    },

    getRemainingTime() {
        const session = this.getSession();
        if (!session) return 0;
        return Math.max(0, session.expiresAt - Date.now());
    },

    formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
};

const AdminPanel = {
    // ==========================================
    // INIT
    // ==========================================
    init() {
        this.loadSavedConfig();
        this.checkSession();
        this.setupEventListeners();
    },

    loadSavedConfig() {
        const saved = localStorage.getItem('github_config');
        if (saved) {
            const { owner, repo } = JSON.parse(saved);
            document.getElementById('input-owner').value = owner || '';
            document.getElementById('input-repo').value = repo || '';
        }
    },

    checkSession() {
        const session = AdminAuth.getSession();
        if (session) {
            this.initGitHubAPI(session);
            this.showDashboard();
            this.startSessionTimer();
            this.loadStats();
            this.switchTab('products'); // Load default tab
        } else {
            this.showLogin();
        }
    },

    // ==========================================
    // UI TOGGLE
    // ==========================================
    showLogin() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
    },

    showDashboard() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        
        const session = AdminAuth.getSession();
        if (session) {
            document.getElementById('user-info').textContent = `${session.owner}/${session.repo}`;
        }
    },

    // ==========================================
    // LOGIN
    // ==========================================
    async handleLogin(e) {
        e.preventDefault();
        
        const owner = document.getElementById('input-owner').value.trim();
        const repo = document.getElementById('input-repo').value.trim();
        const token = document.getElementById('input-token').value.trim();
        const errorEl = document.getElementById('login-error');
        const btnEl = document.getElementById('login-btn');

        errorEl.classList.add('hidden');
        btnEl.disabled = true;
        btnEl.textContent = 'Đang xác thực...';

        try {
            // Test token bằng cách gọi API
            GitHubAPI.setConfig({ owner, repo, token });
            await GitHubAPI.getJson('data/config.json');

            // Lưu session
            AdminAuth.saveSession(owner, repo, token);
            
            // Show dashboard
            this.showDashboard();
            this.startSessionTimer();
            this.loadStats();
            this.switchTab('products'); // Load default tab

        } catch (err) {
            errorEl.textContent = 'Xác thực thất bại. Kiểm tra lại thông tin.';
            errorEl.classList.remove('hidden');
        } finally {
            btnEl.disabled = false;
            btnEl.textContent = 'Đăng nhập';
        }
    },

    // ==========================================
    // LOGOUT
    // ==========================================
    handleLogout() {
        AdminAuth.clearSession();
        GitHubAPI.config.token = '';
        this.showLogin();
        document.getElementById('input-token').value = '';
    },

    // ==========================================
    // SESSION TIMER
    // ==========================================
    startSessionTimer() {
        const timerEl = document.getElementById('session-timer');
        
        const updateTimer = () => {
            const remaining = AdminAuth.getRemainingTime();
            
            if (remaining <= 0) {
                this.handleLogout();
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                return;
            }

            timerEl.textContent = `Còn ${AdminAuth.formatTime(remaining)}`;
            
            // Warning khi còn 5 phút
            if (remaining < 5 * 60 * 1000) {
                timerEl.classList.add('text-red-500');
            } else {
                timerEl.classList.remove('text-red-500');
            }
        };

        updateTimer();
        AdminAuth.timerInterval = setInterval(updateTimer, 1000);
    },

    // ==========================================
    // INIT GITHUB API
    // ==========================================
    initGitHubAPI(session) {
        GitHubAPI.setConfig({
            owner: session.owner,
            repo: session.repo,
            token: session.token
        });
    },

    // ==========================================
    // LOAD STATS
    // ==========================================
    async loadStats() {
        try {
            const [products, posts, resources] = await Promise.all([
                fetch('data/products.json').then(r => r.json()),
                fetch('data/posts-index.json').then(r => r.json()),
                fetch('data/resources.json').then(r => r.json())
            ]);

            document.getElementById('stat-products').textContent = products.products?.length || 0;
            document.getElementById('stat-posts').textContent = posts.posts?.length || 0;
            document.getElementById('stat-resources').textContent = resources.resources?.length || 0;
        } catch (e) {
            console.error('[Admin] Error loading stats:', e);
        }
    },

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        
        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Extend session on activity
        document.addEventListener('click', () => AdminAuth.extendSession());
        document.addEventListener('keypress', () => AdminAuth.extendSession());
    },

    // ==========================================
    // TAB SWITCHING
    // ==========================================
    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active', 'text-blue-600', 'border-b-2', 'border-blue-600');
            btn.classList.add('text-gray-500');
        });
        
        const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
        activeBtn.classList.add('active', 'text-blue-600', 'border-b-2', 'border-blue-600');
        activeBtn.classList.remove('text-gray-500');

        // Load tab content
        switch (tab) {
            case 'products':
                ProductsManager.init();
                break;
            case 'resources':
                ResourcesManager.init();
                break;
            case 'posts':
                PostsManager.init();
                break;
            case 'about':
                AboutManager.init();
                break;
            case 'donate':
                DonateManager.init();
                break;
            case 'config':
                ConfigManager.init();
                break;
        }
    }
};

// Init on load
document.addEventListener('DOMContentLoaded', () => AdminPanel.init());
