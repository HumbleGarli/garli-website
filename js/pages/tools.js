// ==========================================
// TOOLS.JS - Trang Tiện ích
// ==========================================

const ToolsPage = {
    currentTab: '2fa',
    countdownInterval: null,
    banks: [],

    init() {
        this.setupTabs();
        this.loadBanks();
        this.setupClickOutside();
    },

    // ==========================================
    // BANK DROPDOWN WITH LOGO
    // ==========================================
    async loadBanks() {
        // Bank list with VietQR codes
        this.banks = [
            { bin: '970422', code: 'MB', name: 'MB Bank' },
            { bin: '970415', code: 'ICB', name: 'VietinBank' },
            { bin: '970436', code: 'VCB', name: 'Vietcombank' },
            { bin: '970418', code: 'BIDV', name: 'BIDV' },
            { bin: '970405', code: 'VBA', name: 'Agribank' },
            { bin: '970407', code: 'TCB', name: 'Techcombank' },
            { bin: '970416', code: 'ACB', name: 'ACB' },
            { bin: '970432', code: 'VPB', name: 'VPBank' },
            { bin: '970423', code: 'TPB', name: 'TPBank' },
            { bin: '970403', code: 'STB', name: 'Sacombank' },
            { bin: '970448', code: 'OCB', name: 'OCB' },
            { bin: '970437', code: 'HDB', name: 'HDBank' },
            { bin: '970441', code: 'VIB', name: 'VIB' },
            { bin: '970443', code: 'SHB', name: 'SHB' },
            { bin: '970431', code: 'EIB', name: 'Eximbank' },
            { bin: '970426', code: 'MSB', name: 'MSB' },
            { bin: '970454', code: 'VCCB', name: 'VietCapital Bank' },
            { bin: '970429', code: 'SCB', name: 'SCB' },
            { bin: '970414', code: 'OJB', name: 'OceanBank' },
            { bin: '970438', code: 'BVB', name: 'BaoViet Bank' },
            { bin: '970446', code: 'COOPBANK', name: 'COOP Bank' },
            { bin: '970452', code: 'KLB', name: 'KienLong Bank' },
            { bin: '970430', code: 'PGB', name: 'PGBank' },
            { bin: '970400', code: 'SGICB', name: 'SaigonBank' },
            { bin: '970425', code: 'ABB', name: 'ABBank' },
            { bin: '970427', code: 'VAB', name: 'VietABank' },
            { bin: '970433', code: 'VIETBANK', name: 'VietBank' },
            { bin: '970439', code: 'NCB', name: 'NCB' },
            { bin: '970440', code: 'SEAB', name: 'SeABank' },
            { bin: '970458', code: 'UOB', name: 'UOB' },
            { bin: '970449', code: 'LPB', name: 'LPBank' },
            { bin: '422589', code: 'CAKE', name: 'CAKE by VPBank' },
            { bin: '546034', code: 'UBANK', name: 'Ubank by VPBank' },
            { bin: '963388', code: 'VIETTELMONEY', name: 'Viettel Money' },
            { bin: '971005', code: 'VNPTMONEY', name: 'VNPT Money' },
            { bin: '970457', code: 'WVN', name: 'Woori Bank' },
            { bin: '970462', code: 'KBHN', name: 'KB Bank' },
            { bin: '970466', code: 'KEBHANAHCM', name: 'KEB Hana Bank' },
            { bin: '970463', code: 'SHBVN', name: 'Shinhan Bank' },
            { bin: '970424', code: 'SHBVN', name: 'Shinhan Bank' }
        ];

        this.renderBankList();
    },

    renderBankList() {
        const list = document.getElementById('bank-list');
        if (!list) return;

        list.innerHTML = this.banks.map(bank => `
            <div class="bank-option flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                 onclick="ToolsPage.selectBank('${bank.bin}', '${bank.code}', '${bank.name}')">
                <img src="https://api.vietqr.io/img/${bank.code}.png" alt="${bank.name}" class="w-8 h-8 object-contain">
                <span class="text-gray-800 dark:text-white">${bank.name}</span>
            </div>
        `).join('');
    },

    toggleBankDropdown() {
        const list = document.getElementById('bank-list');
        list.classList.toggle('hidden');
    },

    selectBank(bin, code, name) {
        document.getElementById('qr-bank').value = bin;
        document.getElementById('selected-bank-logo').src = `https://api.vietqr.io/img/${code}.png`;
        document.getElementById('selected-bank-name').textContent = name;
        document.getElementById('bank-list').classList.add('hidden');
    },

    setupClickOutside() {
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('bank-dropdown');
            if (dropdown && !dropdown.contains(e.target)) {
                document.getElementById('bank-list')?.classList.add('hidden');
            }
        });
    },

    // ==========================================
    // TAB NAVIGATION
    // ==========================================
    setupTabs() {
        const tabs = document.querySelectorAll('.tools-tab');
        const indicator = document.getElementById('tools-tab-indicator');

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                // Update active state
                tabs.forEach(t => {
                    t.classList.remove('active', 'text-white');
                    t.classList.add('text-gray-600', 'dark:text-gray-300');
                });
                tab.classList.add('active', 'text-white');
                tab.classList.remove('text-gray-600', 'dark:text-gray-300');

                // Move indicator
                const tabWidth = 100 / tabs.length;
                indicator.style.width = `calc(${tabWidth}% - 8px)`;
                indicator.style.left = `calc(${index * tabWidth}% + 4px)`;

                // Show panel
                const tabName = tab.dataset.tab;
                this.currentTab = tabName;
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
                document.getElementById(`tab-${tabName}`).classList.remove('hidden');
            });
        });
    },

    // ==========================================
    // 2FA GENERATOR
    // ==========================================
    generate2FA() {
        const input = document.getElementById('input-2fa-keys').value.trim();
        if (!input) {
            alert('Vui lòng nhập KEY 2FA');
            return;
        }

        const lines = input.split('\n').filter(l => l.trim());
        const results = [];

        lines.forEach(line => {
            try {
                // Extract 2FA key from various formats
                let key = line.trim();
                
                // Format: ID | Pass | 2FA
                if (line.includes('|')) {
                    const parts = line.split('|');
                    key = parts[parts.length - 1].trim();
                }

                // Remove spaces and convert to uppercase
                key = key.replace(/\s+/g, '').toUpperCase();
                
                // Remove invalid Base32 characters (keep only A-Z and 2-7)
                key = key.replace(/[^A-Z2-7]/g, '');
                
                // Pad key if needed (Base32 requires length divisible by 8)
                while (key.length % 8 !== 0) {
                    key += '=';
                }

                if (key.length < 16) {
                    throw new Error('Key too short');
                }

                // Generate TOTP
                const totp = new OTPAuth.TOTP({
                    secret: OTPAuth.Secret.fromBase32(key),
                    digits: 6,
                    period: 30
                });

                const code = totp.generate();
                results.push({ key: key.substring(0, 8) + '...', code, success: true });
            } catch (e) {
                results.push({ key: line.substring(0, 20) + '...', code: 'Lỗi', success: false, error: e.message });
            }
        });

        this.display2FAResults(results);
        this.startCountdown();
    },

    // Store current keys for auto-refresh
    currentKeys: '',

    display2FAResults(results) {
        const container = document.getElementById('2fa-results');
        const codesEl = document.getElementById('2fa-codes');

        container.classList.remove('hidden');
        codesEl.innerHTML = results.map((r, i) => `
            <div class="flex items-center justify-between p-3 rounded-lg ${r.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}">
                <div class="flex items-center gap-3">
                    <span class="text-sm text-gray-500 dark:text-gray-400">#${i + 1}</span>
                    <span class="text-sm text-gray-600 dark:text-gray-400 font-mono">${r.key}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xl font-bold font-mono ${r.success ? 'text-green-600 dark:text-green-400' : 'text-red-500'}">${r.code}</span>
                    ${r.success ? `<button onclick="ToolsPage.copyCode('${r.code}')" class="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded">📋</button>` : ''}
                </div>
            </div>
        `).join('');

        this.lastResults = results;
    },

    startCountdown() {
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        
        // Store current input for auto-refresh
        this.currentKeys = document.getElementById('input-2fa-keys').value.trim();

        const countdownEl = document.getElementById('2fa-countdown');
        
        const update = () => {
            const now = Math.floor(Date.now() / 1000);
            const remaining = 30 - (now % 30);
            countdownEl.textContent = `Còn ${remaining}s`;
            
            // Change color when time is running low
            if (remaining <= 5) {
                countdownEl.classList.add('text-red-500');
                countdownEl.classList.remove('text-gray-500', 'dark:text-gray-400');
            } else {
                countdownEl.classList.remove('text-red-500');
                countdownEl.classList.add('text-gray-500', 'dark:text-gray-400');
            }

            // Auto refresh when new period starts
            if (remaining === 30 && this.currentKeys) {
                this.generate2FA();
            }
        };

        update();
        this.countdownInterval = setInterval(update, 1000);
    },

    copyCode(code) {
        navigator.clipboard.writeText(code);
        alert('Đã copy: ' + code);
    },

    copy2FAResults() {
        if (!this.lastResults) return;
        const text = this.lastResults.filter(r => r.success).map(r => r.code).join('\n');
        navigator.clipboard.writeText(text);
        alert('Đã copy tất cả code!');
    },

    // ==========================================
    // VIETQR GENERATOR
    // ==========================================
    generateQR() {
        const bank = document.getElementById('qr-bank').value;
        const account = document.getElementById('qr-account').value.trim();
        const name = document.getElementById('qr-name').value.trim();
        const amount = document.getElementById('qr-amount').value.trim();
        const content = document.getElementById('qr-content').value.trim();

        if (!account) {
            alert('Vui lòng nhập số tài khoản');
            return;
        }

        // Build VietQR URL
        let url = `https://img.vietqr.io/image/${bank}-${account}-compact.png`;
        
        const params = [];
        if (amount) params.push(`amount=${amount}`);
        if (content) params.push(`addInfo=${encodeURIComponent(content)}`);
        if (name) params.push(`accountName=${encodeURIComponent(name)}`);
        
        if (params.length) {
            url += '?' + params.join('&');
        }

        // Display QR
        const preview = document.getElementById('qr-preview');
        preview.innerHTML = `<img src="${url}" alt="VietQR" class="w-full h-full object-contain rounded-xl" id="qr-image">`;
        
        document.getElementById('qr-download-btn').classList.remove('hidden');
        this.currentQRUrl = url;
    },

    downloadQR() {
        if (!this.currentQRUrl) return;
        
        const link = document.createElement('a');
        link.href = this.currentQRUrl;
        link.download = 'vietqr.png';
        link.click();
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => ToolsPage.init());
