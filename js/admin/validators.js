// ==========================================
// VALIDATORS.JS - Validate form data
// ==========================================

const Validators = {
    product(data) {
        const errors = [];
        if (!data.name?.trim()) errors.push('Tên sản phẩm không được trống');
        if (!data.price || data.price <= 0) errors.push('Giá phải lớn hơn 0');
        if (!data.category?.trim()) errors.push('Danh mục không được trống');
        return errors;
    },

    resource(data) {
        const errors = [];
        if (!data.title?.trim()) errors.push('Tiêu đề không được trống');
        if (!data.type?.trim()) errors.push('Loại tài nguyên không được trống');
        if (!data.url?.trim()) errors.push('URL không được trống');
        return errors;
    },

    post(data) {
        const errors = [];
        if (!data.title?.trim()) errors.push('Tiêu đề không được trống');
        if (!data.slug?.trim()) errors.push('Slug không được trống');
        if (!data.category?.trim()) errors.push('Danh mục không được trống');
        return errors;
    },

    // Generate slug từ title - Chuẩn tiếng Việt
    slugify(text) {
        if (!text) return '';
        
        // Bảng chuyển đổi tiếng Việt sang không dấu
        const vietnameseMap = {
            'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
            'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
            'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
            'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
            'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
            'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
            'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
            'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
            'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
            'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
            'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
            'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
            'đ': 'd',
            'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
            'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
            'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
            'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
            'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
            'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
            'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
            'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
            'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
            'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
            'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
            'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
            'Đ': 'D'
        };
        
        // Chuyển đổi từng ký tự
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            result += vietnameseMap[char] || char;
        }
        
        // Chuyển thành lowercase và làm sạch
        return result
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '') // Chỉ giữ chữ, số, space, dấu gạch ngang
            .replace(/\s+/g, '-')          // Thay space thành dấu gạch ngang
            .replace(/-+/g, '-')           // Gộp nhiều dấu gạch ngang thành 1
            .replace(/^-+|-+$/g, '');      // Xóa dấu gạch ngang đầu/cuối
    }
};

window.Validators = Validators;
