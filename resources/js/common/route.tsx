import Dashboard from "../pages/home/Dashboard";
import TaskKanban from "../pages/task/TaskKanban";

const baseRoute = "/aio/";
export const ROUTE = {
    dashboard: baseRoute,

    // Aitilen
    dashboard_aitilen: `${baseRoute}aitilen/dashboard`,

    // tasks
    taskList_all: `${baseRoute}tasks/all/list/1`,
    taskKanban_all: `${baseRoute}tasks/all/kanban/1`,
};

export default ROUTE;
