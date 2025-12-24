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

    // Generate slug từ title
    slugify(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
};

window.Validators = Validators;
