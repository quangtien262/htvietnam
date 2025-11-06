import Dashboard from "../pages/home/Dashboard";
import TaskKanban from "../pages/task/TaskKanban";

const baseRoute = "/";
const baseUrl = "/user/";
export const ROUTE_ROUTE = {
    logoutUser: `/account/logout/user`,
    // Aitilen
    dashboard: `${baseRoute}`,
    invoices: `${baseRoute}aitilen/invoices`,
    contracts: `${baseRoute}aitilen/contracts`,
    support: `${baseRoute}aitilen/support`,
    profile: `${baseRoute}aitilen/profile`,
};

export default ROUTE_ROUTE;
