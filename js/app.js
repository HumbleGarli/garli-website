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
        
        // Load config vào footer sau khi footer đã load
        await this.loadFooterConfig();
    },

    // ==========================================
    // LOAD FOOTER CONFIG
    // ==========================================
    async loadFooterConfig() {
        try {
            const res = await fetch('data/config.json');
            const config = await res.json();
            
            // Update contact info
            const emailEl = document.getElementById('footer-email');
            const phoneEl = document.getElementById('footer-phone');
            const addressEl = document.getElementById('footer-address');
            const sitenameEl = document.getElementById('footer-sitename');
            
            if (emailEl) emailEl.textContent = config.email || 'N/A';
            if (phoneEl) phoneEl.textContent = config.phone || 'N/A';
            if (addressEl) addressEl.textContent = config.address || 'N/A';
            if (sitenameEl) sitenameEl.textContent = config.siteName || 'Website';
            
            // Update social links
            const socialContainer = document.getElementById('footer-social');
            if (socialContainer && config.socialLinks) {
                const socialIcons = {
                    facebook: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
                    zalo: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><text x="2" y="18" font-size="14" font-weight="bold">Z</text></svg>',
                    twitter: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>',
                    github: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>',
                    youtube: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>',
                    discord: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>'
                };
                
                let socialHTML = '';
                for (const [key, url] of Object.entries(config.socialLinks)) {
                    if (url && socialIcons[key]) {
                        socialHTML += `
                            <a href="${url}" target="_blank" rel="noopener noreferrer" 
                               class="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors" 
                               title="${key.charAt(0).toUpperCase() + key.slice(1)}">
                                ${socialIcons[key]}
                            </a>
                        `;
                    }
                }
                socialContainer.innerHTML = socialHTML;
            }
        } catch (e) {
            console.error('[App] Error loading footer config:', e);
        }
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
