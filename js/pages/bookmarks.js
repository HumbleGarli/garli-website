// ==========================================
// BOOKMARKS.JS - Trang Tiện ích
// ==========================================

const BookmarksPage = {
    data: { groups: [], bookmarks: [], layout: {} },

    async init() {
        await this.loadData();
        this.render();
    },

    async loadData() {
        try {
            const res = await fetch('data/bookmarks.json');
            this.data = await res.json();
        } catch (e) {
            console.error('[Bookmarks] Error loading data:', e);
        }
    },

    render() {
        const container = document.getElementById('bookmarks-grid');
        if (!container) return;

        const { groups, bookmarks, layout } = this.data;
        const { iconSize = 64, gap = 24, columns = 8, showGroupTitle = true, containerWidth = 'full' } = layout;

        // Set container width
        const mainContainer = document.getElementById('bookmarks-container');
        if (containerWidth === 'full') {
            mainContainer.classList.remove('max-w-4xl', 'max-w-5xl', 'max-w-6xl');
        } else {
            mainContainer.classList.add(`max-w-${containerWidth}`);
        }

        // Sort groups by order
        const sortedGroups = [...groups].sort((a, b) => a.order - b.order);

        container.innerHTML = sortedGroups.map(group => {
            const groupBookmarks = bookmarks
                .filter(b => b.group === group.id)
                .sort((a, b) => a.order - b.order);

            if (groupBookmarks.length === 0) return '';

            return `
                <div class="bookmark-group glass-card p-6 rounded-2xl">
                    ${showGroupTitle ? `
                        <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-[#0d544c]"></span>
                            ${group.name}
                        </h2>
                    ` : ''}
                    <div class="bookmark-items" style="
                        display: grid;
                        grid-template-columns: repeat(${columns}, minmax(0, 1fr));
                        gap: ${gap}px;
                    ">
                        ${groupBookmarks.map(b => this.renderBookmark(b, iconSize)).join('')}
                    </div>
                </div>
            `;
        }).join('');
    },

    renderBookmark(bookmark, iconSize) {
        const { id, title, url, icon } = bookmark;
        
        // Fallback icon nếu không có
        const iconUrl = icon || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`;
        
        return `
            <a href="${url}" target="_blank" rel="noopener noreferrer" 
               class="bookmark-item flex flex-col items-center text-center group transition-transform hover:scale-105"
               title="${title}">
                <div class="bookmark-icon rounded-2xl overflow-hidden shadow-lg mb-2 bg-white dark:bg-gray-700 p-2 transition-shadow group-hover:shadow-xl"
                     style="width: ${iconSize}px; height: ${iconSize}px;">
                    <img src="${iconUrl}" alt="${title}" 
                         class="w-full h-full object-contain"
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%230d544c%22><path d=%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z%22/></svg>'">
                </div>
                <span class="bookmark-title text-xs text-gray-700 dark:text-gray-300 truncate w-full max-w-[80px] group-hover:text-[#0d544c] dark:group-hover:text-emerald-400">
                    ${title}
                </span>
            </a>
        `;
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => BookmarksPage.init());
