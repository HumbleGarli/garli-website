// ==========================================
// TOOLS.JS - Trang Tiện ích
// ==========================================

const ToolsPage = {
    currentTab: '2fa',
    countdownInterval: null,
    banks: [],
    bankInitialized: false,

    init() {
        this.setupTabs();
        this.loadBanks();
        this.setupClickOutside();
    },

    // ==========================================
    // BANK DROPDOWN WITH LOGO
    // ==========================================
    async loadBanks() {
        // Fetch banks from VietQR API
        try {
            const res = await fetch('https://api.vietqr.io/v2/banks');
            const data = await res.json();
            if (data.code === '00' && data.data) {
                this.banks = data.data.map(bank => ({
                    bin: bank.bin,
                    code: bank.code,
                    name: bank.shortName || bank.name,
                    logo: bank.logo // Use logo URL from API
                }));
            } else {
                this.loadFallbackBanks();
            }
        } catch (e) {
            console.error('Failed to load banks from API:', e);
            this.loadFallbackBanks();
        }

        this.renderBankList();
    },

    loadFallbackBanks() {
        // Fallback bank list if API fails
        this.banks = [
            { bin: '970422', code: 'MB', name: 'MB Bank', logo: 'https://api.vietqr.io/img/MB.png' },
            { bin: '970415', code: 'ICB', name: 'VietinBank', logo: 'https://api.vietqr.io/img/ICB.png' },
            { bin: '970436', code: 'VCB', name: 'Vietcombank', logo: 'https://api.vietqr.io/img/VCB.png' },
            { bin: '970418', code: 'BIDV', name: 'BIDV', logo: 'https://api.vietqr.io/img/BIDV.png' },
            { bin: '970405', code: 'VBA', name: 'Agribank', logo: 'https://api.vietqr.io/img/VBA.png' },
            { bin: '970407', code: 'TCB', name: 'Techcombank', logo: 'https://api.vietqr.io/img/TCB.png' },
            { bin: '970416', code: 'ACB', name: 'ACB', logo: 'https://api.vietqr.io/img/ACB.png' },
            { bin: '970432', code: 'VPB', name: 'VPBank', logo: 'https://api.vietqr.io/img/VPB.png' },
            { bin: '970423', code: 'TPB', name: 'TPBank', logo: 'https://api.vietqr.io/img/TPB.png' },
            { bin: '970403', code: 'STB', name: 'Sacombank', logo: 'https://api.vietqr.io/img/STB.png' }
        ];
    },

    renderBankList(filter = '') {
        const list = document.getElementById('bank-items');
        if (!list) return;

        let filteredBanks = this.banks;
        if (filter) {
            const q = filter.toLowerCase();
            filteredBanks = this.banks.filter(bank => 
                bank.name.toLowerCase().includes(q) || 
                bank.code.toLowerCase().includes(q)
            );
        }

        if (filteredBanks.length === 0) {
            list.innerHTML = '<p class="text-center text-gray-500 py-4">Không tìm thấy ngân hàng</p>';
            return;
        }

        list.innerHTML = filteredBanks.map(bank => `
            <div class="bank-option flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                 onclick="ToolsPage.selectBank('${bank.bin}', '${bank.logo}', '${bank.name.replace(/'/g, "\\'")}')">
                <img src="${bank.logo}" alt="${bank.name}" class="w-10 h-10 object-contain rounded">
                <span class="text-gray-800 dark:text-white">${bank.name}</span>
            </div>
        `).join('');

        // Update selected bank display if banks loaded (only on first render)
        if (!filter && this.banks.length > 0 && !this.bankInitialized) {
            const firstBank = this.banks[0];
            document.getElementById('qr-bank').value = firstBank.bin;
            document.getElementById('selected-bank-logo').src = firstBank.logo;
            document.getElementById('selected-bank-name').textContent = firstBank.name;
            this.bankInitialized = true;
        }
    },

    filterBanks(query) {
        this.renderBankList(query);
    },

    toggleBankDropdown() {
        const list = document.getElementById('bank-list');
        const isHidden = list.classList.contains('hidden');
        list.classList.toggle('hidden');
        
        // Focus search input when opening
        if (isHidden) {
            setTimeout(() => {
                const searchInput = document.getElementById('bank-search');
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.focus();
                    this.renderBankList(); // Reset filter
                }
            }, 100);
        }
    },

    selectBank(bin, logo, name) {
        document.getElementById('qr-bank').value = bin;
        document.getElementById('selected-bank-logo').src = logo;
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
        
        // Update download link
        const downloadBtn = document.getElementById('qr-download-btn');
        downloadBtn.href = url;
        downloadBtn.classList.remove('hidden');
        this.currentQRUrl = url;
    },

    downloadQR() {
        // Not used anymore - using <a> tag with target="_blank"
    }
};

// ==========================================
// QR GENERATOR
// ==========================================
const QRGenerator = {
    currentType: 'url',
    qrInstance: null,
    logoData: null,

    setType(type) {
        this.currentType = type;
        
        // Update button states
        document.querySelectorAll('.qr-type-btn').forEach(btn => {
            if (btn.dataset.qrtype === type) {
                btn.classList.add('border-[#0d544c]', 'bg-[#0d544c]', 'text-white');
                btn.classList.remove('border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
            } else {
                btn.classList.remove('border-[#0d544c]', 'bg-[#0d544c]', 'text-white');
                btn.classList.add('border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
            }
        });

        // Show/hide input fields
        document.querySelectorAll('.qrgen-field').forEach(field => field.classList.add('hidden'));
        document.getElementById(`qrgen-${type}`)?.classList.remove('hidden');
        
        this.generate();
    },

    getData() {
        switch (this.currentType) {
            case 'url':
                return document.getElementById('qrgen-url-input')?.value || '';
            case 'text':
                return document.getElementById('qrgen-text-input')?.value || '';
            case 'email': {
                const email = document.getElementById('qrgen-email-input')?.value || '';
                const subject = document.getElementById('qrgen-email-subject')?.value || '';
                const body = document.getElementById('qrgen-email-body')?.value || '';
                if (!email) return '';
                let mailto = `mailto:${email}`;
                const params = [];
                if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
                if (body) params.push(`body=${encodeURIComponent(body)}`);
                if (params.length) mailto += '?' + params.join('&');
                return mailto;
            }
            case 'phone':
                const phone = document.getElementById('qrgen-phone-input')?.value || '';
                return phone ? `tel:${phone}` : '';
            case 'sms': {
                const smsPhone = document.getElementById('qrgen-sms-phone')?.value || '';
                const message = document.getElementById('qrgen-sms-message')?.value || '';
                if (!smsPhone) return '';
                return message ? `sms:${smsPhone}?body=${encodeURIComponent(message)}` : `sms:${smsPhone}`;
            }
            case 'wifi': {
                const ssid = document.getElementById('qrgen-wifi-ssid')?.value || '';
                const password = document.getElementById('qrgen-wifi-password')?.value || '';
                const security = document.getElementById('qrgen-wifi-security')?.value || 'WPA';
                if (!ssid) return '';
                return `WIFI:T:${security};S:${ssid};P:${password};;`;
            }
            case 'vcard': {
                const lastName = document.getElementById('qrgen-vcard-lastname')?.value || '';
                const firstName = document.getElementById('qrgen-vcard-firstname')?.value || '';
                const vcardPhone = document.getElementById('qrgen-vcard-phone')?.value || '';
                const vcardEmail = document.getElementById('qrgen-vcard-email')?.value || '';
                const company = document.getElementById('qrgen-vcard-company')?.value || '';
                if (!lastName && !firstName) return '';
                return `BEGIN:VCARD\nVERSION:3.0\nN:${lastName};${firstName}\nFN:${firstName} ${lastName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nORG:${company}\nEND:VCARD`;
            }
            case 'location': {
                const lat = document.getElementById('qrgen-location-lat')?.value || '';
                const lng = document.getElementById('qrgen-location-lng')?.value || '';
                if (!lat || !lng) return '';
                return `geo:${lat},${lng}`;
            }
            case 'event': {
                const title = document.getElementById('qrgen-event-title')?.value || '';
                const start = document.getElementById('qrgen-event-start')?.value || '';
                const end = document.getElementById('qrgen-event-end')?.value || '';
                const location = document.getElementById('qrgen-event-location')?.value || '';
                if (!title || !start) return '';
                const formatDate = (d) => d.replace(/[-:]/g, '').replace('T', 'T') + '00';
                return `BEGIN:VEVENT\nSUMMARY:${title}\nDTSTART:${formatDate(start)}\nDTEND:${formatDate(end || start)}\nLOCATION:${location}\nEND:VEVENT`;
            }
            default:
                return '';
        }
    },

    generate() {
        const data = this.getData();
        const preview = document.getElementById('qrgen-preview');
        
        if (!data) {
            preview.innerHTML = '<div class="w-[300px] h-[300px] flex items-center justify-center text-gray-400">Nhập dữ liệu để tạo QR</div>';
            return;
        }

        const size = parseInt(document.getElementById('qrgen-size')?.value || 300);
        const margin = parseInt(document.getElementById('qrgen-margin')?.value || 4);
        const color = document.getElementById('qrgen-color')?.value || '#000000';
        const bgColor = document.getElementById('qrgen-bgcolor')?.value || '#FFFFFF';
        const correction = document.getElementById('qrgen-correction')?.value || 'M';

        // Clear previous QR
        preview.innerHTML = '';
        
        // Create container with margin and relative positioning for logo overlay
        const container = document.createElement('div');
        container.id = 'qrgen-container';
        container.style.padding = `${margin * 4}px`;
        container.style.backgroundColor = bgColor;
        container.style.display = 'inline-block';
        container.style.borderRadius = '8px';
        container.style.position = 'relative';
        preview.appendChild(container);
        
        // Create new QR
        this.qrInstance = new QRCode(container, {
            text: data,
            width: size,
            height: size,
            colorDark: color,
            colorLight: bgColor,
            correctLevel: QRCode.CorrectLevel[correction]
        });

        // Add logo if exists
        if (this.logoData) {
            setTimeout(() => this.addLogoOverlay(size), 200);
        }
    },

    addLogoOverlay(qrSize) {
        const container = document.getElementById('qrgen-container');
        if (!container || !this.logoData) return;

        // Remove existing logo overlay
        const existingOverlay = container.querySelector('.logo-overlay');
        if (existingOverlay) existingOverlay.remove();

        // Create logo overlay div
        const logoOverlay = document.createElement('div');
        logoOverlay.className = 'logo-overlay';
        logoOverlay.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 8px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;

        const logoImg = document.createElement('img');
        logoImg.src = this.logoData;
        logoImg.style.cssText = `
            width: ${qrSize * 0.2}px;
            height: ${qrSize * 0.2}px;
            object-fit: contain;
            display: block;
        `;

        logoOverlay.appendChild(logoImg);
        container.appendChild(logoOverlay);
    },

    addLogoToQR(canvas) {
        // Legacy function - not used anymore
    },

    handleLogo(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.logoData = e.target.result;
            document.getElementById('qrgen-remove-logo')?.classList.remove('hidden');
            this.generate();
        };
        reader.readAsDataURL(file);
    },

    removeLogo() {
        this.logoData = null;
        document.getElementById('qrgen-logo').value = '';
        document.getElementById('qrgen-remove-logo')?.classList.add('hidden');
        this.generate();
    },

    updateSize(input) {
        document.getElementById('qrgen-size-label').textContent = input.value;
        this.generate();
    },

    updateMargin(input) {
        document.getElementById('qrgen-margin-label').textContent = input.value;
        this.generate();
    },

    syncColor(input) {
        document.getElementById('qrgen-color').value = input.value;
        this.generate();
    },

    syncBgColor(input) {
        document.getElementById('qrgen-bgcolor').value = input.value;
        this.generate();
    },

    reset() {
        document.getElementById('qrgen-color').value = '#000000';
        document.getElementById('qrgen-color-text').value = '#000000';
        document.getElementById('qrgen-bgcolor').value = '#FFFFFF';
        document.getElementById('qrgen-bgcolor-text').value = '#FFFFFF';
        document.getElementById('qrgen-size').value = 300;
        document.getElementById('qrgen-size-label').textContent = '300';
        document.getElementById('qrgen-margin').value = 4;
        document.getElementById('qrgen-margin-label').textContent = '4';
        document.getElementById('qrgen-correction').value = 'M';
        this.removeLogo();
        this.generate();
    },

    download(format) {
        const container = document.getElementById('qrgen-container');
        if (!container) {
            alert('Vui lòng tạo mã QR trước');
            return;
        }

        const qrCanvas = container.querySelector('canvas');
        const qrImg = container.querySelector('img:not(.logo-overlay img)');
        
        if (!qrCanvas && !qrImg) {
            alert('Không tìm thấy mã QR');
            return;
        }

        // Create a new canvas to combine QR + logo
        const finalCanvas = document.createElement('canvas');
        const margin = parseInt(document.getElementById('qrgen-margin')?.value || 4) * 4;
        const size = parseInt(document.getElementById('qrgen-size')?.value || 300);
        finalCanvas.width = size + margin * 2;
        finalCanvas.height = size + margin * 2;
        
        const ctx = finalCanvas.getContext('2d');
        
        // Fill background
        ctx.fillStyle = document.getElementById('qrgen-bgcolor')?.value || '#FFFFFF';
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        
        // Draw QR code
        const source = qrCanvas || qrImg;
        ctx.drawImage(source, margin, margin, size, size);
        
        // Draw logo if exists
        if (this.logoData) {
            const logoImg = new Image();
            logoImg.onload = () => {
                const logoSize = size * 0.2;
                const x = (finalCanvas.width - logoSize) / 2;
                const y = (finalCanvas.height - logoSize) / 2;
                
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x - 8, y - 8, logoSize + 16, logoSize + 16);
                ctx.drawImage(logoImg, x, y, logoSize, logoSize);
                
                this.exportCanvas(finalCanvas, format);
            };
            logoImg.src = this.logoData;
        } else {
            this.exportCanvas(finalCanvas, format);
        }
    },

    exportCanvas(canvas, format) {
        let dataUrl;
        if (format === 'png') {
            dataUrl = canvas.toDataURL('image/png');
        } else if (format === 'jpeg') {
            dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        } else if (format === 'svg') {
            const imgData = canvas.toDataURL('image/png');
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
                <image href="${imgData}" width="${canvas.width}" height="${canvas.height}"/>
            </svg>`;
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            dataUrl = URL.createObjectURL(blob);
        }
        window.open(dataUrl, '_blank');
    },

    async copyToClipboard() {
        const container = document.getElementById('qrgen-container');
        const canvas = container?.querySelector('canvas');
        if (!canvas) {
            alert('Vui lòng tạo mã QR trước');
            return;
        }

        try {
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            alert('Đã sao chép mã QR vào clipboard!');
        } catch (e) {
            alert('Không thể sao chép. Trình duyệt không hỗ trợ.');
        }
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => ToolsPage.init());

// ==========================================
// EMAIL SIGNATURE GENERATOR
// ==========================================
const EmailSignature = {
    update() {
        const data = this.getData();
        const preview = document.getElementById('sig-preview');
        const htmlCode = document.getElementById('sig-html-code');
        
        if (!data.name) {
            preview.innerHTML = '<p class="text-gray-400 text-center">Nhập thông tin để xem trước chữ ký</p>';
            htmlCode.value = '';
            return;
        }

        const html = this.generateHTML(data);
        preview.innerHTML = html;
        htmlCode.value = html;
    },

    getData() {
        return {
            name: document.getElementById('sig-name')?.value || '',
            title: document.getElementById('sig-title')?.value || '',
            company: document.getElementById('sig-company')?.value || '',
            email: document.getElementById('sig-email')?.value || '',
            phone: document.getElementById('sig-phone')?.value || '',
            mobile: document.getElementById('sig-mobile')?.value || '',
            website: document.getElementById('sig-website')?.value || '',
            address: document.getElementById('sig-address')?.value || '',
            facebook: document.getElementById('sig-facebook')?.value || '',
            linkedin: document.getElementById('sig-linkedin')?.value || '',
            twitter: document.getElementById('sig-twitter')?.value || '',
            instagram: document.getElementById('sig-instagram')?.value || '',
            github: document.getElementById('sig-github')?.value || '',
            logo: document.getElementById('sig-logo')?.value || '',
            primaryColor: document.getElementById('sig-primary-color')?.value || '#0d544c',
            textColor: document.getElementById('sig-text-color')?.value || '#333333',
            font: document.getElementById('sig-font')?.value || 'Arial, sans-serif'
        };
    },

    generateHTML(data) {
        const socialIcons = this.getSocialLinks(data);
        
        // Build contact items
        let contactItems = [];
        if (data.website) contactItems.push(`<span style="white-space: nowrap;">🌐 <a href="${data.website}" style="color: ${data.primaryColor}; text-decoration: none;">${data.website.replace(/^https?:\/\//, '')}</a></span>`);
        if (data.email) contactItems.push(`<span style="white-space: nowrap;">✉️ <a href="mailto:${data.email}" style="color: ${data.primaryColor}; text-decoration: none;">${data.email}</a></span>`);
        if (data.phone) contactItems.push(`<span style="white-space: nowrap;">📞 ${data.phone}</span>`);
        if (data.mobile) contactItems.push(`<span style="white-space: nowrap;">📱 ${data.mobile}</span>`);
        
        return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: ${data.font}; font-size: 14px; color: ${data.textColor}; line-height: 1.5;">
  <tr>
    ${data.logo ? `<td style="vertical-align: top; padding-right: 15px;">
      <img src="${data.logo}" alt="Logo" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover; display: block; border: 2px solid ${data.primaryColor};">
    </td>
    <td style="border-left: 3px solid ${data.primaryColor}; padding-left: 15px; vertical-align: top;">` : '<td style="vertical-align: top;">'}
      <table cellpadding="0" cellspacing="0" border="0" style="font-family: ${data.font};">
        <tr>
          <td style="font-size: 20px; font-weight: 700; color: ${data.primaryColor}; padding-bottom: 4px; letter-spacing: -0.5px;">${data.name}</td>
        </tr>
        ${data.title || data.company ? `<tr>
          <td style="font-size: 14px; color: ${data.textColor}; padding-bottom: 8px;">
            ${data.title ? `<span style="font-weight: 500;">${data.title}</span>` : ''}${data.title && data.company ? ' · ' : ''}${data.company ? `<span style="font-weight: 600; color: ${data.primaryColor};">${data.company}</span>` : ''}
          </td>
        </tr>` : ''}
        ${contactItems.length ? `<tr>
          <td style="font-size: 13px; color: ${data.textColor}; padding-bottom: 6px;">
            ${contactItems.slice(0, 2).join(' &nbsp;│&nbsp; ')}
          </td>
        </tr>` : ''}
        ${contactItems.length > 2 ? `<tr>
          <td style="font-size: 13px; color: ${data.textColor}; padding-bottom: 6px;">
            ${contactItems.slice(2).join(' &nbsp;│&nbsp; ')}
          </td>
        </tr>` : ''}
        ${data.address ? `<tr><td style="font-size: 13px; color: ${data.textColor}; padding-bottom: 8px;">📍 ${data.address}</td></tr>` : ''}
        ${socialIcons ? `<tr><td style="padding-top: 4px;">${socialIcons}</td></tr>` : ''}
      </table>
    </td>
  </tr>
</table>`;
    },

    getSocialLinks(data) {
        const links = [];
        const iconSize = '22';
        const iconStyle = `width: ${iconSize}px; height: ${iconSize}px; vertical-align: middle; border-radius: 4px;`;
        
        // Using better quality icons from simpleicons.org CDN
        if (data.facebook) {
            links.push(`<a href="${data.facebook}" style="text-decoration: none; display: inline-block; margin-right: 8px;" title="Facebook">
              <img src="https://cdn.simpleicons.org/facebook/1877F2" alt="Facebook" style="${iconStyle}">
            </a>`);
        }
        if (data.linkedin) {
            links.push(`<a href="${data.linkedin}" style="text-decoration: none; display: inline-block; margin-right: 8px;" title="LinkedIn">
              <img src="https://cdn.simpleicons.org/linkedin/0A66C2" alt="LinkedIn" style="${iconStyle}">
            </a>`);
        }
        if (data.twitter) {
            links.push(`<a href="${data.twitter}" style="text-decoration: none; display: inline-block; margin-right: 8px;" title="X/Twitter">
              <img src="https://cdn.simpleicons.org/x/000000" alt="X" style="${iconStyle}">
            </a>`);
        }
        if (data.instagram) {
            links.push(`<a href="${data.instagram}" style="text-decoration: none; display: inline-block; margin-right: 8px;" title="Instagram">
              <img src="https://cdn.simpleicons.org/instagram/E4405F" alt="Instagram" style="${iconStyle}">
            </a>`);
        }
        if (data.github) {
            links.push(`<a href="${data.github}" style="text-decoration: none; display: inline-block; margin-right: 8px;" title="GitHub">
              <img src="https://cdn.simpleicons.org/github/181717" alt="GitHub" style="${iconStyle}">
            </a>`);
        }
        
        return links.join('');
    },

    syncColor(type, value) {
        if (type === 'primary') {
            document.getElementById('sig-primary-color').value = value;
        } else {
            document.getElementById('sig-text-color').value = value;
        }
        this.update();
    },

    copySignature() {
        const preview = document.getElementById('sig-preview');
        if (!preview || preview.querySelector('.text-gray-400')) {
            alert('Vui lòng nhập thông tin trước');
            return;
        }

        // Copy as rich text (HTML)
        const range = document.createRange();
        range.selectNodeContents(preview);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        try {
            document.execCommand('copy');
            alert('Đã copy chữ ký! Paste vào email client của bạn.');
        } catch (e) {
            alert('Không thể copy. Vui lòng chọn thủ công và copy.');
        }
        
        selection.removeAllRanges();
    },

    copyHTML() {
        const htmlCode = document.getElementById('sig-html-code');
        if (!htmlCode.value) {
            alert('Vui lòng nhập thông tin trước');
            return;
        }

        navigator.clipboard.writeText(htmlCode.value).then(() => {
            alert('Đã copy mã HTML!');
        }).catch(() => {
            htmlCode.select();
            document.execCommand('copy');
            alert('Đã copy mã HTML!');
        });
    }
};


// ==========================================
// LUCKY WHEEL - Vòng xoay may mắn
// ==========================================
const LuckyWheel = {
    isSpinning: false,
    currentRotation: 0,
    winners: [],
    colors: [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8B500', '#00CED1', '#FF69B4', '#32CD32', '#FF7F50'
    ],

    init() {
        this.draw();
        this.setupKeyboard();
    },

    getNames() {
        const textarea = document.getElementById('wheel-names');
        if (!textarea) return [];
        return textarea.value.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    },

    updateCount() {
        const names = this.getNames();
        const countEl = document.getElementById('wheel-count');
        if (countEl) {
            countEl.textContent = `${names.length} mục (tối thiểu: 2, tối đa: 200)`;
            if (names.length < 2) {
                countEl.classList.add('text-red-500');
            } else {
                countEl.classList.remove('text-red-500');
            }
        }
        this.draw();
    },

    shuffle() {
        const names = this.getNames();
        for (let i = names.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [names[i], names[j]] = [names[j], names[i]];
        }
        document.getElementById('wheel-names').value = names.join('\n');
        this.draw();
    },

    sort() {
        const names = this.getNames();
        names.sort((a, b) => a.localeCompare(b, 'vi'));
        document.getElementById('wheel-names').value = names.join('\n');
        this.draw();
    },

    draw() {
        const canvas = document.getElementById('wheel-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const names = this.getNames();
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (names.length < 2) {
            ctx.fillStyle = '#ccc';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Cần ít nhất 2 mục', centerX, centerY);
            return;
        }

        const sliceAngle = (2 * Math.PI) / names.length;

        // Draw slices
        names.forEach((name, i) => {
            const startAngle = i * sliceAngle + this.currentRotation;
            const endAngle = startAngle + sliceAngle;

            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = this.colors[i % this.colors.length];
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw text
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 2;
            
            // Truncate long names
            let displayName = name.length > 15 ? name.substring(0, 12) + '...' : name;
            ctx.fillText(displayName, radius - 15, 4);
            ctx.restore();
        });

        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
        ctx.fillStyle = '#0d544c';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
    },

    spin() {
        if (this.isSpinning) return;
        
        const names = this.getNames();
        if (names.length < 2) {
            alert('Cần ít nhất 2 mục để quay!');
            return;
        }

        this.isSpinning = true;
        const btn = document.getElementById('wheel-spin-btn');
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');

        // Random winner
        const winnerIndex = Math.floor(Math.random() * names.length);
        const sliceAngle = (2 * Math.PI) / names.length;
        
        // Calculate target rotation (winner at top = -90 degrees = -PI/2)
        // We want the middle of the winning slice to be at the top (where pointer is)
        const targetSliceMiddle = winnerIndex * sliceAngle + sliceAngle / 2;
        const targetRotation = -targetSliceMiddle - Math.PI / 2;
        
        // Add extra spins (5-8 full rotations)
        const extraSpins = (5 + Math.random() * 3) * 2 * Math.PI;
        const totalRotation = targetRotation + extraSpins - this.currentRotation;

        // Animate
        const duration = 5000 + Math.random() * 2000; // 5-7 seconds
        const startTime = Date.now();
        const startRotation = this.currentRotation;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            this.currentRotation = startRotation + totalRotation * easeOut;
            this.draw();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isSpinning = false;
                btn.disabled = false;
                btn.classList.remove('opacity-50', 'cursor-not-allowed');
                this.announceWinner(names[winnerIndex]);
            }
        };

        requestAnimationFrame(animate);
    },

    announceWinner(name) {
        // Show winner display
        const display = document.getElementById('wheel-winner-display');
        const nameEl = document.getElementById('wheel-winner-name');
        display.classList.remove('hidden');
        nameEl.textContent = name;

        // Add to history
        this.winners.unshift({
            name: name,
            time: new Date().toLocaleTimeString('vi-VN')
        });
        this.updateHistory();
    },

    updateHistory() {
        const historyEl = document.getElementById('wheel-history');
        if (!historyEl) return;

        if (this.winners.length === 0) {
            historyEl.innerHTML = '<p class="text-gray-400 text-center py-4">Chưa có người thắng. Quay vòng xoay để bắt đầu!</p>';
            return;
        }

        historyEl.innerHTML = this.winners.map((w, i) => `
            <div class="flex items-center justify-between p-3 rounded-lg ${i === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-gray-100 dark:bg-gray-700'}">
                <div class="flex items-center gap-2">
                    <span class="text-lg">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🎯'}</span>
                    <span class="font-medium text-gray-800 dark:text-white">${w.name}</span>
                </div>
                <span class="text-sm text-gray-500 dark:text-gray-400">${w.time}</span>
            </div>
        `).join('');
    },

    clearHistory() {
        this.winners = [];
        this.updateHistory();
        document.getElementById('wheel-winner-display')?.classList.add('hidden');
    },

    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const wheelTab = document.getElementById('tab-wheel');
                if (wheelTab && !wheelTab.classList.contains('hidden')) {
                    e.preventDefault();
                    this.spin();
                }
            }
        });
    }
};

// Initialize wheel when tab is shown
document.addEventListener('DOMContentLoaded', () => {
    // Draw wheel after a short delay to ensure canvas is ready
    setTimeout(() => LuckyWheel.init(), 100);
});