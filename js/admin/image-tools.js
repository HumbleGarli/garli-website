// ==========================================
// IMAGE-TOOLS.JS - Nén và xử lý ảnh
// Giữ repo nhẹ, Pages load nhanh
// ==========================================

const ImageTools = {
    // Config
    config: {
        maxWidth: 1600,          // Max width px
        maxHeight: 1600,         // Max height px
        quality: 0.8,            // 0.7-0.85 recommended
        maxFileSize: 5 * 1024 * 1024,  // 5MB limit
        outputType: 'image/webp', // webp cho size nhỏ nhất
        fallbackType: 'image/jpeg' // fallback nếu browser không hỗ trợ webp
    },

    // ==========================================
    // VALIDATE FILE
    // ==========================================
    validate(file) {
        const errors = [];
        
        if (!file.type.startsWith('image/')) {
            errors.push('File không phải là ảnh');
        }
        
        if (file.size > this.config.maxFileSize) {
            errors.push(`Ảnh quá lớn (${this.formatSize(file.size)}). Tối đa ${this.formatSize(this.config.maxFileSize)}`);
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            errors.push('Chỉ hỗ trợ JPEG, PNG, WebP, GIF');
        }

        return { valid: errors.length === 0, errors };
    },

    // ==========================================
    // COMPRESS IMAGE - Main function
    // ==========================================
    async compress(file, options = {}) {
        const opts = { ...this.config, ...options };
        
        // Validate first
        const validation = this.validate(file);
        if (!validation.valid) {
            throw new Error(validation.errors.join('. '));
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                const ratio = Math.min(
                    opts.maxWidth / width,
                    opts.maxHeight / height,
                    1 // Don't upscale
                );
                
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);

                canvas.width = width;
                canvas.height = height;

                // Draw with smoothing
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                // Try WebP first, fallback to JPEG
                this.canvasToBlob(canvas, opts)
                    .then(blob => {
                        // Generate new filename with correct extension
                        const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
                        const baseName = file.name.replace(/\.[^.]+$/, '');
                        const newName = `${baseName}.${ext}`;
                        
                        const compressedFile = new File([blob], newName, {
                            type: blob.type,
                            lastModified: Date.now()
                        });

                        resolve({
                            file: compressedFile,
                            originalSize: file.size,
                            compressedSize: compressedFile.size,
                            savings: Math.round((1 - compressedFile.size / file.size) * 100),
                            width,
                            height
                        });
                    })
                    .catch(reject);
            };

            img.onerror = () => reject(new Error('Không thể đọc ảnh'));
            img.src = URL.createObjectURL(file);
        });
    },

    // ==========================================
    // CANVAS TO BLOB - Try WebP, fallback JPEG
    // ==========================================
    canvasToBlob(canvas, opts) {
        return new Promise((resolve, reject) => {
            // Try WebP first
            canvas.toBlob(
                (blob) => {
                    if (blob && blob.size > 0) {
                        resolve(blob);
                    } else {
                        // Fallback to JPEG
                        canvas.toBlob(
                            (jpegBlob) => {
                                if (jpegBlob) {
                                    resolve(jpegBlob);
                                } else {
                                    reject(new Error('Không thể nén ảnh'));
                                }
                            },
                            opts.fallbackType,
                            opts.quality
                        );
                    }
                },
                opts.outputType,
                opts.quality
            );
        });
    },

    // ==========================================
    // COMPRESS FOR THUMBNAIL
    // ==========================================
    async thumbnail(file, maxSize = 400) {
        return this.compress(file, {
            maxWidth: maxSize,
            maxHeight: maxSize,
            quality: 0.7
        });
    },

    // ==========================================
    // PREVIEW - Get data URL for preview
    // ==========================================
    async getPreview(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Không thể đọc file'));
            reader.readAsDataURL(file);
        });
    },

    // ==========================================
    // FORMAT SIZE - Human readable
    // ==========================================
    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    },

    // ==========================================
    // CHECK WEBP SUPPORT
    // ==========================================
    async supportsWebP() {
        if (typeof this._webpSupport !== 'undefined') return this._webpSupport;
        
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        this._webpSupport = canvas.toDataURL('image/webp').startsWith('data:image/webp');
        return this._webpSupport;
    },

    // ==========================================
    // BATCH COMPRESS
    // ==========================================
    async compressBatch(files, options = {}, onProgress = null) {
        const results = [];
        for (let i = 0; i < files.length; i++) {
            try {
                const result = await this.compress(files[i], options);
                results.push({ success: true, ...result });
            } catch (e) {
                results.push({ success: false, error: e.message, file: files[i] });
            }
            if (onProgress) onProgress(i + 1, files.length);
        }
        return results;
    }
};

window.ImageTools = ImageTools;
