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

    // tài chính
    taiChinhDashboard: `${baseRoute}tai-chinh/dashboard/`,
    taiChinhReport: `${baseRoute}tai-chinh/report/`,
    taiChinhInvoice: `${baseRoute}tai-chinh/invoice/`,
};

export default ROUTE;
