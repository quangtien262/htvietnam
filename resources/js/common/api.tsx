
const BASE_API_URL = "/aio/api/";
export const API = {
    submenu: `${BASE_API_URL}menu/submenu`,
    menuDashboard: `${BASE_API_URL}menu/dashboard`,

    // all
    loginCustomer: `${BASE_API_URL}customer/login`,

    // data
    deleteData: `${BASE_API_URL}data/delete`,
    deleteDatas: `${BASE_API_URL}data/deletes`,
    addData: `${BASE_API_URL}data/add`,
    updateData: `${BASE_API_URL}data/update`,
    fastEditData: `${BASE_API_URL}data/fast-edit`,
    uploadImages: `${BASE_API_URL}data/upload-images`,
    uploadFiles: `${BASE_API_URL}data/upload-files`,
    deleteImageTmp: `${BASE_API_URL}data/delete-image-tmp`,
    data_sortOrder: `${BASE_API_URL}data/update-sort-order`,

    dataSelect: `${BASE_API_URL}data/data-select`,
    dataKey: `${BASE_API_URL}data/data-key`,

    // aitilen report
    ai_tongLoiNhuan: `${BASE_API_URL}aitilen/report/tong-loi-nhuan`,
    ai_loiNhuanTheoTienPhong: `${BASE_API_URL}aitilen/report/loi-nhuan-theo-tien-phong`,
    ai_loiNhuanTheoDichVu: `${BASE_API_URL}aitilen/report/loi-nhuan-theo-dich-vu`,
    ai_baoCaoThuChi: `${BASE_API_URL}aitilen/report/bao-cao-thu-chi`,
    ai_baoCaoCongNo: `${BASE_API_URL}aitilen/report/bao-cao-cong-no`,
    ai_baoCaoTaiSan: `${BASE_API_URL}aitilen/report/bao-cao-tai-san`,

    // tasks
    taskList: `${BASE_API_URL}task/list`,
    searchTaskList: `${BASE_API_URL}task/list/search`,
    taskKanban: `${BASE_API_URL}task/kanban`,
    searchKanbanList: `${BASE_API_URL}task/kanban/search`,
    taskInfo: `${BASE_API_URL}task/info`,
    taskAdd: `${BASE_API_URL}task/add`,
    addTasksExpress: `${BASE_API_URL}task/add-express`,
    taskUpdate: `${BASE_API_URL}task/update`,
    taskDelete: `${BASE_API_URL}task/delete`,
    taskSortOrder: `${BASE_API_URL}task/sort-order`,
    fastEditTaskColumn: `${BASE_API_URL}task/fast-edit`, // fast edit field of status/priority

    // task status
    editConfigTask: `${BASE_API_URL}task/edit-config`, // add/edit status, priority
    taskStatusAdd: `${BASE_API_URL}task/status/add`,
    taskStatusSortOrder: `${BASE_API_URL}task/status/sort-order`,

    // task checklist
    taskChecklistAdd: `${BASE_API_URL}task/checklist/add`,
    taskChecklist_ChangeStatus: `${BASE_API_URL}task/checklist/change-status`,
    taskChecklistDelete: `${BASE_API_URL}task/checklist/delete`,

    // task comment
    taskCommentAdd: `${BASE_API_URL}task/comment/add`,
    taskCommentDelete: `${BASE_API_URL}task/comment/delete`,
    // taskCommentUpdate: `${BASE_API_URL}task/comment/update`,


    // projects
    projectList: `${BASE_API_URL}project/list`,
    projectAdd: `${BASE_API_URL}project/add`,
    projectUpdate: `${BASE_API_URL}project/update`,
    projectDelete: `${BASE_API_URL}project/delete`,
    projectFastEdit: `${BASE_API_URL}project/fast-edit`,
    projectSearch: `${BASE_API_URL}project/search`,
    project_editConfig: `${BASE_API_URL}project/edit-config`,
    projectAddChecklist: `${BASE_API_URL}project/add-checklist`,
    projectAddComment: `${BASE_API_URL}project/add-comment`,
    projectDeleteComment: `${BASE_API_URL}project/comment/delete`,
    projectGetInfo: `${BASE_API_URL}project/info`,

    // invoice Aitilen
    aitilen_invoiceIndexApi: `${BASE_API_URL}aitilen/invoice/index-api/bds`,
    aitilen_searchInvoice: `${BASE_API_URL}aitilen/invoice/search/bds`,
    aitilen_updateInvoice: `${BASE_API_URL}aitilen/invoice/update`,
    aitilen_changeInvoiceStatus: `${BASE_API_URL}aitilen/invoice/change-status`,
    aitilen_createInvoiceMonth: `${BASE_API_URL}aitilen/invoice/create-invoice-by-month`,
    aitilen_deleteInvoice: `${BASE_API_URL}aitilen/invoice/delete`,
    aitilen_activeCurrentInvoice: `${BASE_API_URL}aitilen/invoice/active-current`,
    aitilen_activeAllInvoice: `${BASE_API_URL}aitilen/invoice/active-all`,
    aitilen_recalculateInvoice: `${BASE_API_URL}aitilen/invoice/recalculate-invoice`,
    aitilen_invoiceStatistics: `${BASE_API_URL}aitilen/invoice/statistics`,
    aitilen_invoiceStatisticsByApartment: `${BASE_API_URL}aitilen/invoice/statistics-by-apartment`,
    aitilen_invoiceByService: `${BASE_API_URL}aitilen/invoice/by-service`,

    // contacts
    contractBDSIndexApi: `${BASE_API_URL}contract/index-api/bds`,
    searchContract: `${BASE_API_URL}contract/search`,
    updateContract: `${BASE_API_URL}contract/update`,
    fastEditContract: `${BASE_API_URL}contract/fast-edit`,
    deleteContract: `${BASE_API_URL}contract/delete`,
    contractStatistics: `${BASE_API_URL}contract/statistics`,
    contractStatisticsByApartment: `${BASE_API_URL}contract/statistics-by-apartment`,
    contractByService: `${BASE_API_URL}contract/by-service`,

    // so quy
    soQuyList: `${BASE_API_URL}aitilen/so-quy/list`,
    soQuyAdd: `${BASE_API_URL}aitilen/so-quy/add`,
    soQuyUpdate: `${BASE_API_URL}aitilen/so-quy/update`,
    soQuyDelete: `${BASE_API_URL}aitilen/so-quy/delete`,
    soQuyTypeList: `${BASE_API_URL}aitilen/so-quy-type/list`,
    soQuyStatusList: `${BASE_API_URL}aitilen/so-quy-status/list`,
    loaiThuList: `${BASE_API_URL}aitilen/loai-thu/list`,
    loaiChiList: `${BASE_API_URL}aitilen/loai-chi/list`,
    chiNhanhList: `${BASE_API_URL}aitilen/chi-nhanh/list`,
    adminUsersList: `${BASE_API_URL}aitilen/admin-users/list`,

    // users
    userList: `${BASE_API_URL}user/list`,
    userAdd: `${BASE_API_URL}user/add`,
    userUpdate: `${BASE_API_URL}user/update`,
    userDelete: `${BASE_API_URL}user/delete`,

    // aitilen
    aitilen_DienNuoc: `${BASE_API_URL}aitilen/service/dien-nuoc`,
    aitilen_SaveDienNuoc: `${BASE_API_URL}aitilen/service/save-dien-nuoc`,
    aitilen_FastEditDienNuoc: `${BASE_API_URL}aitilen/service/fast-edit-dien-nuoc`,
    aitilen_DeleteDienNuoc: `${BASE_API_URL}aitilen/service/delete-dien-nuoc`,
    aitilen_SearchDienNuoc: `${BASE_API_URL}aitilen/service/search-dien-nuoc`,
    CreateDataDienNuocThang: `${BASE_API_URL}aitilen/service/create-data-dien-nuoc-thang`,
    ActiveDataDienNuocThang: `${BASE_API_URL}aitilen/service/active-data-dien-nuoc-thang`,

    // apartment
    aitilen_apartmentList: `${BASE_API_URL}aitilen/apartment/list`,
    aitilen_saveApartment: `${BASE_API_URL}aitilen/apartment/save`,
    aitilen_deleteApartment: `${BASE_API_URL}aitilen/apartment/delete`,
    aitilen_fastEditApartment: `${BASE_API_URL}aitilen/apartment/fast-edit`,
    aitilen_apartmentDetail: `${BASE_API_URL}aitilen/apartment/detail`,
    aitilen_apartmentRooms: `${BASE_API_URL}aitilen/apartment/rooms`,
    aitilen_saveRoom: `${BASE_API_URL}aitilen/room/save`,
    aitilen_deleteRoom: `${BASE_API_URL}aitilen/room/delete`,

    // customer
    customerIndexApi: `${BASE_API_URL}customer/index-api`,
    customerSearch: `${BASE_API_URL}customer/search`,
    customerDetail: `${BASE_API_URL}customer/detail`,
    customerUpdate: `${BASE_API_URL}customer/update`,
    customerFastEdit: `${BASE_API_URL}customer/fast-edit`,
    customerEdit: `${BASE_API_URL}customer/edit`,

    // meeting
    meetingIndexApi: `${BASE_API_URL}meeting/index-api`,
    meetingSearch: `${BASE_API_URL}meeting/search`,
    meetingDetail: `${BASE_API_URL}meeting/detail`,
    meetingUpdate: `${BASE_API_URL}meeting/update`,
    meetingFastEdit: `${BASE_API_URL}meeting/fast-edit`,
    meetingEdit: `${BASE_API_URL}meeting/edit`,
    meetingAddExpress: `${BASE_API_URL}meeting/add-express`,
    meetingDelete: `${BASE_API_URL}meeting/delete`,

    // files
    fileList: `${BASE_API_URL}file/list`,
    fileUpload: `${BASE_API_URL}file/upload`,
    fileDelete: `${BASE_API_URL}file/delete`,
    fileDownload: `${BASE_API_URL}file/download`,
    fileShare: `${BASE_API_URL}file/share`,
    fileShow: `${BASE_API_URL}file/show`,
    editorAll: `${BASE_API_URL}file/editor/all`,
    editorUpload: `${BASE_API_URL}file/editor/upload`,
    folderCreate: `${BASE_API_URL}folder/create`,
    folderOpen: `${BASE_API_URL}folder/open`,

    // Common Settings - Dynamic endpoints
    commonSettingList: (tableName: string) => `${BASE_API_URL}setting/${tableName}/list`,
    commonSettingAdd: (tableName: string) => `${BASE_API_URL}setting/${tableName}/add`,
    commonSettingUpdate: (tableName: string) => `${BASE_API_URL}setting/${tableName}/update`,
    commonSettingDelete: (tableName: string) => `${BASE_API_URL}setting/${tableName}/delete`,
    commonSettingUpdateSortOrder: (tableName: string) => `${BASE_API_URL}setting/${tableName}/update-sort-order`,

    // Menu Management
    menuList: `${BASE_API_URL}menu/list`,
    menuDetail: `${BASE_API_URL}menu/detail`,
    menuAdd: `${BASE_API_URL}menu/add`,
    menuUpdate: `${BASE_API_URL}menu/update`,
    menuDelete: `${BASE_API_URL}menu/delete`,
    menuUpdateSortOrder: `${BASE_API_URL}menu/update-sort-order`,
    menuLanguages: `${BASE_API_URL}menu/languages`,

    // News Management
    newsList: `${BASE_API_URL}news/list`,
    newsDetail: `${BASE_API_URL}news/detail`,
    newsAdd: `${BASE_API_URL}news/add`,
    newsUpdate: `${BASE_API_URL}news/update`,
    newsDelete: `${BASE_API_URL}news/delete`,
    newsLanguages: `${BASE_API_URL}news/languages`,

    // Products Management
    productsList: `${BASE_API_URL}products/list`,
    productsDetail: `${BASE_API_URL}products/detail`,
    productsAdd: `${BASE_API_URL}products/add`,
    productsUpdate: `${BASE_API_URL}products/update`,
    productsDelete: `${BASE_API_URL}products/delete`,
    productsLanguages: `${BASE_API_URL}products/languages`,

    // CongNo (Debt) Management
    congNoList: '/aio/api/cong-no/list',
    congNoDetail: '/aio/api/cong-no/detail',
    congNoAdd: '/aio/api/cong-no/add',
    congNoUpdate: '/aio/api/cong-no/update',
    congNoDelete: '/aio/api/cong-no/delete',
    congNoNhaCungCap: '/aio/api/cong-no/nha-cung-cap',
    congNoUsers: '/aio/api/cong-no/users',
    congNoStatus: '/aio/api/cong-no/status',
    // Advanced features
    congNoPayment: '/aio/api/cong-no/payment',
    congNoPaymentHistory: '/aio/api/cong-no/payment-history',
    congNoStatistics: '/aio/api/cong-no/statistics',
    congNoBulkUpdateStatus: '/aio/api/cong-no/bulk-update-status',
    congNoExport: '/aio/api/cong-no/export',

    // Purchase Management - Supplier
    supplierList: '/purchase/api/supplier/list',
    supplierDetail: '/purchase/api/supplier/detail',
    supplierAdd: '/purchase/api/supplier/add',
    supplierUpdate: '/purchase/api/supplier/update',
    supplierDelete: '/purchase/api/supplier/delete',
    supplierStatistics: '/purchase/api/supplier/statistics',
    supplierPurchaseHistory: '/purchase/api/supplier/purchase-history',
    supplierPaymentHistory: '/purchase/api/supplier/payment-history',

    // Purchase Management - Purchase Order
    purchaseOrderList: '/purchase/api/purchase-order/list',
    purchaseOrderDetail: '/purchase/api/purchase-order/detail',
    purchaseOrderAdd: '/purchase/api/purchase-order/add',
    purchaseOrderUpdate: '/purchase/api/purchase-order/update',
    purchaseOrderDelete: '/purchase/api/purchase-order/delete',
    purchaseOrderUpdateStatus: '/purchase/api/purchase-order/update-status',
    purchaseOrderStatistics: '/purchase/api/purchase-order/statistics',
    purchaseOrderSupplierList: '/purchase/api/purchase-order/supplier-list',
    purchaseOrderStatusList: '/purchase/api/purchase-order/status-list',

    // Stock Receipt APIs
    stockReceiptList: '/purchase/api/stock-receipt/list',
    stockReceiptDetail: '/purchase/api/stock-receipt/detail',
    stockReceiptAdd: '/purchase/api/stock-receipt/add',
    stockReceiptUpdate: '/purchase/api/stock-receipt/update',
    stockReceiptDelete: '/purchase/api/stock-receipt/delete',
    stockReceiptReceiveItems: '/purchase/api/stock-receipt/receive-items',
    stockReceiptUpdateOrderStatus: '/purchase/api/stock-receipt/update-order-status',
    stockReceiptStatistics: '/purchase/api/stock-receipt/statistics',
    stockReceiptPurchaseOrderList: '/purchase/api/stock-receipt/purchase-order-list',

    // Supplier Payment APIs
    supplierPaymentList: '/purchase/api/payment/list',
    supplierPaymentDetail: '/purchase/api/payment/detail',
    supplierPaymentAdd: '/purchase/api/payment/add',
    supplierPaymentUpdate: '/purchase/api/payment/update',
    supplierPaymentDelete: '/purchase/api/payment/delete',
    supplierPaymentBySupplier: '/purchase/api/payment/by-supplier',
    supplierPaymentByOrder: '/purchase/api/payment/by-order',
    supplierPaymentStatistics: '/purchase/api/payment/statistics',
    supplierPaymentSupplierList: '/purchase/api/payment/supplier-list',
    supplierPaymentUnpaidOrders: '/purchase/api/payment/unpaid-orders',

    // Purchase Report APIs
    purchaseReportOverview: '/purchase/api/report/overview',
    purchaseReportBySupplier: '/purchase/api/report/by-supplier',
    purchaseReportByTime: '/purchase/api/report/by-time',
    purchaseReportByStatus: '/purchase/api/report/by-status',
    purchaseReportTopSuppliers: '/purchase/api/report/top-suppliers',
    purchaseReportDebt: '/purchase/api/report/debt',
    purchaseReportByPaymentMethod: '/purchase/api/report/by-payment-method',
    purchaseReportExport: '/purchase/api/report/export',

    // Hàng hóa APIs
    hangHoaList: '/purchase/api/hang-hoa/list',
    hangHoaDetail: '/purchase/api/hang-hoa/detail',
    hangHoaAdd: '/purchase/api/hang-hoa/add',
    hangHoaUpdate: '/purchase/api/hang-hoa/update',
    hangHoaDelete: '/purchase/api/hang-hoa/delete',
    hangHoaActive: '/purchase/api/hang-hoa/active',

    // Loại hàng hóa APIs
    loaiHangHoaList: '/purchase/api/loai-hang-hoa/list',
    loaiHangHoaAdd: '/purchase/api/loai-hang-hoa/add',
    loaiHangHoaUpdate: '/purchase/api/loai-hang-hoa/update',
    loaiHangHoaDelete: '/purchase/api/loai-hang-hoa/delete',

    // ===== QUẢN LÝ NGÂN HÀNG =====
    // Tài khoản ngân hàng
    bankAccountList: '/aio/api/bank/account/list',
    bankAccountAdd: '/aio/api/bank/account/add',
    bankAccountUpdate: '/aio/api/bank/account/update',
    bankAccountDelete: '/aio/api/bank/account/delete',
    bankAccountUpdateSortOrder: '/aio/api/bank/account/update-sort-order',

    // Giao dịch ngân hàng
    bankTransactionList: '/aio/api/bank/transaction/list',
    bankTransactionAdd: '/aio/api/bank/transaction/add',
    bankTransactionUpdate: '/aio/api/bank/transaction/update',
    bankTransactionDelete: '/aio/api/bank/transaction/delete',
    bankTransactionTaiKhoanList: '/aio/api/bank/transaction/tai-khoan-list',

    // Đối soát ngân hàng
    bankReconciliationList: '/aio/api/bank/reconciliation/list',
    bankReconciliationAdd: '/aio/api/bank/reconciliation/add',
    bankReconciliationUpdate: '/aio/api/bank/reconciliation/update',
    bankReconciliationComplete: '/aio/api/bank/reconciliation/complete',

    // ===== HÓA ĐƠN =====
    invoiceList: '/aio/api/invoice/list',
    invoiceDetail: '/aio/api/invoice/detail',
    invoiceAdd: '/aio/api/invoice/add',
    invoiceUpdate: '/aio/api/invoice/update',
    invoiceDelete: '/aio/api/invoice/delete',
    invoiceThanhToan: '/aio/api/invoice/thanh-toan',
    invoiceExport: '/aio/api/invoice/export',

    // ===== DASHBOARD TÀI CHÍNH =====
    erpDashboardOverview: '/aio/api/erp/dashboard/overview',
    erpDashboardCashFlow: '/aio/api/erp/dashboard/cash-flow',
    erpDashboardCongNo: '/aio/api/erp/dashboard/cong-no',
    erpDashboardChart: '/aio/api/erp/dashboard/chart',

};

export default API;
