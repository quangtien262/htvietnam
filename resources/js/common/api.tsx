
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

};

export default API;
