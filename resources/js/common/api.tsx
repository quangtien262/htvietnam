
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
    uploadImage: `${BASE_API_URL}data/upload-image`,
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
    getContractInfo: `${BASE_API_URL}contract/info`,

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

    // dau tu (investment costs)
    dauTuList: `${BASE_API_URL}aitilen/dau-tu/list`,
    dauTuAdd: `${BASE_API_URL}aitilen/dau-tu/add`,
    dauTuAddBulk: `${BASE_API_URL}aitilen/dau-tu/add-bulk`,
    dauTuUpdate: `${BASE_API_URL}aitilen/dau-tu/update`,
    dauTuDelete: `${BASE_API_URL}aitilen/dau-tu/delete`,
    dauTuUpdateSortOrder: `${BASE_API_URL}aitilen/dau-tu/update-sort-order`,
    dauTuSelectData: `${BASE_API_URL}aitilen/dau-tu/select-data`,
    dauTuReport: `${BASE_API_URL}aitilen/dau-tu/report`,

    // users
    userList: `${BASE_API_URL}user/list`,
    userAdd: `${BASE_API_URL}user/add`,
    userUpdate: `${BASE_API_URL}user/update`,
    userDelete: `${BASE_API_URL}user/delete`,
    userSelect: `${BASE_API_URL}user/select-data`,

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

    // ===== FILES =====

    // ===== QUẢN LÝ TÀI LIỆU =====
    // Thư mục (Folders)
    documentFolders: '/aio/api/documents/folders',
    documentFolderStore: '/aio/api/documents/folders/store',
    documentFolderUpdate: (id: number) => `/aio/api/documents/folders/update/${id}`,
    documentFolderSortOrder: '/aio/api/documents/folders/sort-order',
    documentFolderShare: (id: number) => `/aio/api/documents/folders/share/${id}`,
    documentFoldersShared: '/aio/api/documents/folders/shared',
    documentFoldersPublic: '/aio/api/documents/folders/public',
    documentFolderDelete: (id: number) => `/aio/api/documents/folders/delete/${id}`,
    documentFolderRestore: (id: number) => `/aio/api/documents/folders/restore/${id}`,
    documentFolderForceDelete: (id: number) => `/aio/api/documents/folders/force-delete/${id}`,

    // Users for sharing
    documentUsers: '/aio/api/documents/users',

    // File
    documentFiles: '/aio/api/documents/files',
    documentFileUpload: '/aio/api/documents/files/upload',
    documentFileDownload: (id: number) => `/aio/api/documents/files/download/${id}`,
    documentFilePreview: (id: number) => `/aio/api/documents/files/preview/${id}`,
    documentFileStar: (id: number) => `/aio/api/documents/files/star/${id}`,
    documentFileUpdate: (id: number) => `/aio/api/documents/files/update/${id}`,
    documentFileMove: (id: number) => `/aio/api/documents/files/move/${id}`,
    documentFileCopy: (id: number) => `/aio/api/documents/files/copy/${id}`,
    documentFileDelete: (id: number) => `/aio/api/documents/files/delete/${id}`,
    documentFileRestore: (id: number) => `/aio/api/documents/files/restore/${id}`,
    documentFileForceDelete: (id: number) => `/aio/api/documents/files/force-delete/${id}`,
    documentFilesStarred: '/aio/api/documents/files/starred',
    documentFilesRecent: '/aio/api/documents/files/recent',
    documentFilesTrash: '/aio/api/documents/files/trash',

    // Phân quyền (Permissions)
    documentPermissions: '/aio/api/documents/permissions',
    documentPermissionShare: '/aio/api/documents/permissions/share',
    documentPermissionUpdate: (id: number) => `/aio/api/documents/permissions/update/${id}`,
    documentPermissionRevoke: (id: number) => `/aio/api/documents/permissions/revoke/${id}`,

    // Share Link
    documentShareLinkCreate: '/aio/api/documents/share-link/create',
    documentShareLinks: '/aio/api/documents/share-link',
    documentShareLinkRevoke: (id: number) => `/aio/api/documents/share-link/revoke/${id}`,

    // Comments (Bình luận)
    documentComments: '/aio/api/documents/comments',
    documentCommentStore: '/aio/api/documents/comments',
    documentCommentUpdate: (id: number) => `/aio/api/documents/comments/update/${id}`,
    documentCommentDelete: (id: number) => `/aio/api/documents/comments/delete/${id}`,
    documentCommentToggleResolve: (id: number) => `/aio/api/documents/comments/toggle-resolve/${id}`,
    documentCommentUnresolvedCount: '/aio/api/documents/comments/unresolved-count',

    // ===== MODULE SPA MANAGEMENT =====
    // Prefix: /aio/api/admin/spa

    // Chi nhánh (Branches)
    spaBranchList: '/aio/api/admin/spa/branches',
    spaBranchDetail: (id: number) => `/aio/api/admin/spa/branches/${id}`,
    spaBranchCreate: '/aio/api/admin/spa/branches',
    spaBranchUpdate: (id: number) => `/aio/api/admin/spa/branches/${id}`,
    spaBranchDelete: (id: number) => `/aio/api/admin/spa/branches/${id}`,

    // Analytics / Dashboard
    spaAnalyticsDashboard: '/aio/api/admin/spa/analytics/dashboard',
    spaAnalyticsRevenue: '/aio/api/admin/spa/analytics/revenue',
    spaAnalyticsServices: '/aio/api/admin/spa/analytics/services',

    // Phòng (Rooms)
    spaRoomList: '/aio/api/admin/spa/rooms',
    spaRoomDetail: (id: number) => `/aio/api/admin/spa/rooms/${id}`,
    spaRoomCreate: '/aio/api/admin/spa/rooms',
    spaRoomUpdate: (id: number) => `/aio/api/admin/spa/rooms/${id}`,
    spaRoomDelete: (id: number) => `/aio/api/admin/spa/rooms/${id}`,
    spaRoomAvailable: '/aio/api/admin/spa/rooms/available',

    // Ca làm việc (Shifts)
    spaShiftCurrent: '/aio/api/admin/spa/ca-lam-viec/current',
    spaShiftOpen: '/aio/api/admin/spa/ca-lam-viec/open',
    spaShiftClose: (id: number) => `/aio/api/admin/spa/ca-lam-viec/${id}/close`,
    spaShiftList: '/aio/api/admin/spa/ca-lam-viec',
    spaShiftDetail: (id: number) => `/aio/api/admin/spa/ca-lam-viec/${id}`,
    spaShiftPrint: (id: number) => `/aio/api/admin/spa/ca-lam-viec/${id}/print`,

    // Dịch vụ (Services)
    spaServiceList: '/aio/api/admin/spa/services',
    spaServiceDetail: (id: number) => `/aio/api/admin/spa/services/${id}`,
    spaServiceCreate: '/aio/api/admin/spa/services',
    spaServiceUpdate: (id: number) => `/aio/api/admin/spa/services/${id}`,
    spaServiceDelete: (id: number) => `/aio/api/admin/spa/services/${id}`,

    // Danh mục dịch vụ (Service Categories)
    spaServiceCategoryList: '/aio/api/admin/spa/service-categories',
    spaServiceCategoryListPost: '/aio/api/admin/spa/service-categories/list',
    spaServiceCategoryDetail: (id: number) => `/aio/api/admin/spa/service-categories/${id}`,
    spaServiceCategoryCreate: '/aio/api/admin/spa/service-categories',
    spaServiceCategoryUpdate: (id: number) => `/aio/api/admin/spa/service-categories/${id}`,
    spaServiceCategoryDelete: (id: number) => `/aio/api/admin/spa/service-categories/${id}`,

    // Gói dịch vụ (Service Packages)
    spaServicePackageList: '/aio/api/admin/spa/service-packages',
    spaServicePackageDetail: (id: number) => `/aio/api/admin/spa/service-packages/${id}`,
    spaServicePackageCreate: '/aio/api/admin/spa/service-packages',
    spaServicePackageUpdate: (id: number) => `/aio/api/admin/spa/service-packages/${id}`,
    spaServicePackageDelete: (id: number) => `/aio/api/admin/spa/service-packages/${id}`,

    // Sản phẩm (Products)
    spaProductList: '/aio/api/admin/spa/products',
    spaProductDetail: (id: number) => `/aio/api/admin/spa/products/${id}`,
    spaProductCreate: '/aio/api/admin/spa/products',
    spaProductUpdate: (id: number) => `/aio/api/admin/spa/products/${id}`,
    spaProductDelete: (id: number) => `/aio/api/admin/spa/products/${id}`,

    // Danh mục sản phẩm (Product Categories)
    spaProductCategoryList: '/aio/api/admin/spa/product-categories',
    spaProductCategoryDetail: (id: number) => `/aio/api/admin/spa/product-categories/${id}`,
    spaProductCategoryCreate: '/aio/api/admin/spa/product-categories',
    spaProductCategoryUpdate: (id: number) => `/aio/api/admin/spa/product-categories/${id}`,
    spaProductCategoryDelete: (id: number) => `/aio/api/admin/spa/product-categories/${id}`,

    // Thương hiệu (Brands)
    spaBrandList: '/aio/api/admin/spa/brands',
    spaBrandDetail: (id: number) => `/aio/api/admin/spa/brands/${id}`,
    spaBrandCreate: '/aio/api/admin/spa/brands',
    spaBrandUpdate: (id: number) => `/aio/api/admin/spa/brands/${id}`,
    spaBrandDelete: (id: number) => `/aio/api/admin/spa/brands/${id}`,

    // Xuất xứ (Origins)
    spaOriginList: '/aio/api/admin/spa/origins',
    spaOriginDetail: (id: number) => `/aio/api/admin/spa/origins/${id}`,
    spaOriginCreate: '/aio/api/admin/spa/origins',
    spaOriginUpdate: (id: number) => `/aio/api/admin/spa/origins/${id}`,
    spaOriginDelete: (id: number) => `/aio/api/admin/spa/origins/${id}`,

    // Đơn vị sản phẩm (Product Units)
    spaProductUnitList: '/spa/product-units',
    spaProductUnitDetail: (id: number) => `/spa/product-units/${id}`,
    spaProductUnitCreate: '/spa/product-units',
    spaProductUnitUpdate: (id: number) => `/spa/product-units/${id}`,
    spaProductUnitDelete: (id: number) => `/spa/product-units/${id}`,

    // Quản lý kho (Inventory)
    spaInventoryList: '/spa/inventory',
    spaInventoryDetail: (id: number) => `/spa/inventory/${id}`,
    spaInventoryCreate: '/spa/inventory',
    spaInventoryUpdate: (id: number) => `/spa/inventory/${id}`,
    spaInventoryDelete: (id: number) => `/spa/inventory/${id}`,
    spaInventoryStockList: '/spa/inventory-stock/list',
    spaInventoryBulkImport: '/spa/inventory/bulk-import',
    spaInventoryImportCsv: '/spa/inventory/import-csv',
    spaInventoryTransactions: (productId: number) => `/spa/inventory/${productId}/transactions`,

    // POS - Bán hàng
    spaPOSInvoiceList: '/aio/api/admin/spa/pos/invoices',
    spaPOSCreateInvoice: '/aio/api/admin/spa/pos/invoices',
    spaPOSGetInvoice: (id: number) => `/aio/api/admin/spa/pos/invoices/${id}`,
    spaPOSProcessPayment: (id: number) => `/aio/api/admin/spa/pos/invoices/${id}/payment`,
    spaPOSCancelInvoice: (id: number) => `/aio/api/admin/spa/pos/invoices/${id}/cancel`,
    spaPOSTodaySales: '/aio/api/admin/spa/pos/today-sales',

    // Hóa đơn (Invoices Management)
    spaInvoiceList: '/aio/api/admin/spa/invoices',
    spaInvoiceDetail: (id: number) => `/aio/api/admin/spa/invoices/${id}`,
    spaInvoiceUpdate: (id: number) => `/aio/api/admin/spa/invoices/${id}`,
    spaInvoiceDelete: (id: number) => `/aio/api/admin/spa/invoices/${id}`,
    spaInvoicePrint: (id: number) => `/aio/api/admin/spa/invoices/${id}/print`,
    spaInvoiceExport: '/aio/api/admin/spa/invoices/export',
    spaInvoicePayDebt: (id: number) => `/aio/api/admin/spa/invoices/${id}/pay-debt`,

    // Thẻ giá trị (Gift Cards)
    spaGiftCardList: '/aio/api/admin/spa/gift-cards',
    spaGiftCardDetail: (id: number) => `/aio/api/admin/spa/gift-cards/${id}`,
    spaGiftCardCreate: '/aio/api/admin/spa/gift-cards',
    spaGiftCardUpdate: (id: number) => `/aio/api/admin/spa/gift-cards/${id}`,
    spaGiftCardDelete: (id: number) => `/aio/api/admin/spa/gift-cards/${id}`,
    spaGiftCardValidateCode: '/aio/api/admin/spa/gift-cards/validate-code',

    // Ví khách hàng (Wallet)
    spaWalletGet: (khachHangId: number) => `/aio/api/admin/spa/wallet/${khachHangId}`,
    spaWalletHistory: (khachHangId: number) => `/aio/api/admin/spa/wallet/${khachHangId}/history`,
    spaWalletDeposit: '/aio/api/admin/spa/wallet/deposit',
    spaWalletWithdraw: '/aio/api/admin/spa/wallet/withdraw',
    spaWalletRefund: '/aio/api/admin/spa/wallet/refund',
    spaWalletApplyCode: '/aio/api/admin/spa/wallet/apply-code',
    spaWalletSetLimits: (khachHangId: number) => `/aio/api/admin/spa/wallet/${khachHangId}/set-limits`,
    spaWalletReportsStats: '/aio/api/admin/spa/wallet/reports/stats',
    spaWalletReportsTopCustomers: '/aio/api/admin/spa/wallet/reports/top-customers',
    spaWalletReportsGiftCardRevenue: '/aio/api/admin/spa/wallet/reports/gift-card-revenue',
    spaWalletReportsTransactions: '/aio/api/admin/spa/wallet/reports/transactions',

    // Voucher
    spaVoucherList: '/aio/api/admin/spa/vouchers',
    spaVoucherListPost: '/aio/api/admin/spa/vouchers/list',
    spaVoucherDetail: (id: number) => `/aio/api/admin/spa/vouchers/${id}`,
    spaVoucherCreate: '/aio/api/admin/spa/vouchers',
    spaVoucherCreateOrUpdate: '/aio/api/admin/spa/vouchers/create-or-update',
    spaVoucherUpdate: (id: number) => `/aio/api/admin/spa/vouchers/${id}`,
    spaVoucherDelete: (id: number) => `/aio/api/admin/spa/vouchers/${id}`,
    spaVoucherDeletePost: '/aio/api/admin/spa/vouchers/delete',
    spaVoucherVerify: '/aio/api/admin/spa/vouchers/verify',
    spaVoucherApply: '/aio/api/admin/spa/vouchers/apply',

    // Gói dịch vụ của khách hàng (Customer Packages)
    spaCustomerPackageList: '/aio/api/admin/spa/customer-packages/list',
    spaCustomerPackageUse: '/aio/api/admin/spa/customer-packages/use',
    spaCustomerPackagePurchase: '/aio/api/admin/spa/customer-packages/purchase',
    spaCustomerPackageHistory: '/aio/api/admin/spa/customer-packages/history',

    // Cấu hình (Settings)
    spaSettingGet: '/aio/api/admin/spa/settings/get',
    spaSettingUpdate: '/aio/api/admin/spa/settings/update',
    spaUploadImage: '/aio/api/admin/spa/upload-image',

    // Email Marketing Campaigns
    spaCampaignList: '/aio/api/admin/spa/campaigns',
    spaCampaignListPost: '/aio/api/admin/spa/campaigns/list',
    spaCampaignDetail: (id: number) => `/aio/api/admin/spa/campaigns/${id}`,
    spaCampaignCreate: '/aio/api/admin/spa/campaigns',
    spaCampaignCreateOrUpdate: '/aio/api/admin/spa/campaigns/create-or-update',
    spaCampaignUpdate: (id: number) => `/aio/api/admin/spa/campaigns/${id}`,
    spaCampaignDelete: (id: number) => `/aio/api/admin/spa/campaigns/${id}`,
    spaCampaignDeletePost: '/aio/api/admin/spa/campaigns/delete',
    spaCampaignSend: '/aio/api/admin/spa/campaigns/send',
    spaCampaignCountTarget: '/aio/api/admin/spa/campaigns/count-target',

    // Bookings (Đặt lịch)
    spaBookingList: '/aio/api/admin/spa/bookings',
    spaBookingListPost: '/aio/api/admin/spa/bookings/list',
    spaBookingCreate: '/aio/api/admin/spa/bookings',
    spaBookingUpdate: (id: number) => `/aio/api/admin/spa/bookings/${id}`,
    spaBookingConfirm: (id: number) => `/aio/api/admin/spa/bookings/${id}/confirm`,
    spaBookingStart: (id: number) => `/aio/api/admin/spa/bookings/${id}/start`,
    spaBookingComplete: (id: number) => `/aio/api/admin/spa/bookings/${id}/complete`,
    spaBookingCancel: (id: number) => `/aio/api/admin/spa/bookings/${id}/cancel`,
    spaBookingCalendar: '/aio/api/admin/spa/bookings/calendar',
    spaBookingAvailableKTVs: '/aio/api/admin/spa/bookings/available-ktvs',
    spaBookingAvailableRooms: '/aio/api/admin/spa/bookings/available-rooms',

    // ===== QUẢN LÝ KHO ĐA CHI NHÁNH =====

    // Tồn kho chi nhánh (Branch Inventory)
    tonKhoChiNhanhList: '/spa/ton-kho-chi-nhanh',
    tonKhoChiNhanhByBranch: (branchId: number) => `/spa/ton-kho-chi-nhanh/branch/${branchId}`,
    tonKhoChiNhanhStatistics: '/spa/ton-kho-chi-nhanh/statistics',
    tonKhoChiNhanhBranches: '/spa/ton-kho-chi-nhanh/branches',
    tonKhoChiNhanhProducts: (branchId: number) => `/spa/ton-kho-chi-nhanh/branches/${branchId}/products`,
    tonKhoChiNhanhDetail: (id: number) => `/spa/ton-kho-chi-nhanh/${id}`,
    tonKhoChiNhanhUpdate: (id: number) => `/spa/ton-kho-chi-nhanh/${id}`,
    tonKhoChiNhanhSync: '/spa/ton-kho-chi-nhanh/sync',
    tonKhoChiNhanhUpdateReserved: (id: number) => `/spa/ton-kho-chi-nhanh/${id}/update-reserved`,

    // Chuyển kho (Stock Transfer)
    chuyenKhoList: '/spa/chuyen-kho',
    chuyenKhoByBranch: (branchId: number) => `/spa/chuyen-kho/by-branch/${branchId}`,
    chuyenKhoDetail: (id: number) => `/spa/chuyen-kho/${id}`,
    chuyenKhoCreate: '/spa/chuyen-kho',
    chuyenKhoUpdate: (id: number) => `/spa/chuyen-kho/${id}`,
    chuyenKhoDelete: (id: number) => `/spa/chuyen-kho/${id}`,
    chuyenKhoApprove: (id: number) => `/spa/chuyen-kho/${id}/approve`,
    chuyenKhoReceive: (id: number) => `/spa/chuyen-kho/${id}/receive`,
    chuyenKhoCancel: (id: number) => `/spa/chuyen-kho/${id}/cancel`,
    chuyenKhoBranches: '/spa/chuyen-kho/branches',

    // Kiểm kê (Inventory Count)
    kiemKhoList: '/spa/kiem-kho',
    kiemKhoByBranch: (branchId: number) => `/spa/kiem-kho/by-branch/${branchId}`,
    kiemKhoProducts: (branchId: number) => `/spa/kiem-kho/branches/${branchId}/products`,
    kiemKhoDetail: (id: number) => `/spa/kiem-kho/${id}`,
    kiemKhoCreate: '/spa/kiem-kho',
    kiemKhoUpdate: (id: number) => `/spa/kiem-kho/${id}`,
    kiemKhoDelete: (id: number) => `/spa/kiem-kho/${id}`,
    kiemKhoSubmit: (id: number) => `/spa/kiem-kho/${id}/submit`,
    kiemKhoApprove: (id: number) => `/spa/kiem-kho/${id}/approve`,
    kiemKhoBranches: '/spa/kiem-kho/branches',

    // Trả hàng nhập (Purchase Return)
    traHangNhapList: '/spa/tra-hang-nhap',
    traHangNhapDetail: (id: number) => `/spa/tra-hang-nhap/${id}`,
    traHangNhapCreate: '/spa/tra-hang-nhap',
    traHangNhapUpdate: (id: number) => `/spa/tra-hang-nhap/${id}`,
    traHangNhapDelete: (id: number) => `/spa/tra-hang-nhap/${id}`,
    traHangNhapApprove: (id: number) => `/spa/tra-hang-nhap/${id}/approve`,
    traHangNhapSuppliers: '/spa/tra-hang-nhap/suppliers',
    traHangNhapReceipts: (supplierId: number) => `/spa/tra-hang-nhap/suppliers/${supplierId}/receipts`,
    traHangNhapProducts: (receiptId: number) => `/spa/tra-hang-nhap/receipts/${receiptId}/products`,

    // Xuất hủy (Disposal)
    xuatHuyList: '/spa/xuat-huy',
    xuatHuyByBranch: (branchId: number) => `/spa/xuat-huy/by-branch/${branchId}`,
    xuatHuyStatistics: '/spa/xuat-huy/statistics',
    xuatHuyDetail: (id: number) => `/spa/xuat-huy/${id}`,
    xuatHuyCreate: '/spa/xuat-huy',
    xuatHuyUpdate: (id: number) => `/spa/xuat-huy/${id}`,
    xuatHuyDelete: (id: number) => `/spa/xuat-huy/${id}`,
    xuatHuyApprove: (id: number) => `/spa/xuat-huy/${id}/approve`,
    xuatHuyBranches: '/spa/xuat-huy/branches',

    // Nhà cung cấp (Multi-Warehouse Supplier)
    nhaCungCapList: '/spa/nha-cung-cap',
    nhaCungCapDetail: (id: number) => `/spa/nha-cung-cap/${id}`,
    nhaCungCapCreate: '/spa/nha-cung-cap',
    nhaCungCapUpdate: (id: number) => `/spa/nha-cung-cap/${id}`,
    nhaCungCapDelete: (id: number) => `/spa/nha-cung-cap/${id}`,
    nhaCungCapToggleStatus: (id: number) => `/spa/nha-cung-cap/${id}/toggle-status`,

    // ===== QUẢN LÝ NHÂN VIÊN (HR Module) =====
    // Admin Users/Employees Management
    nhanVienList: '/aio/api/nhan-vien/list',
    nhanVienCreate: '/aio/api/nhan-vien/create',
    nhanVienUpdate: (id: number) => `/aio/api/nhan-vien/update/${id}`,
    nhanVienDelete: '/aio/api/nhan-vien/delete',
    nhanVienSelectOptions: '/aio/api/nhan-vien/select-options',

    // ===== QUẢN LÝ MENU ADMIN =====
    // Admin Menu Management
    adminMenuList: '/aio/api/admin-menu/list',
    adminMenuDetail: (id: number) => `/aio/api/admin-menu/${id}`,
    adminMenuCreate: '/aio/api/admin-menu/create',
    adminMenuUpdate: (id: number) => `/aio/api/admin-menu/update/${id}`,
    adminMenuDelete: '/aio/api/admin-menu/delete',
    adminMenuUpdateSortOrder: '/aio/api/admin-menu/update-sort-order',

};

export default API;
