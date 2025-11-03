import Dashboard from "../pages/home/Dashboard";
import TaskKanban from "../pages/task/TaskKanban";

const baseRoute = "/";
const baseUrl = "/aio/";
export const ROUTE = {
    dashboard: `${baseRoute}`,

    // Aitilen
    dashboard_aitilen: `${baseRoute}bds/dashboard/`,
    taskList_bds: `${baseRoute}tasks/all/list/1/`,
    taskKanban_bds: `${baseRoute}tasks/all/kanban/1/`,

    invoice_bds: `${baseRoute}bds/invoices/list`,

    // tasks
    taskList_all: `${baseRoute}tasks/all/list/1/`,
    taskKanban_all: `${baseUrl}tasks/all/kanban/1/`,
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

    // invoice aitilen
    invoiceList_BDS: `${baseRoute}bds/invoices/list/`,

    // contacts aitilen
    contactList_BDS: `${baseRoute}bds/contacts/list/`,

    // aitilen
    aitilen_DienNuoc: `${baseRoute}aitilen/chot-dien-nuoc/`,
};

export default ROUTE;
