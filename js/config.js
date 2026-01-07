// ==========================================
// CONFIG.JS - Site Configuration
// Xử lý base path cho cả local và production
// ==========================================

const SiteConfig = {
    // Auto detect base path
    // Local: '' (root)
    // GitHub Pages project site: '/repo-name'
    basePath: (() => {
        const path = window.location.pathname;
        // Nếu đang ở GitHub Pages project site
        if (path.includes('/garli-website/')) {
            return '/garli-website';
        }
        // Nếu có subfolder khác
        const match = path.match(/^\/([^/]+)\//);
        if (match && !path.endsWith('.html')) {
            return '/' + match[1];
        }
        return '';
    })(),

    // Get full path for assets/links
    getPath(relativePath) {
        if (relativePath.startsWith('http')) return relativePath;
        const clean = relativePath.startsWith('/') ? relativePath : '/' + relativePath;
        return this.basePath + clean;
    },

    // Get path relative to current location (for fetch)
    getRelativePath(path) {
        // Fetch dùng relative path, không cần basePath
        return path.startsWith('/') ? path.slice(1) : path;
    },

    // Get URL with cache busting param
    getNoCacheUrl(url) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}t=${Date.now()}`;
    },

    // Check if running locally
    isLocal() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.protocol === 'file:';
    },

    // Log environment info
    logEnv() {
        console.log('[SiteConfig]', {
            basePath: this.basePath,
            isLocal: this.isLocal(),
            href: window.location.href
        });
    }
};

window.SiteConfig = SiteConfig;
