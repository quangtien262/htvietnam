/**
 * Cấu hình cho các bảng setting
 * Mapping tên bảng database -> tên hiển thị tiếng Việt
 */

export const TABLE_NAME_MAP: Record<string, string> = {
    // Sổ quỹ
    'so_quy_type': 'Loại sổ quỹ',
    'so_quy_status': 'Trạng thái sổ quỹ',

    // Thu chi
    'loai_thu': 'Loại thu',
    'loai_chi': 'Loại chi',

    // Task & Project
    'task_status': 'Trạng thái công việc',
    'task_priority': 'Mức độ ưu tiên',
    'project_status': 'Trạng thái dự án',

    // Hóa đơn & Hợp đồng
    'invoice_status': 'Trạng thái hóa đơn',
    'contract_status': 'Trạng thái hợp đồng',

    // Hàng hóa & Đơn mua hàng
    'loai_hang_hoa': 'Loại hàng hóa',
    'don_vi_hang_hoa': 'Đơn vị hàng hóa',
    'purchase_order_statuses': 'Trạng thái đơn mua hàng',

    // project management
    'pro___project_statuses': 'Trạng thái dự án',
    'pro___project_types': 'Loại công việc',
    'pro___priorities': 'Mức độ ưu tiên',
    'pro___task_statuses': 'Trạng thái công việc',

    // Thêm các bảng setting khác ở đây...


};

/**
 * Lấy tên hiển thị của bảng
 * @param tableName - Tên bảng trong database
 * @returns Tên hiển thị tiếng Việt hoặc tên bảng gốc nếu không tìm thấy
 */
export const getTableDisplayName = (tableName: string): string => {
    return TABLE_NAME_MAP[tableName] || tableName;
};

/**
 * Kiểm tra xem bảng có được cấu hình hay không
 * @param tableName - Tên bảng cần kiểm tra
 * @returns true nếu bảng đã được cấu hình
 */
export const isTableConfigured = (tableName: string): boolean => {
    return tableName in TABLE_NAME_MAP;
};

/**
 * Lấy danh sách tất cả các bảng đã cấu hình
 * @returns Mảng các tên bảng
 */
export const getAllConfiguredTables = (): string[] => {
    return Object.keys(TABLE_NAME_MAP);
};
