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
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.remove('active');
            
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
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
    // DONATE WIDGET
    // ==========================================
    async loadDonateWidget() {
        try {
            const res = await fetch('data/config.json');
            const config = await res.json();
            
            if (!config.donate || !config.donate.enabled) return;
            
            const donate = config.donate;
            
            // Create widget container
            const widget = document.createElement('div');
            widget.id = 'donate-widget';
            widget.innerHTML = `
                <!-- Chat-style Popup (above button) -->
                <div id="donate-popup" class="donate-chat-popup hidden">
                    <div class="donate-chat-header">
                        <span class="font-semibold">${donate.title || 'Ủng hộ tác giả'}</span>
                        <button id="donate-close" class="donate-chat-close">&times;</button>
                    </div>
                    <div class="donate-chat-body">
                        <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">${donate.message || ''}</p>
                        ${donate.qrCode 
                            ? `<img src="${donate.qrCode}" alt="QR Code" class="donate-qr-img">`
                            : '<div class="donate-qr-placeholder">📱</div>'
                        }
                        <p class="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">${donate.thankYou || 'Cảm ơn bạn!'}</p>
                    </div>
                </div>
                
                <!-- Floating Button -->
                <div class="donate-float-wrapper">
                    <button id="donate-btn" class="donate-float-btn" title="Ủng hộ tác giả">
                        ${donate.avatar 
                            ? `<img src="${donate.avatar}" alt="Donate" class="w-full h-full rounded-full object-cover">`
                            : '<span class="text-2xl">🎁</span>'
                        }
                        <span class="donate-ping"></span>
                    </button>
                    <span class="donate-label">${donate.buttonLabel || 'Donate'}</span>
                </div>
            `;
            
            document.body.appendChild(widget);
            
            // Event listeners
            const btn = document.getElementById('donate-btn');
            const popup = document.getElementById('donate-popup');
            const closeBtn = document.getElementById('donate-close');
            
            const openPopup = () => {
                popup.classList.remove('hidden', 'hide');
                popup.classList.add('show');
                btn.style.animation = 'none';
            };
            
            const closePopup = () => {
                popup.classList.remove('show');
                popup.classList.add('hide');
                btn.style.animation = '';
                // Wait for animation to finish before hiding
                setTimeout(() => {
                    popup.classList.add('hidden');
                    popup.classList.remove('hide');
                }, 250);
            };
            
            btn?.addEventListener('click', () => {
                if (popup.classList.contains('hidden')) {
                    openPopup();
                } else {
                    closePopup();
                }
            });
            
            closeBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                closePopup();
            });
            
            console.log('[App] Donate widget loaded');
        } catch (e) {
            console.error('[App] Error loading donate widget:', e);
        }
    },

    // ==========================================
    // FLOATING ICONS BACKGROUND
    // ==========================================
    initFloatingIcons() {
        // App icons SVG (simplified versions)
        const icons = [
            // Photoshop
            `<svg viewBox="0 0 24 24" fill="#31A8FF"><path d="M9.85 8.42c-.37-.15-.77-.21-1.18-.2-.26 0-.49 0-.68.01v3.36c.11.01.25.02.39.02.44 0 .88-.09 1.27-.31.36-.2.62-.55.73-.96.12-.41.11-.87-.02-1.27-.12-.3-.3-.52-.51-.65zm-3.87-2.6c.64-.04 1.28-.05 1.92-.03.53.02 1.06.08 1.58.18.49.1.96.28 1.39.54.41.25.77.59 1.04 1 .27.42.44.9.49 1.4.05.51-.01 1.03-.18 1.51-.18.49-.47.93-.85 1.29-.42.39-.91.68-1.44.87-.59.21-1.21.31-1.84.32-.28 0-.56-.01-.84-.03v3.77H5.98V5.82zm10.21 2.17c-.36-.11-.74-.17-1.12-.18-.24 0-.48.02-.71.07-.18.04-.35.12-.49.24-.11.1-.2.22-.25.36-.05.14-.08.29-.08.44 0 .15.03.3.1.43.08.14.18.26.31.36.15.12.32.22.49.3.22.1.44.2.67.28.39.14.77.3 1.13.5.33.18.63.4.89.67.24.26.43.56.55.9.13.36.19.75.18 1.13.01.51-.1 1.02-.33 1.47-.21.41-.52.76-.89 1.03-.38.27-.8.47-1.25.58-.48.12-.97.18-1.46.17-.49 0-.98-.05-1.46-.15-.43-.09-.84-.24-1.23-.43v-1.66c.4.25.83.44 1.28.56.43.12.87.19 1.32.19.22 0 .44-.02.65-.07.18-.04.35-.11.5-.21.13-.09.24-.2.32-.34.08-.14.11-.3.11-.46 0-.17-.04-.33-.13-.47-.1-.16-.23-.29-.38-.4-.19-.14-.39-.26-.61-.36-.26-.12-.52-.23-.78-.33-.38-.14-.74-.31-1.08-.52-.31-.19-.58-.42-.82-.7-.22-.27-.39-.57-.5-.9-.11-.35-.17-.72-.16-1.09-.01-.47.1-.94.31-1.36.21-.39.5-.72.85-.98.36-.27.77-.46 1.21-.57.46-.12.94-.17 1.42-.17.41 0 .82.04 1.22.11.35.06.69.16 1.01.29v1.61z"/></svg>`,
            // Illustrator
            `<svg viewBox="0 0 24 24" fill="#FF9A00"><path d="M10.53 10.73c-.1-.31-.19-.61-.29-.92-.1-.31-.19-.6-.27-.89h-.03c-.08.29-.17.58-.27.89-.1.31-.2.62-.3.92l-.79 2.47h2.73l-.78-2.47zm1.7 5.26l-.88-2.79H9.65l-.88 2.79H7.03l3.34-9.98h1.71l3.34 9.98h-1.79zm5.77 0h-1.57V8.01h1.57v7.98zm-.79-9.14c-.28 0-.52-.09-.71-.28-.19-.19-.29-.42-.29-.71 0-.28.1-.52.29-.71.19-.19.43-.28.71-.28.28 0 .52.09.71.28.19.19.29.43.29.71 0 .28-.1.52-.29.71-.19.19-.43.28-.71.28z"/></svg>`,
            // Premiere Pro
            `<svg viewBox="0 0 24 24" fill="#9999FF"><path d="M6.01 8.42c-.37-.15-.77-.21-1.18-.2-.26 0-.49 0-.68.01v3.36c.11.01.25.02.39.02.44 0 .88-.09 1.27-.31.36-.2.62-.55.73-.96.12-.41.11-.87-.02-1.27-.12-.3-.3-.52-.51-.65zM2.14 5.82c.64-.04 1.28-.05 1.92-.03.53.02 1.06.08 1.58.18.49.1.96.28 1.39.54.41.25.77.59 1.04 1 .27.42.44.9.49 1.4.05.51-.01 1.03-.18 1.51-.18.49-.47.93-.85 1.29-.42.39-.91.68-1.44.87-.59.21-1.21.31-1.84.32-.28 0-.56-.01-.84-.03v3.77H2.14V5.82zm10.07 2.35c-.09-.02-.19-.03-.29-.03-.26 0-.51.05-.74.16-.23.11-.43.27-.59.47-.17.21-.3.46-.38.72-.09.29-.13.59-.13.89v5.61h-1.57V7.01h1.57v1.15h.03c.08-.17.18-.33.31-.47.14-.15.29-.28.47-.39.18-.11.38-.2.59-.26.22-.06.44-.1.67-.1.15 0 .27.01.36.02.09.01.16.02.21.03v1.58c-.17-.05-.34-.08-.51-.1z"/></svg>`,
            // After Effects
            `<svg viewBox="0 0 24 24" fill="#9999FF"><path d="M8.54 10.73c-.1-.31-.19-.61-.29-.92-.1-.31-.19-.6-.27-.89h-.03c-.08.29-.17.58-.27.89-.1.31-.2.62-.3.92l-.79 2.47h2.73l-.78-2.47zm1.7 5.26l-.88-2.79H7.66l-.88 2.79H5.04l3.34-9.98h1.71l3.34 9.98h-1.79zm8.86-3.57c0-.31-.03-.62-.1-.92-.06-.28-.17-.54-.32-.77-.14-.22-.33-.4-.56-.52-.24-.13-.53-.19-.87-.19-.33 0-.62.07-.86.2-.24.13-.44.31-.6.53-.16.23-.28.49-.36.78-.08.3-.13.61-.14.93h3.81zm1.41 1.18h-5.22c0 .35.05.68.14.99.09.3.23.57.42.79.19.22.42.4.7.52.29.13.63.19 1.01.19.45 0 .87-.07 1.26-.22.39-.15.72-.33.99-.54v1.4c-.33.22-.69.39-1.09.5-.4.11-.86.17-1.38.17-.6 0-1.13-.1-1.58-.29-.45-.19-.83-.46-1.13-.8-.3-.34-.53-.75-.68-1.22-.15-.47-.23-.99-.23-1.55 0-.54.08-1.05.23-1.52.15-.47.37-.88.66-1.23.29-.35.65-.62 1.07-.82.42-.2.9-.3 1.44-.3.51 0 .96.09 1.34.27.38.18.7.43.96.74.26.31.45.68.58 1.1.13.42.19.88.19 1.36v.46z"/></svg>`,
            // Lightroom
            `<svg viewBox="0 0 24 24" fill="#31A8FF"><path d="M5.5 6h1.8v9.6h4.3v1.5H5.5V6zm9.3 4.5c-.09-.02-.19-.03-.29-.03-.26 0-.51.05-.74.16-.23.11-.43.27-.59.47-.17.21-.3.46-.38.72-.09.29-.13.59-.13.89v4.4h-1.57V9.1h1.57v1.15h.03c.08-.17.18-.33.31-.47.14-.15.29-.28.47-.39.18-.11.38-.2.59-.26.22-.06.44-.1.67-.1.15 0 .27.01.36.02.09.01.16.02.21.03v1.58c-.17-.05-.34-.08-.51-.1z"/></svg>`,
            // ChatGPT
            `<svg viewBox="0 0 24 24" fill="#10A37F"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg>`,
            // YouTube
            `<svg viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
            // Gemini
            `<svg viewBox="0 0 24 24" fill="#8E75B2"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3.6c4.636 0 8.4 3.764 8.4 8.4 0 4.636-3.764 8.4-8.4 8.4-4.636 0-8.4-3.764-8.4-8.4 0-4.636 3.764-8.4 8.4-8.4zm0 2.4a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"/></svg>`,
            // Grok (X/Twitter style)
            `<svg viewBox="0 0 24 24" fill="#1DA1F2"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
        ];

        // Create container
        const container = document.createElement('div');
        container.id = 'floating-icons-bg';
        container.className = 'floating-icons-container';
        document.body.prepend(container);

        // Create floating icons
        const iconCount = 15;
        for (let i = 0; i < iconCount; i++) {
            const icon = document.createElement('div');
            icon.className = 'floating-icon';
            icon.innerHTML = icons[i % icons.length];
            
            // Random position
            icon.style.left = Math.random() * 100 + '%';
            icon.style.top = Math.random() * 100 + '%';
            
            // Random size
            const size = 30 + Math.random() * 40;
            icon.style.width = size + 'px';
            icon.style.height = size + 'px';
            
            // Random animation duration and delay
            const duration = 20 + Math.random() * 30;
            const delay = Math.random() * -30;
            icon.style.animationDuration = duration + 's';
            icon.style.animationDelay = delay + 's';
            
            // Random opacity
            icon.style.opacity = 0.1 + Math.random() * 0.15;
            
            container.appendChild(icon);
        }
    },

    // ==========================================
    // INIT
    // ==========================================
    async init() {
        // 1. Init dark mode ngay lập tức (tránh flash)
        this.initDarkMode();
        
        // 2. Init floating icons background
        this.initFloatingIcons();

        // 3. Load layout
        await this.loadLayout();

        // 4. Setup interactions sau khi DOM ready
        this.setupDarkModeToggle();
        this.setActiveNav();
        this.setupSearch();
        this.setupMobileMenu();
        
        // 5. Load donate widget
        await this.loadDonateWidget();

        console.log('[App] Initialized');
    }
};

// Run
document.addEventListener('DOMContentLoaded', () => App.init());
