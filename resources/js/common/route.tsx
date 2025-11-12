import { m } from "framer-motion";
import Dashboard from "../pages/home/Dashboard";
import TaskKanban from "../pages/task/TaskKanban";

const baseRoute = "/";
const baseUrl = "/aio/";
export const ROUTE = {
    baseRoute: baseRoute,
    dashboard: `${baseRoute}`,

    // Aitilen
    dashboard_aitilen: `${baseRoute}bds/dashboard/`,
    taskList_bds: `${baseRoute}tasks/aitilen/list/2/`,
    taskKanban_bds: `${baseRoute}tasks/all/kanban/1/`,

    apartment_bds: `${baseRoute}bds/apartments/list`,

    aitilen_soQuy: `${baseRoute}aitilen/so-quy`,

    invoice_bds: `${baseRoute}bds/invoices/list`,

    // tasks
    taskList_all: `${baseRoute}tasks/aitilen/list/2/`,
    taskKanban_all: `${baseUrl}tasks/aitilen/kanban/2/`,
    project_all: `${baseRoute}p/all/kanban/1/`,

    //đẩy phòng
    taskList_phongTrong: `${baseUrl}tasks/day-phong/list/1/`,
    taskKanban_phongTrong: `${baseUrl}tasks/day-phong/kanban/1/`,

    //đẩy phòng
    taskList_aitilenSales: `${baseUrl}tasks/aitilen-sales/list/1/`,
    taskKanban_aitilenSales: `${baseUrl}tasks/aitilen-sales/kanban/1/`,

    // projects
    dashboardProject: `${baseRoute}projects/dashboard/`,
    projectList: `${baseRoute}p/projects/list/`,
    projectTaskList_all: `${baseUrl}tasks/all/list/1/`,
    projectTaskKanban_all: `${baseUrl}tasks/all/kanban/1/`,

    // invoice aitilenf
    invoiceList_BDS: `${baseRoute}bds/invoices/list/`,

    // contacts aitilen
    contactList_BDS: `${baseRoute}bds/contacts/list/`,

    // aitilen
    aitilen_DienNuoc: `${baseRoute}aitilen/chot-dien-nuoc/`,

    // customer
    customerList: `${baseRoute}customers/list/`,

    // meeting
    meeting: `${baseRoute}meetings/list/`,

    // management
    menuManagement: `${baseRoute}menus/list/`,
    newsManagement: `${baseRoute}news/list/`,
    productManagement: `${baseRoute}products/list/`,
    congNoManagement: `${baseRoute}cong-no/list/`,

    // Purchase Management
    supplierManagement: `${baseRoute}purchase/suppliers/`,
    purchaseOrderManagement: `${baseRoute}purchase/orders/`,
    stockReceiptManagement: `${baseRoute}purchase/receipts/`,
    supplierPaymentManagement: `${baseRoute}purchase/payments/`,
    purchaseReportManagement: `${baseRoute}purchase/reports/`,
    hangHoaManagement: `${baseRoute}purchase/hang-hoa/list/`,
    purchaseHuongDan: `${baseRoute}purchase/huong-dan/`,

    // tài chính
    taiChinhDashboard: `${baseRoute}tai-chinh/dashboard/`,
    taiChinhReport: `${baseRoute}tai-chinh/report/`,
    taiChinhInvoice: `${baseRoute}tai-chinh/invoice/`,

    // ERP - Ngân hàng
    bankAccount: `${baseRoute}bank/account/`,
    bankTransaction: `${baseRoute}bank/transaction/`,
    bankReconciliation: `${baseRoute}bank/reconciliation/`,

    // ERP - Hóa đơn
    invoiceManagement: `${baseRoute}erp/invoice/`,

    // ERP - Dashboard
    erpDashboard: `${baseRoute}erp/dashboard/`,

    // HR - Quản lý nhân sự
    hrChamCong: `${baseRoute}hr/cham-cong/`,
    hrBangLuong: `${baseRoute}hr/bang-luong/`,
    hrNghiPhep: `${baseRoute}hr/nghi-phep/`,
    hrBaoCao: `${baseRoute}hr/bao-cao/`,
    hrHuongDan: `${baseRoute}hr/huong-dan/`,

    // Sales - Quản lý bán hàng
    salesKhachHang: `${baseRoute}sales/khach-hang/`,
    salesDonHang: `${baseRoute}sales/don-hang/`,
    salesPhieuThu: `${baseRoute}sales/phieu-thu/`,
    salesKhuyenMai: `${baseRoute}sales/khuyen-mai/`,
    salesBaoCao: `${baseRoute}sales/bao-cao/`,
    salesHuongDan: `${baseRoute}sales/huong-dan/`,

    // Business - Quản lý Kinh doanh
    businessCoHoi: `${baseRoute}business/co-hoi/`,
    businessBaoGia: `${baseRoute}business/bao-gia/`,
    businessBaoCao: `${baseRoute}business/bao-cao/`,
    businessHuongDan: `${baseRoute}business/huong-dan/`,

    // Telesale - Quản lý Telesale
    telesaleData: `${baseRoute}telesale/data-khach-hang/`,
    telesaleCuocGoi: `${baseRoute}telesale/cuoc-goi/`,
    telesaleDonHang: `${baseRoute}telesale/don-hang/`,
    telesaleBaoCao: `${baseRoute}telesale/bao-cao/`,
    telesaleHuongDan: `${baseRoute}telesale/huong-dan/`,

    // Document Management - Quản lý tài liệu
    documentsExplorer: `${baseRoute}documents/explorer/`,
    documentsStarred: `${baseRoute}documents/starred/`,
    documentsRecent: `${baseRoute}documents/recent/`,
    documentsTrash: `${baseRoute}documents/trash/`,
    documentsSettings: `${baseRoute}documents/settings/`,
    documentsUserGuide: `${baseRoute}documents/user-guide/`, // Trang hướng dẫn sử dụng
    documentsShare: `${baseRoute}share/`, // Public share link (no hash, will be /share/:hash)

    // SPA Management - Quản lý Spa
    spa_dashboard: `${baseRoute}spa/dashboard/`,
    spa_booking_calendar: `${baseRoute}spa/booking-calendar/`,
    spa_pos: `${baseRoute}spa/pos/`,
    spa_customers: `${baseRoute}spa/customers/`,
    spa_customer_profile: `${baseRoute}spa/customers/:id/`,
    spa_membership: `${baseRoute}spa/membership/`,
    spa_services: `${baseRoute}spa/services/`,
    spa_treatment_packages: `${baseRoute}spa/treatment-packages/`,
    spa_products: `${baseRoute}spa/products/`,
    spa_inventory: `${baseRoute}spa/inventory/`,
    spa_staff: `${baseRoute}spa/staff/`,
    spa_staff_schedule: `${baseRoute}spa/staff/:id/schedule/`,
    spa_vouchers: `${baseRoute}spa/vouchers/`,
    spa_campaigns: `${baseRoute}spa/campaigns/`,
    spa_analytics: `${baseRoute}spa/analytics/`,
    spa_reports: `${baseRoute}spa/reports/`,
    spa_documentation: `${baseRoute}spa/documentation/`,
    spa_branches: `${baseRoute}spa/branches/`,
    spa_rooms: `${baseRoute}spa/rooms/`,
    spa_settings: `${baseRoute}spa/settings/`,

    // Project Management - Quản lý dự án
    project_dashboard: `${baseRoute}project/dashboard/`,
    project_list: `${baseRoute}project/list/`,
    project_detail: `${baseRoute}project/:id/`,
    project_kanban: `${baseRoute}project/:id/kanban/`,
    project_gantt: `${baseRoute}project/:id/gantt/`,
    project_tasks: `${baseRoute}project/:id/tasks/`,
    project_settings: `${baseRoute}project/settings/`,
    project_guide: `${baseRoute}project/guide/`,
};

export default ROUTE;

