import Dashboard from "../pages/home/Dashboard";
import TaskKanban from "../pages/task/TaskKanban";

const baseRoute = "";
export const ROUTE = {
    dashboard: `${baseRoute}`,

    // Aitilen
    dashboard_aitilen: `${baseRoute}bds/dashboard/`,
    taskList_bds: `${baseRoute}tasks/all/list/1/`,
    taskKanban_bds: `${baseRoute}tasks/all/kanban/1/`,

    // tasks
    taskList_all: `${baseRoute}tasks/all/list/1/`,
    taskKanban_all: `${baseRoute}tasks/all/kanban/1/`,
};

export default ROUTE;
