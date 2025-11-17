/**
 * Loại bỏ dấu tiếng Việt
 */
export const removeVietnameseTones = (str: string): string => {
    if (!str) return '';

    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');

    return str;
};

/**
 * Filter option cho Ant Design Select - không phân biệt hoa/thường và dấu
 */
export const filterSelectOption = (input: string, option: any): boolean => {
    const label = option?.children?.toString() || option?.label?.toString() || '';

    const normalizedInput = removeVietnameseTones(input.toLowerCase());
    const normalizedLabel = removeVietnameseTones(label.toLowerCase());

    return normalizedLabel.includes(normalizedInput);
};
