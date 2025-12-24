// ==========================================
// APP.JS - Auto Load Layout
// ==========================================

const App = {
    // Config
    config: {
        headerPath: 'components/header.html',
        footerPath: 'components/footer.html'
    },

    // ==========================================
    // 1. COMPONENT LOADER
    // ==========================================
    async loadComponent(id, file) {
        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const html = await response.text();
            const el = document.getElementById(id);
            if (el) el.innerHTML = html;
            return true;
        } catch (error) {
            console.error(`[App] Error loading ${file}:`, error);
            return false;
        }
    },

    async loadLayout() {
        await Promise.all([
            this.loadComponent('header-placeholder', this.config.headerPath),
            this.loadComponent('footer-placeholder', this.config.footerPath)
        ]);
    },

    // ==========================================
    // 2. DARK MODE
    // ==========================================
    initDarkMode() {
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (saved === 'dark' || (!saved && prefersDark)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },

    setupDarkModeToggle() {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    },

    // ==========================================
    // 3. NAV ACTIVE STATE
    // ==========================================
    setActiveNav() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('nav a[href]');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.remove('text-blue-600', 'font-semibold', 'dark:text-blue-400');
            
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('text-blue-600', 'font-semibold', 'dark:text-blue-400');
            }
        });
    },

    // ==========================================
    // 4. TOGGLE SEARCH
    // ==========================================
    setupSearch() {
        const searchInput = document.getElementById('search-input');
        const searchToggle = document.getElementById('search-toggle');
        const searchContainer = document.getElementById('search-container');
        
        // Toggle search on mobile
        if (searchToggle && searchContainer) {
            searchToggle.addEventListener('click', () => {
                searchContainer.classList.toggle('hidden');
                if (!searchContainer.classList.contains('hidden')) {
                    searchInput?.focus();
                }
            });
        }

        // Search on Enter
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.trim();
                    if (query) {
                        this.handleSearch(query);
                    }
                }
            });
        }

        // Close search on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchContainer) {
                searchContainer.classList.add('hidden');
            }
        });
    },

    handleSearch(query) {
        console.log('[App] Search:', query);
        // TODO: Implement search logic
    },

    // ==========================================
    // 5. MOBILE MENU
    // ==========================================
    setupMobileMenu() {
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');
        if (!btn || !menu) return;

        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!btn.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.add('hidden');
            }
        });
    },

    // ==========================================
    // INIT
    // ==========================================
    async init() {
        // 1. Init dark mode ngay lập tức (tránh flash)
        this.initDarkMode();

        // 2. Load layout
        await this.loadLayout();

        // 3. Setup interactions sau khi DOM ready
        this.setupDarkModeToggle();
        this.setActiveNav();
        this.setupSearch();
        this.setupMobileMenu();

        console.log('[App] Initialized');
    }
};

// Run
document.addEventListener('DOMContentLoaded', () => App.init());
