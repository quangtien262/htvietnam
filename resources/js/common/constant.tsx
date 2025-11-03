export const DATE_FORMAT = "YYYY-MM-DD";
export const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
export const TIME_FORMAT = "HH:mm:ss";
export const DATE_SHOW = "DD/MM/YYYY";
export const DATE_TIME_SHOW = "HH:mm:ss DD/MM/YYYY";

export const CHAM_CONG_DEFAULT = {checkin_h: '08',checkin_m: '30',checkout_h: '17',checkout_m: '30',note: '',type: 1,kpi: 0};

export const TITLE =  {
    tasks: "QUẢN LÝ CÔNG VIỆC",
    projects: "QUẢN LÝ DỰ ÁN",
    all: "CÔNG VIỆC CHUNG",
    sale: "QUẢN LÝ BÁN HÀNG",
    dayphong: "QUẢN LÝ ĐẨY PHÒNG",
 };

export const TYPE_EDIT = [
    { value: "text", label: "text" },
    { value: "number", label: "number" },
    { value: "textarea", label: "textarea" },
    { value: "select", label: "select" },
    { value: "selects", label: "Multiple selects" },
    { value: "selects_normal", label: "Multiple select (Normal)" },
    { value: "selects_table", label: "selects_table" },
    { value: "tiny", label: "tinyMCE" },
    { value: "image", label: "image" },
    { value: "images", label: "images" },
    { value: "image_crop", label: "image & crop" },
    { value: "images_crop", label: "images & crop" },
    { value: "images_no_db", label: "images_no_db" },
    { value: "image_aws", label: "image - AWS" },
    { value: "images_aws", label: "images - AWS" },
    { value: "image_crop_aws", label: "image & crop - AWS" },
    { value: "images_crop_aws", label: "images & crop - AWS" },
    { value: "images_no_db", label: "images_no_db" },
    { value: "video", label: "video" },
    { value: "pdf", label: "pdf" },
    { value: "files", label: "files" },
    { value: "password", label: "password" },
    { value: "encryption", label: "encryption" },
    { value: "date", label: "date" },
    { value: "time", label: "time" },
    { value: "datetime", label: "datetime" },
    { value: "hidden", label: "hidden" },
    { value: "invisible", label: "invisible" },
    { value: "input", label: "input" },
    { value: "block", label: "block" },
    { value: "color", label: "color" },
    { value: "comment", label: "comment" },
    { value: "permission_list", label: "permission_list" },
    { value: "service", label: "service" },
    { value: "review_SEO", label: "review_SEO" },
    { value: "calendar_cham_cong", label: "calendar chấm công" },
    { value: "calendar_lich_hen", label: "calendar lịch hẹn" },
    { value: "tags", label: "tags" },
    { value: "route_link", label: "Auto get link" },
    { value: "cascader", label: "cascader" },
    { value: "cascader_table", label: "cascader_table" }, // data_select: json config: {{"column": {"0": "col_01","1": "col_02"} } } --- Column fai là col kiểu select
    // { value: "cascader_table", label: "Cascader - multiple Table" }, // todo: ....
];

export const MOC_THOI_GIAN = {
    today: 'Hôm nay',
    month: 'Tháng này',
    year: 'Năm nay',

    yesterday: 'Hôm qua',
    lastMonth: 'Tháng trước',
    lastYear: 'Năm trước',

    thisWeek: 'Tuần này',
    '30day': '30 ngày qua',
    all: 'Toàn thời gian',
    lastWeek: 'Tuần trước',
    thisQuarter: 'Quý này',
    '7day': '07 ngày qua',
    lastQuarter: 'Quý trước',
};

export const LOAI_CHUNG_TU = {
    hoa_don: 'Hóa đơn bán lẻ',
    product_khach_tra_hang: 'Khách trả hàng',
    product_tra_hang_ncc: 'Trả hàng NCC',
};

