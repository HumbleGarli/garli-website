// ==========================================
// TOOLS.JS - Trang Tiện ích
// ==========================================

const ToolsPage = {
    currentTab: '2fa',
    countdownInterval: null,
    banks: [],
    bankInitialized: false,

    init() {
        this.loadBanks();
        this.setupClickOutside();
        this.checkUrlHash();
    },

    // ==========================================
    // GRID VIEW NAVIGATION
    // ==========================================
    openTool(toolId) {
        const gridView = document.getElementById('tools-grid-view');
        const detailView = document.getElementById('tools-detail-view');
        
        // Hide grid, show detail
        gridView.classList.add('hidden');
        detailView.classList.remove('hidden');
        
        // Hide all panels, show selected
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
        const panel = document.getElementById(`tab-${toolId}`);
        if (panel) {
            panel.classList.remove('hidden');
        }
        
        this.currentTab = toolId;
        
        // Update URL hash
        window.location.hash = toolId;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    backToGrid() {
        const gridView = document.getElementById('tools-grid-view');
        const detailView = document.getElementById('tools-detail-view');
        
        // Show grid, hide detail
        gridView.classList.remove('hidden');
        detailView.classList.add('hidden');
        
        // Clear URL hash
        history.pushState('', document.title, window.location.pathname);
        
        // Stop camera if QR reader was active
        if (typeof QRReader !== 'undefined') {
            QRReader.stopCamera();
        }
    },

    checkUrlHash() {
        const hash = window.location.hash.slice(1);
        if (hash) {
            const panel = document.getElementById(`tab-${hash}`);
            if (panel) {
                this.openTool(hash);
            }
        }
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
        let filename = `qrcode.${format}`;
        
        if (format === 'png') {
            dataUrl = canvas.toDataURL('image/png');
        } else if (format === 'jpeg') {
            dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            filename = 'qrcode.jpg';
        } else if (format === 'svg') {
            const imgData = canvas.toDataURL('image/png');
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
                <image href="${imgData}" width="${canvas.width}" height="${canvas.height}"/>
            </svg>`;
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            dataUrl = URL.createObjectURL(blob);
        }
        
        // Create download link
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up blob URL if SVG
        if (format === 'svg') {
            URL.revokeObjectURL(dataUrl);
        }
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
        const targetAngle = -targetSliceMiddle - Math.PI / 2;
        
        // Always add 5-8 full rotations for consistent spin speed
        const extraSpins = (5 + Math.random() * 3) * 2 * Math.PI;
        
        // Normalize current rotation to 0-2PI range, then add extra spins
        const normalizedCurrent = this.currentRotation % (2 * Math.PI);
        const totalRotation = extraSpins + (targetAngle - normalizedCurrent);

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
                // Normalize rotation to prevent huge numbers over time
                this.currentRotation = this.currentRotation % (2 * Math.PI);
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

        // Fire confetti!
        this.fireConfetti();

        // Add to history
        this.winners.unshift({
            name: name,
            time: new Date().toLocaleTimeString('vi-VN')
        });
        this.updateHistory();
    },

    fireConfetti() {
        // Create confetti container
        const container = document.createElement('div');
        container.id = 'confetti-container';
        container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
        document.body.appendChild(container);

        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF69B4', '#32CD32', '#FFD700', '#FF7F50'];
        const confettiCount = 150;

        // Create confetti pieces
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 10 + 5;
            const startX = Math.random() * 100;
            const startY = -10;
            const rotation = Math.random() * 360;
            const duration = Math.random() * 2 + 3;
            const delay = Math.random() * 0.5;
            const drift = (Math.random() - 0.5) * 200;

            confetti.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                left: ${startX}%;
                top: ${startY}%;
                transform: rotate(${rotation}deg);
                opacity: 1;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                animation: confetti-fall ${duration}s ease-out ${delay}s forwards;
            `;
            
            // Add custom property for drift
            confetti.style.setProperty('--drift', `${drift}px`);
            container.appendChild(confetti);
        }

        // Add CSS animation if not exists
        if (!document.getElementById('confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confetti-fall {
                    0% {
                        transform: translateY(0) translateX(0) rotate(0deg) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) translateX(var(--drift)) rotate(720deg) scale(0.5);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Remove container after animation
        setTimeout(() => {
            container.remove();
        }, 5000);
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


// ==========================================
// BMI CALCULATOR
// ==========================================
const BMICalculator = {
    unit: 'metric', // 'metric' or 'imperial'

    setUnit(unit) {
        this.unit = unit;
        
        // Update button states
        const metricBtn = document.getElementById('bmi-unit-metric');
        const imperialBtn = document.getElementById('bmi-unit-imperial');
        
        if (unit === 'metric') {
            metricBtn.classList.add('bg-[#0d544c]', 'text-white');
            metricBtn.classList.remove('border', 'border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
            imperialBtn.classList.remove('bg-[#0d544c]', 'text-white');
            imperialBtn.classList.add('border', 'border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
            
            document.getElementById('bmi-height-metric').classList.remove('hidden');
            document.getElementById('bmi-height-imperial').classList.add('hidden');
            document.getElementById('bmi-weight-unit').textContent = 'kg';
        } else {
            imperialBtn.classList.add('bg-[#0d544c]', 'text-white');
            imperialBtn.classList.remove('border', 'border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
            metricBtn.classList.remove('bg-[#0d544c]', 'text-white');
            metricBtn.classList.add('border', 'border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
            
            document.getElementById('bmi-height-metric').classList.add('hidden');
            document.getElementById('bmi-height-imperial').classList.remove('hidden');
            document.getElementById('bmi-weight-unit').textContent = 'lb';
        }
        
        this.calculate();
    },

    calculate() {
        let weight, heightM;
        
        if (this.unit === 'metric') {
            weight = parseFloat(document.getElementById('bmi-weight').value);
            const heightCm = parseFloat(document.getElementById('bmi-height-cm').value);
            heightM = heightCm / 100;
        } else {
            const weightLb = parseFloat(document.getElementById('bmi-weight').value);
            weight = weightLb * 0.453592; // Convert to kg
            const heightFt = parseFloat(document.getElementById('bmi-height-ft').value) || 0;
            const heightIn = parseFloat(document.getElementById('bmi-height-in').value) || 0;
            const totalInches = (heightFt * 12) + heightIn;
            heightM = totalInches * 0.0254; // Convert to meters
        }

        const resultEl = document.getElementById('bmi-result');
        
        if (!weight || !heightM || weight <= 0 || heightM <= 0) {
            resultEl.innerHTML = '<p class="text-gray-400">Nhập cân nặng và chiều cao để tính BMI</p>';
            this.highlightCategory(null);
            return;
        }

        const bmi = weight / (heightM * heightM);
        const category = this.getCategory(bmi);
        
        resultEl.innerHTML = `
            <div class="space-y-4">
                <div class="text-6xl font-bold ${category.color}">${bmi.toFixed(1)}</div>
                <div class="flex items-center justify-center gap-2">
                    <span class="text-3xl">${category.emoji}</span>
                    <span class="text-xl font-semibold ${category.color}">${category.name}</span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400">${category.tip}</p>
                ${this.getHealthyWeightRange(heightM)}
            </div>
        `;
        
        this.highlightCategory(category.key);
    },

    getCategory(bmi) {
        if (bmi < 18.5) {
            return {
                key: 'underweight',
                name: 'Thiếu cân',
                emoji: '💙',
                color: 'text-blue-600 dark:text-blue-400',
                tip: 'Bạn nên tăng cường dinh dưỡng và tham khảo ý kiến chuyên gia.'
            };
        } else if (bmi < 25) {
            return {
                key: 'normal',
                name: 'Cân nặng khỏe mạnh',
                emoji: '💚',
                color: 'text-green-600 dark:text-green-400',
                tip: 'Tuyệt vời! Hãy duy trì lối sống lành mạnh.'
            };
        } else if (bmi < 30) {
            return {
                key: 'overweight',
                name: 'Thừa cân',
                emoji: '💛',
                color: 'text-yellow-600 dark:text-yellow-400',
                tip: 'Hãy tăng cường vận động và điều chỉnh chế độ ăn.'
            };
        } else {
            return {
                key: 'obese',
                name: 'Béo phì',
                emoji: '❤️',
                color: 'text-red-600 dark:text-red-400',
                tip: 'Nên tham khảo ý kiến bác sĩ để có kế hoạch phù hợp.'
            };
        }
    },

    getHealthyWeightRange(heightM) {
        const minWeight = 18.5 * heightM * heightM;
        const maxWeight = 24.9 * heightM * heightM;
        
        if (this.unit === 'imperial') {
            const minLb = (minWeight / 0.453592).toFixed(1);
            const maxLb = (maxWeight / 0.453592).toFixed(1);
            return `<p class="text-xs text-gray-400 mt-2">Cân nặng khỏe mạnh cho chiều cao của bạn: ${minLb} - ${maxLb} lb</p>`;
        } else {
            return `<p class="text-xs text-gray-400 mt-2">Cân nặng khỏe mạnh cho chiều cao của bạn: ${minWeight.toFixed(1)} - ${maxWeight.toFixed(1)} kg</p>`;
        }
    },

    highlightCategory(key) {
        const categories = ['underweight', 'normal', 'overweight', 'obese'];
        categories.forEach(cat => {
            const el = document.getElementById(`bmi-cat-${cat}`);
            if (el) {
                if (cat === key) {
                    el.classList.add('ring-2', 'ring-offset-2', 'ring-[#0d544c]', 'scale-105');
                } else {
                    el.classList.remove('ring-2', 'ring-offset-2', 'ring-[#0d544c]', 'scale-105');
                }
            }
        });
    }
};


// ==========================================
// SLEEP CALCULATOR
// ==========================================
const SleepCalculator = {
    mode: 'bedtime', // 'bedtime' or 'waketime'
    CYCLE_MINUTES: 90,
    FALL_ASLEEP_MINUTES: 14,

    setMode(mode) {
        this.mode = mode;
        
        const bedtimeBtn = document.getElementById('sleep-mode-bedtime');
        const waketimeBtn = document.getElementById('sleep-mode-waketime');
        const bedtimeInput = document.getElementById('sleep-bedtime-input');
        const waketimeInput = document.getElementById('sleep-waketime-input');
        const calcBtn = document.getElementById('sleep-calc-btn');
        const resultTitle = document.getElementById('sleep-result-title');
        
        if (mode === 'bedtime') {
            bedtimeBtn.classList.add('bg-[#0d544c]', 'text-white');
            bedtimeBtn.classList.remove('border', 'border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
            waketimeBtn.classList.remove('bg-[#0d544c]', 'text-white');
            waketimeBtn.classList.add('border', 'border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
            
            bedtimeInput.classList.remove('hidden');
            waketimeInput.classList.add('hidden');
            calcBtn.classList.remove('hidden');
            resultTitle.textContent = 'Thời gian đi ngủ gợi ý';
        } else {
            waketimeBtn.classList.add('bg-[#0d544c]', 'text-white');
            waketimeBtn.classList.remove('border', 'border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
            bedtimeBtn.classList.remove('bg-[#0d544c]', 'text-white');
            bedtimeBtn.classList.add('border', 'border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
            
            bedtimeInput.classList.add('hidden');
            waketimeInput.classList.remove('hidden');
            calcBtn.classList.add('hidden');
            resultTitle.textContent = 'Thời gian thức dậy gợi ý';
        }
        
        this.calculate();
    },

    calculate() {
        const resultsEl = document.getElementById('sleep-results');
        
        if (this.mode === 'bedtime') {
            this.calculateBedtime(resultsEl);
        } else {
            this.calculateWaketime(resultsEl);
        }
    },

    calculateBedtime(resultsEl) {
        const wakeTimeInput = document.getElementById('sleep-wakeup-time').value;
        if (!wakeTimeInput) {
            resultsEl.innerHTML = '<p class="text-gray-400 text-center py-4">Chọn thời gian thức dậy</p>';
            return;
        }

        const [hours, minutes] = wakeTimeInput.split(':').map(Number);
        const wakeTime = new Date();
        wakeTime.setHours(hours, minutes, 0, 0);

        const results = [];
        // Calculate for 6, 5, 4, 3 cycles (9h, 7.5h, 6h, 4.5h)
        for (let cycles = 6; cycles >= 3; cycles--) {
            const sleepDuration = cycles * this.CYCLE_MINUTES + this.FALL_ASLEEP_MINUTES;
            const bedTime = new Date(wakeTime.getTime() - sleepDuration * 60 * 1000);
            
            results.push({
                cycles: cycles,
                time: bedTime,
                duration: cycles * this.CYCLE_MINUTES / 60,
                recommended: cycles === 5
            });
        }

        resultsEl.innerHTML = results.map(r => `
            <div class="p-4 rounded-xl border-2 transition-all ${r.recommended ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl font-bold ${r.recommended ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}">
                            ${this.formatTime(r.time)}
                        </span>
                        ${r.recommended ? '<span class="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Khuyến nghị</span>' : ''}
                    </div>
                    <div class="text-right text-sm text-gray-500 dark:text-gray-400">
                        <div>${r.cycles} chu kỳ</div>
                        <div>${r.duration} tiếng</div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    calculateWaketime(resultsEl) {
        const now = new Date();
        const sleepTime = new Date(now.getTime() + this.FALL_ASLEEP_MINUTES * 60 * 1000);

        const results = [];
        // Calculate for 3, 4, 5, 6 cycles
        for (let cycles = 3; cycles <= 6; cycles++) {
            const sleepDuration = cycles * this.CYCLE_MINUTES;
            const wakeTime = new Date(sleepTime.getTime() + sleepDuration * 60 * 1000);
            
            results.push({
                cycles: cycles,
                time: wakeTime,
                duration: cycles * this.CYCLE_MINUTES / 60,
                recommended: cycles === 5
            });
        }

        resultsEl.innerHTML = results.map(r => `
            <div class="p-4 rounded-xl border-2 transition-all ${r.recommended ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl font-bold ${r.recommended ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}">
                            ${this.formatTime(r.time)}
                        </span>
                        ${r.recommended ? '<span class="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Khuyến nghị</span>' : ''}
                    </div>
                    <div class="text-right text-sm text-gray-500 dark:text-gray-400">
                        <div>${r.cycles} chu kỳ</div>
                        <div>${r.duration} tiếng</div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    formatTime(date) {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
};


// ==========================================
// COLOR CONTRAST CHECKER
// ==========================================
const ContrastChecker = {
    init() {
        this.update();
    },

    update() {
        const fgColor = document.getElementById('contrast-fg').value;
        const bgColor = document.getElementById('contrast-bg').value;
        
        // Update text inputs
        document.getElementById('contrast-fg-text').value = fgColor.toUpperCase();
        document.getElementById('contrast-bg-text').value = bgColor.toUpperCase();
        
        // Update preview
        const preview = document.getElementById('contrast-preview');
        const previewNormal = document.getElementById('contrast-preview-normal');
        const previewLarge = document.getElementById('contrast-preview-large');
        
        preview.style.backgroundColor = bgColor;
        previewNormal.style.color = fgColor;
        previewLarge.style.color = fgColor;
        
        // Calculate contrast ratio
        const ratio = this.getContrastRatio(fgColor, bgColor);
        document.getElementById('contrast-ratio').textContent = ratio.toFixed(2) + ':1';
        
        // Update WCAG compliance
        this.updateWCAG(ratio);
    },

    syncColor(type, value) {
        // Validate hex color
        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            if (type === 'fg') {
                document.getElementById('contrast-fg').value = value;
            } else {
                document.getElementById('contrast-bg').value = value;
            }
            this.update();
        }
    },

    swap() {
        const fg = document.getElementById('contrast-fg').value;
        const bg = document.getElementById('contrast-bg').value;
        
        document.getElementById('contrast-fg').value = bg;
        document.getElementById('contrast-bg').value = fg;
        
        this.update();
    },

    // Convert hex to RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    // Calculate relative luminance
    getLuminance(hex) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return 0;
        
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    },

    // Calculate contrast ratio
    getContrastRatio(fg, bg) {
        const l1 = this.getLuminance(fg);
        const l2 = this.getLuminance(bg);
        
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        
        return (lighter + 0.05) / (darker + 0.05);
    },

    updateWCAG(ratio) {
        const checks = [
            { id: 'wcag-aa-normal', threshold: 4.5 },
            { id: 'wcag-aa-large', threshold: 3 },
            { id: 'wcag-aaa-normal', threshold: 7 },
            { id: 'wcag-aaa-large', threshold: 4.5 }
        ];

        checks.forEach(check => {
            const el = document.getElementById(check.id);
            const badge = document.getElementById(check.id + '-badge');
            const pass = ratio >= check.threshold;
            
            if (pass) {
                el.classList.remove('border-red-400', 'bg-red-50', 'dark:bg-red-900/20');
                el.classList.add('border-green-400', 'bg-green-50', 'dark:bg-green-900/20');
                badge.classList.remove('bg-red-500');
                badge.classList.add('bg-green-500');
                badge.textContent = 'Đạt';
            } else {
                el.classList.remove('border-green-400', 'bg-green-50', 'dark:bg-green-900/20');
                el.classList.add('border-red-400', 'bg-red-50', 'dark:bg-red-900/20');
                badge.classList.remove('bg-green-500');
                badge.classList.add('bg-red-500');
                badge.textContent = 'Không đạt';
            }
        });
    }
};

// Initialize contrast checker when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => ContrastChecker.init(), 100);
});


// ==========================================
// IMAGE PALETTE EXTRACTOR
// ==========================================
const PaletteExtractor = {
    colorCount: 6,
    imageData: null,

    init() {
        // Setup paste event
        document.addEventListener('paste', (e) => {
            const paletteTab = document.getElementById('tab-palette');
            if (paletteTab && !paletteTab.classList.contains('hidden')) {
                const items = e.clipboardData?.items;
                if (items) {
                    for (let item of items) {
                        if (item.type.startsWith('image/')) {
                            const file = item.getAsFile();
                            this.handleFile(file);
                            break;
                        }
                    }
                }
            }
        });
    },

    updateCount(value) {
        this.colorCount = parseInt(value);
        if (this.imageData) {
            this.extractColors();
        }
    },

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('border-[#0d544c]', 'bg-[#0d544c]/5');
    },

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('border-[#0d544c]', 'bg-[#0d544c]/5');
    },

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('border-[#0d544c]', 'bg-[#0d544c]/5');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            this.handleFile(file);
        }
    },

    handleFile(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.imageData = e.target.result;
            document.getElementById('palette-image').src = this.imageData;
            document.getElementById('palette-image-container').classList.remove('hidden');
            document.getElementById('palette-dropzone').classList.add('hidden');
            document.getElementById('palette-clear-btn').classList.remove('hidden');
            this.extractColors();
        };
        reader.readAsDataURL(file);
    },

    extractColors() {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Scale down for performance
            const maxSize = 150;
            const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
            canvas.width = Math.floor(img.width * scale);
            canvas.height = Math.floor(img.height * scale);
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            
            // Collect all pixels as RGB arrays
            const pixelArray = [];
            for (let i = 0; i < pixels.length; i += 4) {
                // Skip transparent pixels
                if (pixels[i + 3] < 128) continue;
                pixelArray.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
            }
            
            // Use K-Means clustering to find dominant colors
            const colors = this.kMeans(pixelArray, this.colorCount);
            
            // Sort by frequency/importance (first color is dominant)
            // Then sort rest by luminance
            const dominant = colors[0];
            const rest = colors.slice(1).sort((a, b) => {
                const lumA = 0.299 * a[0] + 0.587 * a[1] + 0.114 * a[2];
                const lumB = 0.299 * b[0] + 0.587 * b[1] + 0.114 * b[2];
                return lumA - lumB;
            });
            
            this.currentColors = [dominant, ...rest].map(c => ({
                hex: this.rgbToHex(c[0], c[1], c[2]),
                rgb: c
            }));
            
            this.displayColors();
        };
        img.src = this.imageData;
    },

    // K-Means clustering algorithm
    kMeans(pixels, k, maxIterations = 20) {
        if (pixels.length === 0) return [];
        if (pixels.length <= k) {
            return pixels.map(p => [...p]);
        }

        // Initialize centroids using k-means++ method
        const centroids = this.initCentroids(pixels, k);
        let clusters = [];
        
        for (let iter = 0; iter < maxIterations; iter++) {
            // Assign pixels to nearest centroid
            clusters = Array.from({ length: k }, () => []);
            
            for (const pixel of pixels) {
                let minDist = Infinity;
                let closestIdx = 0;
                
                for (let i = 0; i < centroids.length; i++) {
                    const dist = this.colorDistanceRGB(pixel, centroids[i]);
                    if (dist < minDist) {
                        minDist = dist;
                        closestIdx = i;
                    }
                }
                clusters[closestIdx].push(pixel);
            }
            
            // Update centroids
            let converged = true;
            for (let i = 0; i < k; i++) {
                if (clusters[i].length === 0) continue;
                
                const newCentroid = [0, 0, 0];
                for (const pixel of clusters[i]) {
                    newCentroid[0] += pixel[0];
                    newCentroid[1] += pixel[1];
                    newCentroid[2] += pixel[2];
                }
                newCentroid[0] = Math.round(newCentroid[0] / clusters[i].length);
                newCentroid[1] = Math.round(newCentroid[1] / clusters[i].length);
                newCentroid[2] = Math.round(newCentroid[2] / clusters[i].length);
                
                if (this.colorDistanceRGB(centroids[i], newCentroid) > 1) {
                    converged = false;
                }
                centroids[i] = newCentroid;
            }
            
            if (converged) break;
        }
        
        // Sort by cluster size (most pixels = dominant)
        const indexed = centroids.map((c, i) => ({ centroid: c, size: clusters[i].length }));
        indexed.sort((a, b) => b.size - a.size);
        
        return indexed.map(x => x.centroid);
    },

    // K-means++ initialization
    initCentroids(pixels, k) {
        const centroids = [];
        
        // First centroid: random pixel
        centroids.push([...pixels[Math.floor(Math.random() * pixels.length)]]);
        
        // Remaining centroids: weighted by distance
        while (centroids.length < k) {
            const distances = pixels.map(pixel => {
                let minDist = Infinity;
                for (const centroid of centroids) {
                    const dist = this.colorDistanceRGB(pixel, centroid);
                    minDist = Math.min(minDist, dist);
                }
                return minDist * minDist;
            });
            
            const totalDist = distances.reduce((a, b) => a + b, 0);
            let random = Math.random() * totalDist;
            
            for (let i = 0; i < pixels.length; i++) {
                random -= distances[i];
                if (random <= 0) {
                    centroids.push([...pixels[i]]);
                    break;
                }
            }
        }
        
        return centroids;
    },

    colorDistanceRGB(c1, c2) {
        // Using weighted Euclidean distance for better perceptual accuracy
        const rMean = (c1[0] + c2[0]) / 2;
        const dR = c1[0] - c2[0];
        const dG = c1[1] - c2[1];
        const dB = c1[2] - c2[2];
        
        return Math.sqrt(
            (2 + rMean / 256) * dR * dR +
            4 * dG * dG +
            (2 + (255 - rMean) / 256) * dB * dB
        );
    },

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.min(255, Math.max(0, Math.round(x))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();
    },

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    },

    displayColors() {
        const colors = this.currentColors;
        if (!colors || colors.length === 0) return;

        // Show sections
        document.getElementById('palette-dominant-section').classList.remove('hidden');
        document.getElementById('palette-grid-section').classList.remove('hidden');

        // Display color circles under image
        const circlesEl = document.getElementById('palette-circles');
        circlesEl.innerHTML = colors.map((c, i) => 
            `<div class="w-10 h-10 rounded-full border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-110" 
                style="background-color: ${c.hex};" 
                onclick="PaletteExtractor.selectDominant(${i})"
                title="${c.hex}"></div>`
        ).join('');

        // Display dominant color (first one)
        this.selectDominant(0);

        // Display palette grid
        const gridEl = document.getElementById('palette-grid');
        gridEl.innerHTML = colors.map((c, i) => `
            <div class="relative">
                <div class="h-32 rounded-xl mb-3 cursor-pointer transition-transform hover:scale-105" 
                    style="background-color: ${c.hex};"
                    onclick="PaletteExtractor.selectDominant(${i})">
                    ${i === 0 ? '<span class="absolute top-2 right-2 px-2 py-1 bg-[#0d544c] text-white text-xs rounded-full">Chủ Đạo</span>' : ''}
                </div>
                <div class="space-y-2">
                    <div>
                        <label class="text-xs text-gray-500 dark:text-gray-400">HEX</label>
                        <div class="flex items-center gap-1">
                            <input type="text" value="${c.hex}" readonly id="palette-hex-${i}"
                                class="flex-1 px-2 py-1 text-sm rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white font-mono">
                            <button onclick="PaletteExtractor.copyValue('palette-hex-${i}')" class="p-1 text-gray-400 hover:text-[#0d544c] text-sm">📋</button>
                        </div>
                    </div>
                    <div>
                        <label class="text-xs text-gray-500 dark:text-gray-400">RGB</label>
                        <div class="flex items-center gap-1">
                            <input type="text" value="rgb(${c.rgb[0]}, ${c.rgb[1]}, ${c.rgb[2]})" readonly id="palette-rgb-${i}"
                                class="flex-1 px-2 py-1 text-sm rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white font-mono">
                            <button onclick="PaletteExtractor.copyValue('palette-rgb-${i}')" class="p-1 text-gray-400 hover:text-[#0d544c] text-sm">📋</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    selectDominant(index) {
        const color = this.currentColors[index];
        if (!color) return;

        document.getElementById('palette-dominant-preview').style.backgroundColor = color.hex;
        document.getElementById('palette-dominant-hex').value = color.hex;
        document.getElementById('palette-dominant-rgb').value = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
    },

    copyValue(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            navigator.clipboard.writeText(input.value).then(() => {
                // Brief visual feedback
                input.classList.add('ring-2', 'ring-[#0d544c]');
                setTimeout(() => input.classList.remove('ring-2', 'ring-[#0d544c]'), 300);
            });
        }
    },

    copyColor(color) {
        navigator.clipboard.writeText(color).then(() => {
            alert(`Đã copy: ${color}`);
        });
    },

    clear() {
        this.imageData = null;
        this.currentColors = null;
        document.getElementById('palette-image').src = '';
        document.getElementById('palette-image-container').classList.add('hidden');
        document.getElementById('palette-dropzone').classList.remove('hidden');
        document.getElementById('palette-clear-btn').classList.add('hidden');
        document.getElementById('palette-dominant-section').classList.add('hidden');
        document.getElementById('palette-grid-section').classList.add('hidden');
        document.getElementById('palette-circles').innerHTML = '';
        document.getElementById('palette-input').value = '';
    }
};

// Initialize palette extractor
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => PaletteExtractor.init(), 100);
});


// ==========================================
// DATE CALCULATOR (j2team style)
// ==========================================
const DateCalculator = {
    currentMode: 'difference',
    resultText: '',

    setMode(mode) {
        this.currentMode = mode;
        
        // Update mode buttons - pill style
        const modes = ['countdown', 'difference', 'age'];
        modes.forEach(m => {
            const btn = document.getElementById(`datecalc-mode-${m === 'difference' ? 'diff' : m}`);
            if (btn) {
                if (m === mode) {
                    btn.classList.add('bg-[#0d544c]', 'text-white');
                    btn.classList.remove('text-gray-600', 'dark:text-gray-400');
                } else {
                    btn.classList.remove('bg-[#0d544c]', 'text-white');
                    btn.classList.add('text-gray-600', 'dark:text-gray-400');
                }
            }
        });

        // Show/hide panels
        document.getElementById('datecalc-countdown-panel')?.classList.toggle('hidden', mode !== 'countdown');
        document.getElementById('datecalc-diff-panel')?.classList.toggle('hidden', mode !== 'difference');
        document.getElementById('datecalc-age-panel')?.classList.toggle('hidden', mode !== 'age');

        // Hide results when switching modes
        document.getElementById('datecalc-results').classList.add('hidden');
    },

    reset() {
        if (this.currentMode === 'countdown') {
            document.getElementById('datecalc-event-name').value = '';
            document.getElementById('datecalc-event-date').value = '';
            document.getElementById('datecalc-event-time').value = '12:00';
        } else if (this.currentMode === 'difference') {
            document.getElementById('datecalc-start').value = '';
            document.getElementById('datecalc-end').value = '';
        } else if (this.currentMode === 'age') {
            document.getElementById('datecalc-birthday').value = '';
            document.getElementById('datecalc-birthtime').value = '';
        }
        document.getElementById('datecalc-results').classList.add('hidden');
    },

    calculate() {
        switch (this.currentMode) {
            case 'countdown':
                this.calculateCountdown();
                break;
            case 'difference':
                this.calculateDifference();
                break;
            case 'age':
                this.calculateAge();
                break;
        }
    },

    calculateCountdown() {
        const eventName = document.getElementById('datecalc-event-name').value || 'Sự kiện';
        const eventDateStr = document.getElementById('datecalc-event-date').value;
        const eventTimeStr = document.getElementById('datecalc-event-time').value || '12:00';
        
        if (!eventDateStr) {
            document.getElementById('datecalc-results').classList.add('hidden');
            return;
        }

        const eventDate = new Date(`${eventDateStr}T${eventTimeStr}`);
        const now = new Date();
        const diffTime = eventDate - now;
        const isPast = diffTime < 0;
        const absDiff = Math.abs(diffTime);

        const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);

        const resultsEl = document.getElementById('datecalc-results');
        const titleEl = document.getElementById('datecalc-result-title');
        const contentEl = document.getElementById('datecalc-result-content');

        titleEl.textContent = isPast ? 'Đã Qua' : 'Đếm Ngược';
        const statusText = isPast ? 'đã trôi qua kể từ' : 'còn lại đến';
        this.resultText = `${days} ngày, ${hours} giờ, ${minutes} phút ${statusText} "${eventName}"`;

        contentEl.innerHTML = `
            <div class="grid grid-cols-4 gap-4 mb-6">
                <div class="text-center p-4 bg-[#0d544c]/10 dark:bg-[#0d544c]/20 rounded-xl">
                    <div class="text-4xl font-bold text-[#0d544c] dark:text-[#4ade80]">${days}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">ngày</div>
                </div>
                <div class="text-center p-4 bg-[#0d544c]/10 dark:bg-[#0d544c]/20 rounded-xl">
                    <div class="text-4xl font-bold text-[#0d544c] dark:text-[#4ade80]">${hours}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">giờ</div>
                </div>
                <div class="text-center p-4 bg-[#0d544c]/10 dark:bg-[#0d544c]/20 rounded-xl">
                    <div class="text-4xl font-bold text-[#0d544c] dark:text-[#4ade80]">${minutes}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">phút</div>
                </div>
                <div class="text-center p-4 bg-[#0d544c]/10 dark:bg-[#0d544c]/20 rounded-xl">
                    <div class="text-4xl font-bold text-[#0d544c] dark:text-[#4ade80]">${seconds}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">giây</div>
                </div>
            </div>
            <p class="text-center text-gray-600 dark:text-gray-400">
                ${isPast ? '⏰' : '🎯'} <strong>${days}</strong> ngày, <strong>${hours}</strong> giờ, <strong>${minutes}</strong> phút ${statusText} "<strong>${eventName}</strong>"
            </p>
        `;
        resultsEl.classList.remove('hidden');
    },

    calculateDifference() {
        const startStr = document.getElementById('datecalc-start').value;
        const endStr = document.getElementById('datecalc-end').value;
        
        if (!startStr || !endStr) {
            document.getElementById('datecalc-results').classList.add('hidden');
            return;
        }

        let start = new Date(startStr);
        let end = new Date(endStr);
        
        // Swap if end < start
        if (end < start) [start, end] = [end, start];
        
        // Calculate exact years, months, days
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        if (days < 0) {
            months--;
            const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
            days += lastMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        const diffTime = Math.abs(end - start);
        const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const totalWeeks = Math.floor(totalDays / 7);
        const totalMonths = years * 12 + months;
        
        // Calculate working days (exclude weekends)
        let workingDays = 0;
        const tempDate = new Date(start);
        while (tempDate <= end) {
            const dayOfWeek = tempDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
            tempDate.setDate(tempDate.getDate() + 1);
        }

        const resultsEl = document.getElementById('datecalc-results');
        const titleEl = document.getElementById('datecalc-result-title');
        const contentEl = document.getElementById('datecalc-result-content');

        titleEl.textContent = 'Khoảng Cách';
        this.resultText = `${years} năm, ${months} tháng, ${days} ngày (${totalDays.toLocaleString()} ngày)`;

        contentEl.innerHTML = `
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="text-center p-6 bg-[#0d544c]/10 dark:bg-[#0d544c]/20 rounded-xl">
                    <div class="text-5xl font-bold text-[#0d544c] dark:text-[#4ade80]">${years}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">năm</div>
                </div>
                <div class="text-center p-6 bg-[#0d544c]/10 dark:bg-[#0d544c]/20 rounded-xl">
                    <div class="text-5xl font-bold text-[#0d544c] dark:text-[#4ade80]">${months}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">tháng</div>
                </div>
                <div class="text-center p-6 bg-[#0d544c]/10 dark:bg-[#0d544c]/20 rounded-xl">
                    <div class="text-5xl font-bold text-[#0d544c] dark:text-[#4ade80]">${days}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">ngày</div>
                </div>
            </div>
            <div class="grid grid-cols-5 gap-3">
                <div class="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <div class="text-xl font-bold text-gray-800 dark:text-white">${totalDays.toLocaleString()}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Tổng Số Ngày</div>
                </div>
                <div class="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <div class="text-xl font-bold text-gray-800 dark:text-white">${totalWeeks.toLocaleString()}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Tổng Số Tuần</div>
                </div>
                <div class="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <div class="text-xl font-bold text-gray-800 dark:text-white">${totalMonths.toLocaleString()}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Tổng Số Tháng</div>
                </div>
                <div class="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <div class="text-xl font-bold text-gray-800 dark:text-white">${years}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Tổng Số Năm</div>
                </div>
                <div class="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <div class="text-xl font-bold text-gray-800 dark:text-white">${workingDays.toLocaleString()}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Ngày Làm Việc</div>
                </div>
            </div>
        `;
        resultsEl.classList.remove('hidden');
    },

    calculateAge() {
        const birthdayStr = document.getElementById('datecalc-birthday').value;
        const birthtimeStr = document.getElementById('datecalc-birthtime')?.value;
        
        if (!birthdayStr) {
            document.getElementById('datecalc-results').classList.add('hidden');
            return;
        }

        let birthday;
        if (birthtimeStr) {
            birthday = new Date(`${birthdayStr}T${birthtimeStr}`);
        } else {
            birthday = new Date(birthdayStr);
        }
        
        const today = new Date();
        
        // Calculate exact age
        let years = today.getFullYear() - birthday.getFullYear();
        let months = today.getMonth() - birthday.getMonth();
        let days = today.getDate() - birthday.getDate();

        if (days < 0) {
            months--;
            const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += lastMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        // Calculate totals
        const diffTime = Math.abs(today - birthday);
        const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const totalWeeks = Math.floor(totalDays / 7);
        const totalMonths = years * 12 + months;
        const totalHours = Math.floor(diffTime / (1000 * 60 * 60));

        // Calculate next birthday
        const nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        if (nextBirthday <= today) {
            nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
        }
        const daysUntilBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));

        const resultsEl = document.getElementById('datecalc-results');
        const titleEl = document.getElementById('datecalc-result-title');
        const contentEl = document.getElementById('datecalc-result-content');

        titleEl.textContent = 'Tuổi Của Bạn';
        this.resultText = `${years} tuổi (${years} năm, ${months} tháng, ${days} ngày)`;

        contentEl.innerHTML = `
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="text-center p-6 bg-[#0d544c]/10 dark:bg-[#0d544c]/20 rounded-xl">
                    <div class="text-5xl font-bold text-[#0d544c] dark:text-[#4ade80]">${years}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">năm</div>
                </div>
                <div class="text-center p-6 bg-[#0d544c]/10 dark:bg-[#0d544c]/20 rounded-xl">
                    <div class="text-5xl font-bold text-[#0d544c] dark:text-[#4ade80]">${months}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">tháng</div>
                </div>
                <div class="text-center p-6 bg-[#0d544c]/10 dark:bg-[#0d544c]/20 rounded-xl">
                    <div class="text-5xl font-bold text-[#0d544c] dark:text-[#4ade80]">${days}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">ngày</div>
                </div>
            </div>
            <div class="grid grid-cols-5 gap-3 mb-6">
                <div class="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <div class="text-xl font-bold text-gray-800 dark:text-white">${totalDays.toLocaleString()}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Tổng Số Ngày</div>
                </div>
                <div class="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <div class="text-xl font-bold text-gray-800 dark:text-white">${totalWeeks.toLocaleString()}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Tổng Số Tuần</div>
                </div>
                <div class="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <div class="text-xl font-bold text-gray-800 dark:text-white">${totalMonths.toLocaleString()}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Tổng Số Tháng</div>
                </div>
                <div class="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <div class="text-xl font-bold text-gray-800 dark:text-white">${years}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Tổng Số Năm</div>
                </div>
                <div class="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <div class="text-xl font-bold text-gray-800 dark:text-white">${totalHours.toLocaleString()}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Tổng Số Giờ</div>
                </div>
            </div>
            <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <p class="text-yellow-800 dark:text-yellow-200">
                    🎂 Còn <strong>${daysUntilBirthday}</strong> ngày nữa đến sinh nhật tiếp theo!
                </p>
            </div>
        `;
        resultsEl.classList.remove('hidden');
    },

    copyResult() {
        if (this.resultText) {
            navigator.clipboard.writeText(this.resultText).then(() => {
                alert('Đã sao chép kết quả!');
            });
        }
    }
};


// ==========================================
// QR CODE READER
// ==========================================
const QRReader = {
    currentMode: 'camera',
    videoStream: null,
    scanning: false,
    scanHistory: [],
    lastResult: '',

    setMode(mode) {
        this.currentMode = mode;
        this.stopCamera();
        
        // Update mode buttons
        const cameraBtn = document.getElementById('qrreader-mode-camera');
        const fileBtn = document.getElementById('qrreader-mode-file');
        
        if (mode === 'camera') {
            cameraBtn.classList.add('border-[#0d544c]', 'bg-[#0d544c]', 'text-white');
            cameraBtn.classList.remove('border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
            fileBtn.classList.remove('border-[#0d544c]', 'bg-[#0d544c]', 'text-white');
            fileBtn.classList.add('border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
        } else {
            fileBtn.classList.add('border-[#0d544c]', 'bg-[#0d544c]', 'text-white');
            fileBtn.classList.remove('border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
            cameraBtn.classList.remove('border-[#0d544c]', 'bg-[#0d544c]', 'text-white');
            cameraBtn.classList.add('border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
        }

        // Show/hide panels
        document.getElementById('qrreader-camera-panel').classList.toggle('hidden', mode !== 'camera');
        document.getElementById('qrreader-file-panel').classList.toggle('hidden', mode !== 'file');
    },

    async startCamera() {
        try {
            const video = document.getElementById('qrreader-video');
            const placeholder = document.getElementById('qrreader-camera-placeholder');
            const startBtn = document.getElementById('qrreader-start-btn');
            const stopBtn = document.getElementById('qrreader-stop-btn');

            this.videoStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            video.srcObject = this.videoStream;
            video.setAttribute('playsinline', true);
            await video.play();

            video.classList.remove('hidden');
            placeholder.classList.add('hidden');
            startBtn.classList.add('hidden');
            stopBtn.classList.remove('hidden');

            this.scanning = true;
            this.scanFrame();
        } catch (err) {
            console.error('Camera error:', err);
            alert('Không thể truy cập camera. Vui lòng cho phép quyền truy cập camera.');
        }
    },

    stopCamera() {
        this.scanning = false;
        const video = document.getElementById('qrreader-video');
        const placeholder = document.getElementById('qrreader-camera-placeholder');
        const startBtn = document.getElementById('qrreader-start-btn');
        const stopBtn = document.getElementById('qrreader-stop-btn');

        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }

        if (video) {
            video.srcObject = null;
            video.classList.add('hidden');
        }
        if (placeholder) placeholder.classList.remove('hidden');
        if (startBtn) startBtn.classList.remove('hidden');
        if (stopBtn) stopBtn.classList.add('hidden');
    },

    scanFrame() {
        if (!this.scanning) return;

        const video = document.getElementById('qrreader-video');
        const canvas = document.getElementById('qrreader-canvas');
        const ctx = canvas.getContext('2d');

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert'
            });

            if (code && code.data !== this.lastResult) {
                this.lastResult = code.data;
                this.showResult(code.data);
            }
        }

        requestAnimationFrame(() => this.scanFrame());
    },

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('border-[#0d544c]', 'bg-[#0d544c]/5');
    },

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('border-[#0d544c]', 'bg-[#0d544c]/5');
    },

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('border-[#0d544c]', 'bg-[#0d544c]/5');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            this.handleFile(file);
        }
    },

    handleFile(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Show preview
                document.getElementById('qrreader-preview-img').src = e.target.result;
                document.getElementById('qrreader-image-preview').classList.remove('hidden');

                // Scan QR from image
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'attemptBoth'
                });

                if (code) {
                    this.showResult(code.data);
                } else {
                    this.showNoResult();
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    showResult(data) {
        const emptyEl = document.getElementById('qrreader-result-empty');
        const contentEl = document.getElementById('qrreader-result-content');
        const valueEl = document.getElementById('qrreader-result-value');
        const typeEl = document.getElementById('qrreader-result-type');
        const typeIconEl = document.getElementById('qrreader-result-type-icon');
        const openLinkEl = document.getElementById('qrreader-open-link');

        // Detect type
        let type = 'Văn bản';
        let icon = '📝';
        let isUrl = false;

        if (data.match(/^https?:\/\//i)) {
            type = 'URL';
            icon = '🔗';
            isUrl = true;
        } else if (data.match(/^mailto:/i)) {
            type = 'Email';
            icon = '✉️';
            isUrl = true;
        } else if (data.match(/^tel:/i)) {
            type = 'Điện thoại';
            icon = '📞';
            isUrl = true;
        } else if (data.match(/^sms:/i)) {
            type = 'Tin nhắn';
            icon = '💬';
        } else if (data.match(/^WIFI:/i)) {
            type = 'WiFi';
            icon = '📶';
        } else if (data.match(/^BEGIN:VCARD/i)) {
            type = 'Danh thiếp';
            icon = '👤';
        } else if (data.match(/^BEGIN:VEVENT/i)) {
            type = 'Sự kiện';
            icon = '📅';
        }

        emptyEl.classList.add('hidden');
        contentEl.classList.remove('hidden');
        valueEl.textContent = data;
        typeEl.textContent = type;
        typeIconEl.textContent = icon;

        if (isUrl) {
            openLinkEl.href = data;
            openLinkEl.classList.remove('hidden');
        } else {
            openLinkEl.classList.add('hidden');
        }

        // Add to history
        this.addToHistory(data, type, icon);
        this.lastResult = data;
    },

    showNoResult() {
        document.getElementById('qrreader-result-empty').classList.remove('hidden');
        document.getElementById('qrreader-result-content').classList.add('hidden');
    },

    addToHistory(data, type, icon) {
        // Avoid duplicates
        if (this.scanHistory.some(h => h.data === data)) return;

        this.scanHistory.unshift({ data, type, icon, time: new Date() });
        if (this.scanHistory.length > 10) this.scanHistory.pop();

        this.renderHistory();
    },

    renderHistory() {
        const historyEl = document.getElementById('qrreader-history');
        const listEl = document.getElementById('qrreader-history-list');

        if (this.scanHistory.length <= 1) {
            historyEl.classList.add('hidden');
            return;
        }

        historyEl.classList.remove('hidden');
        listEl.innerHTML = this.scanHistory.slice(1).map((h, i) => `
            <div class="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                onclick="QRReader.selectHistory(${i + 1})">
                <span>${h.icon}</span>
                <span class="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">${h.data}</span>
            </div>
        `).join('');
    },

    selectHistory(index) {
        const item = this.scanHistory[index];
        if (item) {
            this.showResult(item.data);
        }
    },

    copyResult() {
        const value = document.getElementById('qrreader-result-value').textContent;
        if (value) {
            navigator.clipboard.writeText(value).then(() => {
                alert('Đã sao chép!');
            });
        }
    }
};

// Handle paste for QR Reader
document.addEventListener('paste', (e) => {
    if (QRReader.currentMode === 'file') {
        const items = e.clipboardData?.items;
        if (items) {
            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    QRReader.handleFile(file);
                    break;
                }
            }
        }
    }
});


// ==========================================
// PERCENTAGE CALCULATOR
// ==========================================
const PercentCalc = {
    // Calculator 1: X% của Y là bao nhiêu?
    calc1() {
        const x = parseFloat(document.getElementById('percent-calc1-x').value);
        const y = parseFloat(document.getElementById('percent-calc1-y').value);
        const resultEl = document.getElementById('percent-result1');
        
        if (!isNaN(x) && !isNaN(y)) {
            const result = (x / 100) * y;
            resultEl.textContent = this.formatNumber(result);
        } else {
            resultEl.textContent = '—';
        }
    },

    clear1() {
        document.getElementById('percent-calc1-x').value = '';
        document.getElementById('percent-calc1-y').value = '';
        document.getElementById('percent-result1').textContent = '—';
    },

    // Calculator 2: X là bao nhiêu phần trăm của Y?
    calc2() {
        const x = parseFloat(document.getElementById('percent-calc2-x').value);
        const y = parseFloat(document.getElementById('percent-calc2-y').value);
        const resultEl = document.getElementById('percent-result2');
        
        if (!isNaN(x) && !isNaN(y) && y !== 0) {
            const result = (x / y) * 100;
            resultEl.textContent = this.formatNumber(result) + '%';
        } else {
            resultEl.textContent = '—';
        }
    },

    clear2() {
        document.getElementById('percent-calc2-x').value = '';
        document.getElementById('percent-calc2-y').value = '';
        document.getElementById('percent-result2').textContent = '—';
    },

    // Calculator 3: X là Y% của số nào?
    calc3() {
        const x = parseFloat(document.getElementById('percent-calc3-x').value);
        const y = parseFloat(document.getElementById('percent-calc3-y').value);
        const resultEl = document.getElementById('percent-result3');
        
        if (!isNaN(x) && !isNaN(y) && y !== 0) {
            const result = (x * 100) / y;
            resultEl.textContent = this.formatNumber(result);
        } else {
            resultEl.textContent = '—';
        }
    },

    clear3() {
        document.getElementById('percent-calc3-x').value = '';
        document.getElementById('percent-calc3-y').value = '';
        document.getElementById('percent-result3').textContent = '—';
    },

    // Calculator 4: Phần trăm tăng/giảm
    calc4() {
        const from = parseFloat(document.getElementById('percent-calc4-from').value);
        const to = parseFloat(document.getElementById('percent-calc4-to').value);
        const resultEl = document.getElementById('percent-result4');
        
        if (!isNaN(from) && !isNaN(to) && from !== 0) {
            const change = ((to - from) / Math.abs(from)) * 100;
            const sign = change >= 0 ? '+' : '';
            resultEl.textContent = sign + this.formatNumber(change) + '%';
            
            // Color based on increase/decrease
            if (change > 0) {
                resultEl.classList.remove('text-red-500');
                resultEl.classList.add('text-[#0d544c]', 'dark:text-[#4ade80]');
            } else if (change < 0) {
                resultEl.classList.remove('text-[#0d544c]', 'dark:text-[#4ade80]');
                resultEl.classList.add('text-red-500');
            }
        } else {
            resultEl.textContent = '—';
            resultEl.classList.remove('text-red-500');
            resultEl.classList.add('text-[#0d544c]', 'dark:text-[#4ade80]');
        }
    },

    clear4() {
        document.getElementById('percent-calc4-from').value = '';
        document.getElementById('percent-calc4-to').value = '';
        const resultEl = document.getElementById('percent-result4');
        resultEl.textContent = '—';
        resultEl.classList.remove('text-red-500');
        resultEl.classList.add('text-[#0d544c]', 'dark:text-[#4ade80]');
    },

    clearAll() {
        this.clear1();
        this.clear2();
        this.clear3();
        this.clear4();
    },

    formatNumber(num) {
        // Round to max 4 decimal places and remove trailing zeros
        const rounded = Math.round(num * 10000) / 10000;
        return rounded.toLocaleString('vi-VN', { maximumFractionDigits: 4 });
    }
};

// ==========================================
// TEXT DIFF - So sánh văn bản (LCS Algorithm)
// ==========================================
const TextDiff = {
    getMode() {
        return document.querySelector('input[name="diffMode"]:checked')?.value || 'line';
    },

    // LCS (Longest Common Subsequence) Algorithm
    lcs(a, b) {
        const m = a.length;
        const n = b.length;
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (a[i - 1] === b[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }
        return dp;
    },

    // Backtrack to find diff
    backtrack(dp, a, b, i, j) {
        const result = [];
        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
                result.unshift({ type: 'unchanged', value: a[i - 1] });
                i--; j--;
            } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
                result.unshift({ type: 'added', value: b[j - 1] });
                j--;
            } else if (i > 0) {
                result.unshift({ type: 'removed', value: a[i - 1] });
                i--;
            }
        }
        return result;
    },

    // Split text based on mode
    splitText(text, mode) {
        switch (mode) {
            case 'char': return text.split('');
            case 'word': return text.split(/(\s+)/).filter(s => s);
            case 'line': default: return text.split('\n');
        }
    },

    // Main diff function
    diff(oldText, newText, mode) {
        const oldParts = this.splitText(oldText, mode);
        const newParts = this.splitText(newText, mode);
        const dp = this.lcs(oldParts, newParts);
        return this.backtrack(dp, oldParts, newParts, oldParts.length, newParts.length);
    },

    compare() {
        const oldText = document.getElementById('diff-old-text').value;
        const newText = document.getElementById('diff-new-text').value;
        const mode = this.getMode();

        if (!oldText && !newText) {
            alert('Vui lòng nhập văn bản để so sánh');
            return;
        }

        const diffs = this.diff(oldText, newText, mode);
        this.renderResults(diffs, mode);
    },

    renderResults(diffs, mode) {
        const resultsEl = document.getElementById('diff-results');
        const outputEl = document.getElementById('diff-output');
        
        let added = 0, removed = 0, unchanged = 0;
        let html = '';

        diffs.forEach(d => {
            const escapedValue = this.escapeHtml(d.value);
            const displayValue = mode === 'line' ? escapedValue + '\n' : escapedValue;

            switch (d.type) {
                case 'added':
                    html += `<span class="bg-green-500/30 text-green-600 dark:text-green-400">${displayValue}</span>`;
                    added++;
                    break;
                case 'removed':
                    html += `<span class="bg-red-500/30 text-red-600 dark:text-red-400 line-through">${displayValue}</span>`;
                    removed++;
                    break;
                default:
                    html += `<span class="text-gray-700 dark:text-gray-300">${displayValue}</span>`;
                    unchanged++;
            }
        });

        document.getElementById('diff-stat-added').textContent = added;
        document.getElementById('diff-stat-removed').textContent = removed;
        document.getElementById('diff-stat-modified').textContent = Math.min(added, removed);
        document.getElementById('diff-stat-unchanged').textContent = unchanged;

        outputEl.innerHTML = html || '<span class="text-gray-500">Không có sự khác biệt</span>';
        resultsEl.classList.remove('hidden');
        resultsEl.scrollIntoView({ behavior: 'smooth' });
    },

    merge() {
        const oldText = document.getElementById('diff-old-text').value;
        const newText = document.getElementById('diff-new-text').value;
        const mode = this.getMode();

        if (!oldText && !newText) {
            alert('Vui lòng nhập văn bản để hợp nhất');
            return;
        }

        const diffs = this.diff(oldText, newText, mode);
        const separator = mode === 'line' ? '\n' : '';
        
        // Merge: keep unchanged + added (remove the removed parts)
        const merged = diffs
            .filter(d => d.type !== 'removed')
            .map(d => d.value)
            .join(separator);

        document.getElementById('diff-new-text').value = merged;
        alert('Đã hợp nhất! Kết quả được đặt vào ô "Văn bản mới"');
    },

    clear() {
        document.getElementById('diff-old-text').value = '';
        document.getElementById('diff-new-text').value = '';
        document.getElementById('diff-results').classList.add('hidden');
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};


// ==========================================
// FANCY TEXT - Chữ đặc biệt Unicode
// ==========================================
const FancyText = {
    mode: 'encode',
    
    // Unicode character maps
    styles: {
        'Bold': { name: '𝐁𝐨𝐥𝐝', map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', to: '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗' },
        'Italic': { name: '𝐼𝑡𝑎𝑙𝑖𝑐', map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', to: '𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧' },
        'Bold Italic': { name: '𝑩𝒐𝒍𝒅 𝑰𝒕𝒂𝒍𝒊𝒄', map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', to: '𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛' },
        'Script': { name: '𝒮𝒸𝓇𝒾𝓅𝓉', map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', to: '𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏' },
        'Bold Script': { name: '𝓑𝓸𝓵𝓭 𝓢𝓬𝓻𝓲𝓹𝓽', map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', to: '𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃' },
        'Fraktur': { name: '𝔉𝔯𝔞𝔨𝔱𝔲𝔯', map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', to: '𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷' },
        'Double-struck': { name: '𝔻𝕠𝕦𝕓𝕝𝕖', map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', to: '𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡' },
        'Sans-serif': { name: '𝖲𝖺𝗇𝗌', map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', to: '𝖠𝖡𝖢𝖣𝖤𝖥𝖦𝖧𝖨𝖩𝖪𝖫𝖬𝖭𝖮𝖯𝖰𝖱𝖲𝖳𝖴𝖵𝖶𝖷𝖸𝖹𝖺𝖻𝖼𝖽𝖾𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫' },
        'Sans Bold': { name: '𝗦𝗮𝗻𝘀 𝗕𝗼𝗹𝗱', map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', to: '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵' },
        'Sans Italic': { name: '𝘚𝘢𝘯𝘴 𝘐𝘵𝘢𝘭𝘪𝘤', map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', to: '𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻' },
        'Monospace': { name: '𝙼𝚘𝚗𝚘', map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', to: '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿' },
        'Circled': { name: 'Ⓒⓘⓡⓒⓛⓔⓓ', map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', to: 'ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ⓪①②③④⑤⑥⑦⑧⑨' },
        'Squared': { name: '🅂🅀🅄🄰🅁🄴🄳', map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', to: '🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉' },
        'Negative Squared': { name: '🅽🅴🅶 🆂🆀', map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', to: '🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉' },
        'Fullwidth': { name: 'Ｆｕｌｌｗｉｄｔｈ', map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', to: 'ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ０１２３４５６７８９' },
        'Small Caps': { name: 'Sᴍᴀʟʟ Cᴀᴘs', map: 'abcdefghijklmnopqrstuvwxyz', to: 'ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ' },
        'Superscript': { name: 'ˢᵘᵖᵉʳˢᶜʳⁱᵖᵗ', map: 'abcdefghijklmnoprstuvwxyz0123456789', to: 'ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖʳˢᵗᵘᵛʷˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹' },
        'Subscript': { name: 'ₛᵤᵦₛ꜀ᵣᵢₚₜ', map: 'aehijklmnoprstuvx0123456789', to: 'ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ₀₁₂₃₄₅₆₇₈₉' },
        'Upside Down': { name: 'uʍop ǝpᴉsd∩', map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', to: '∀ꓭƆꓷƎℲ⅁HIſꓘ⅂WNOԀꝹꓤSꓕꓵΛMX⅄Zɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz' },
    },

    setMode(mode) {
        this.mode = mode;
        const encodeBtn = document.getElementById('fancy-mode-encode');
        const decodeBtn = document.getElementById('fancy-mode-decode');
        const encodeResults = document.getElementById('fancy-encode-results');
        const decodeResults = document.getElementById('fancy-decode-results');

        if (mode === 'encode') {
            encodeBtn.classList.add('bg-[#0d544c]', 'text-white');
            encodeBtn.classList.remove('border', 'border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
            decodeBtn.classList.remove('bg-[#0d544c]', 'text-white');
            decodeBtn.classList.add('border', 'border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
            encodeResults.classList.remove('hidden');
            decodeResults.classList.add('hidden');
        } else {
            decodeBtn.classList.add('bg-[#0d544c]', 'text-white');
            decodeBtn.classList.remove('border', 'border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
            encodeBtn.classList.remove('bg-[#0d544c]', 'text-white');
            encodeBtn.classList.add('border', 'border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
            encodeResults.classList.add('hidden');
            decodeResults.classList.remove('hidden');
        }
        this.convert();
    },

    convert() {
        const input = document.getElementById('fancy-input').value;
        if (this.mode === 'encode') {
            this.renderEncodeResults(input);
        } else {
            this.renderDecodeResult(input);
        }
    },

    encode(text, style) {
        const s = this.styles[style];
        if (!s) return text;
        
        let result = '';
        for (const char of text) {
            const idx = s.map.indexOf(char);
            if (idx !== -1) {
                // Get character at index from 'to' string
                const toChars = [...s.to];
                result += toChars[idx] || char;
            } else {
                result += char;
            }
        }
        return result;
    },

    decode(text) {
        let result = text;
        
        // Create a comprehensive reverse map
        const reverseMap = new Map();
        
        // Build reverse map from all styles
        for (const style of Object.values(this.styles)) {
            const toChars = [...style.to];
            const mapChars = [...style.map];
            
            for (let i = 0; i < toChars.length; i++) {
                if (toChars[i] && mapChars[i]) {
                    // Only add if not already mapped (first match wins)
                    if (!reverseMap.has(toChars[i])) {
                        reverseMap.set(toChars[i], mapChars[i]);
                    }
                }
            }
        }
        
        // Replace each fancy character with normal character
        let decoded = '';
        for (const char of text) {
            decoded += reverseMap.get(char) || char;
        }
        
        return decoded;
    },

    renderEncodeResults(input) {
        const grid = document.getElementById('fancy-styles-grid');
        if (!input) {
            grid.innerHTML = '<p class="text-gray-500 dark:text-gray-400 col-span-2">Nhập văn bản để xem các kiểu chữ</p>';
            return;
        }

        let html = '';
        for (const [key, style] of Object.entries(this.styles)) {
            const converted = this.encode(input, key);
            html += `
                <div class="glass-card rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer group" onclick="FancyText.copy('${this.escapeAttr(converted)}')">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">${key}</div>
                    <div class="text-lg text-gray-800 dark:text-white break-all">${this.escapeHtml(converted)}</div>
                    <div class="text-xs text-[#0d544c] dark:text-[#4ade80] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">📋 Click để sao chép</div>
                </div>
            `;
        }
        grid.innerHTML = html;
    },

    renderDecodeResult(input) {
        const decoded = this.decode(input);
        document.getElementById('fancy-decoded-text').textContent = decoded || '—';
    },

    copy(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Đã sao chép!');
        });
    },

    copyDecoded() {
        const text = document.getElementById('fancy-decoded-text').textContent;
        if (text && text !== '—') {
            navigator.clipboard.writeText(text).then(() => {
                alert('Đã sao chép!');
            });
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    escapeAttr(text) {
        return text.replace(/'/g, "\\'").replace(/\n/g, '\\n');
    }
};

// Init fancy text grid on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('fancy-styles-grid')) {
        FancyText.renderEncodeResults('');
    }
});
