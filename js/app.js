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
    // APPLY CUSTOM COLORS
    // ==========================================
    applyColors(colors) {
        const root = document.documentElement;
        
        // Set CSS variables
        root.style.setProperty('--color-primary', colors.primary || '#2563eb');
        root.style.setProperty('--color-primary-hover', colors.primaryHover || '#1d4ed8');
        root.style.setProperty('--color-secondary', colors.secondary || '#64748b');
        root.style.setProperty('--color-background', colors.background || '#111827');
        root.style.setProperty('--color-background-light', colors.backgroundLight || '#ffffff');
        root.style.setProperty('--color-card', colors.card || '#1f2937');
        root.style.setProperty('--color-card-light', colors.cardLight || '#ffffff');
        root.style.setProperty('--color-text', colors.text || '#f3f4f6');
        root.style.setProperty('--color-text-light', colors.textLight || '#1f2937');
        root.style.setProperty('--color-accent', colors.accent || '#3b82f6');
        root.style.setProperty('--color-button', colors.button || '#2563eb');
        root.style.setProperty('--color-button-hover', colors.buttonHover || '#1d4ed8');
        root.style.setProperty('--color-footer', colors.footer || '#030712');

        // Inject dynamic styles
        let styleEl = document.getElementById('custom-colors');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'custom-colors';
            document.head.appendChild(styleEl);
        }
        
        styleEl.textContent = `
            /* Primary colors */
            .bg-blue-600, .bg-primary { background-color: ${colors.primary} !important; }
            .bg-blue-700, .hover\\:bg-blue-700:hover, .bg-primary-hover { background-color: ${colors.primaryHover} !important; }
            .text-blue-600, .text-primary { color: ${colors.primary} !important; }
            .text-blue-400, .dark\\:text-blue-400 { color: ${colors.accent} !important; }
            .border-blue-600, .border-primary { border-color: ${colors.primary} !important; }
            .ring-blue-500, .focus\\:ring-blue-500:focus { --tw-ring-color: ${colors.primary} !important; }
            
            /* Background */
            .dark .dark\\:bg-gray-900, body.dark { background-color: ${colors.background} !important; }
            .dark .dark\\:bg-gray-800 { background-color: ${colors.card} !important; }
            .dark .dark\\:bg-gray-700 { background-color: ${colors.card} !important; }
            
            /* Footer */
            footer, .footer-bg { background-color: ${colors.footer} !important; }
            
            /* Text */
            .dark .dark\\:text-white { color: ${colors.text} !important; }
            .dark .dark\\:text-gray-300, .dark .dark\\:text-gray-400 { color: ${colors.text}cc !important; }
            
            /* Buttons */
            .btn-primary, button.bg-blue-600 { 
                background-color: ${colors.button} !important; 
            }
            .btn-primary:hover, button.bg-blue-600:hover { 
                background-color: ${colors.buttonHover} !important; 
            }
        `;
    },

    // ==========================================
    // LOAD FOOTER CONFIG
    // ==========================================
    async loadFooterConfig() {
        try {
            const res = await fetch('data/config.json');
            const config = await res.json();
            
            // Apply custom colors
            if (config.colors) {
                this.applyColors(config.colors);
            }
            
            // Update logo
            const logoText = document.getElementById('logo-text');
            const logoImage = document.getElementById('logo-image');
            if (logoText && logoImage && config.logo) {
                if (config.logo.type === 'image' && config.logo.image) {
                    logoText.classList.add('hidden');
                    logoImage.src = config.logo.image;
                    logoImage.classList.remove('hidden');
                } else {
                    logoText.textContent = config.logo.text || config.siteName || 'Logo';
                    logoText.classList.remove('hidden');
                    logoImage.classList.add('hidden');
                }
            }
            
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
                    zalo: '<svg class="w-6 h-6" fill="currentColor" viewBox="0,0,256,256"><g transform="scale(5.12,5.12)"><path d="M9,4c-2.74952,0 -5,2.25048 -5,5v32c0,2.74952 2.25048,5 5,5h32c2.74952,0 5,-2.25048 5,-5v-32c0,-2.74952 -2.25048,-5 -5,-5zM9,6h6.58008c-3.57109,3.71569 -5.58008,8.51808 -5.58008,13.5c0,5.16 2.11016,10.09984 5.91016,13.83984c0.12,0.21 0.21977,1.23969 -0.24023,2.42969c-0.29,0.75 -0.87023,1.72961 -1.99023,2.09961c-0.43,0.14 -0.70969,0.56172 -0.67969,1.01172c0.03,0.45 0.36078,0.82992 0.80078,0.91992c2.87,0.57 4.72852,-0.2907 6.22852,-0.9707c1.35,-0.62 2.24133,-1.04047 3.61133,-0.48047c2.8,1.09 5.77938,1.65039 8.85938,1.65039c4.09369,0 8.03146,-0.99927 11.5,-2.88672v3.88672c0,1.66848 -1.33152,3 -3,3h-32c-1.66848,0 -3,-1.33152 -3,-3v-32c0,-1.66848 1.33152,-3 3,-3zM33,15c0.55,0 1,0.45 1,1v9c0,0.55 -0.45,1 -1,1c-0.55,0 -1,-0.45 -1,-1v-9c0,-0.55 0.45,-1 1,-1zM18,16h5c0.36,0 0.70086,0.19953 0.88086,0.51953c0.17,0.31 0.15875,0.69977 -0.03125,1.00977l-4.04883,6.4707h3.19922c0.55,0 1,0.45 1,1c0,0.55 -0.45,1 -1,1h-5c-0.36,0 -0.70086,-0.19953 -0.88086,-0.51953c-0.17,-0.31 -0.15875,-0.69977 0.03125,-1.00977l4.04883,-6.4707h-3.19922c-0.55,0 -1,-0.45 -1,-1c0,-0.55 0.45,-1 1,-1zM27.5,19c0.61,0 1.17945,0.16922 1.68945,0.44922c0.18,-0.26 0.46055,-0.44922 0.81055,-0.44922c0.55,0 1,0.45 1,1v5c0,0.55 -0.45,1 -1,1c-0.35,0 -0.63055,-0.18922 -0.81055,-0.44922c-0.51,0.28 -1.07945,0.44922 -1.68945,0.44922c-1.93,0 -3.5,-1.57 -3.5,-3.5c0,-1.93 1.57,-3.5 3.5,-3.5zM38.5,19c1.93,0 3.5,1.57 3.5,3.5c0,1.93 -1.57,3.5 -3.5,3.5c-1.93,0 -3.5,-1.57 -3.5,-3.5c0,-1.93 1.57,-3.5 3.5,-3.5zM27.5,21c-0.10375,0 -0.20498,0.01131 -0.30273,0.03125c-0.19551,0.03988 -0.37754,0.11691 -0.53711,0.22461c-0.15957,0.1077 -0.2966,0.24473 -0.4043,0.4043c-0.10769,0.15957 -0.18473,0.3416 -0.22461,0.53711c-0.01994,0.09775 -0.03125,0.19898 -0.03125,0.30273c0,0.10375 0.01131,0.20498 0.03125,0.30273c0.01994,0.09775 0.04805,0.19149 0.08594,0.28125c0.03789,0.08977 0.08482,0.17607 0.13867,0.25586c0.05385,0.07979 0.11578,0.15289 0.18359,0.2207c0.06781,0.06781 0.14092,0.12975 0.2207,0.18359c0.15957,0.10769 0.3416,0.18473 0.53711,0.22461c0.09775,0.01994 0.19898,0.03125 0.30273,0.03125c0.10375,0 0.20498,-0.01131 0.30273,-0.03125c0.68428,-0.13959 1.19727,-0.7425 1.19727,-1.46875c0,-0.83 -0.67,-1.5 -1.5,-1.5zM38.5,21c-0.10375,0 -0.20498,0.01131 -0.30273,0.03125c-0.09775,0.01994 -0.19149,0.04805 -0.28125,0.08594c-0.08977,0.03789 -0.17607,0.08482 -0.25586,0.13867c-0.07979,0.05385 -0.15289,0.11578 -0.2207,0.18359c-0.13562,0.13563 -0.24648,0.29703 -0.32227,0.47656c-0.03789,0.08976 -0.066,0.1835 -0.08594,0.28125c-0.01994,0.09775 -0.03125,0.19898 -0.03125,0.30273c0,0.10375 0.01131,0.20498 0.03125,0.30273c0.01994,0.09775 0.04805,0.19149 0.08594,0.28125c0.03789,0.08977 0.08482,0.17607 0.13867,0.25586c0.05385,0.07979 0.11578,0.15289 0.18359,0.2207c0.06781,0.06781 0.14092,0.12975 0.2207,0.18359c0.07979,0.05385 0.16609,0.10078 0.25586,0.13867c0.08976,0.03789 0.1835,0.066 0.28125,0.08594c0.09775,0.01994 0.19898,0.03125 0.30273,0.03125c0.10375,0 0.20498,-0.01131 0.30273,-0.03125c0.68428,-0.13959 1.19727,-0.7425 1.19727,-1.46875c0,-0.83 -0.67,-1.5 -1.5,-1.5z"></path></g></svg>',
                    twitter: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>',
                    telegram: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
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
