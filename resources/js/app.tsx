import React from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import ROUTE from './common/route';

// css
import '../css/admin.css';
// import layout
import AppLayout from './components/Layout';

// table

// data

// import pages
import Dashboard from './pages/home/Dashboard';

// Aitilen
import DashboardAitilen from './pages/aitilen/DashboardAitilen';

// Tasks
import TaskKanban from './pages/task/TaskKanban';
import TaskList from './pages/task/TaskList';

// import products
import ProductList from './pages/products/List';

// Projects
import DashboardProject from './pages/projects/DashboardProject';
import ProjectList from './pages/projects/ProjectList';

// invoice bds
import InvoiceList_BDS from './pages/invoice/InvoiceList_BDS';

// contacts bds
import ContactList_BDS from './pages/contacts/ContactList_BDS';

// aitilen
import AitilenDienNuoc from './pages/aitilen/DienNuoc';
import SoQuyList from './pages/aitilen/SoQuyList';

// customer
import CustomerList from './pages/customers/CustomerList';

// meeting
import MeetingList from './pages/meeting/MeetingList';

import Apartment from './pages/aitilen/Apartment';

// common
import CommonSettingList from './pages/common/CommonSettingList';

// menu
import MenuList from './pages/menu/MenuList';
import NewsList from './pages/news/NewsList';
import ProductsList from './pages/products/ProductsList';

// Tai Chính
import TaiChinh from "./pages/home/TaiChinh";

// cong nợ
import CongNoList from './pages/congno/CongNoList';

// Purchase Management
import SupplierList from './pages/purchase/SupplierList';
import PurchaseOrderList from './pages/purchase/PurchaseOrderList';
import StockReceiptList from './pages/purchase/StockReceiptList';
import SupplierPaymentList from './pages/purchase/SupplierPaymentList';
import PurchaseReport from './pages/purchase/PurchaseReport';

// WHMCS
import WhmcsDashboard from './pages/whmcs/WhmcsDashboard';
import ClientList from './pages/whmcs/ClientList';
import ProductList_WHMCS from './pages/whmcs/ProductList';
import OrderList from './pages/whmcs/OrderList';
import ServiceList from './pages/whmcs/ServiceList';
import InvoiceList_WHMCS from './pages/whmcs/InvoiceList';
import DomainList from './pages/whmcs/DomainList';
import TicketList from './pages/whmcs/TicketList';
import ReportPage from './pages/whmcs/ReportPage';
import SettingPage from './pages/whmcs/SettingPage';
import ServerManagement from './pages/whmcs/ServerManagement';
import HostingProducts from './pages/whmcs/HostingProducts';

const App: React.FC = () => (
    <BrowserRouter basename="/aio">
        <AppLayout>
            <Routes>
                <Route path={ROUTE.dashboard} element={<Dashboard />} />

                {/* Aitilen */}
                <Route path={ROUTE.dashboard_aitilen} element={<DashboardAitilen />} />
                {/* Apartment */}
                <Route path={ROUTE.apartment_bds} element={<Apartment />} />

                {/* products */}
                <Route path="/products/:id" element={<ProductList />} />

                {/* tasks */}
                <Route path="/tasks/:parent/kanban/:pid" element={<TaskKanban />} />
                <Route path="/tasks/:parent/list/:pid" element={<TaskList />} />

                {/* projects */}
                <Route path={ROUTE.dashboardProject} element={<DashboardProject />} />
                <Route path="/p/:parentName/list" element={<ProjectList />} />

                {/* invoice */}
                <Route path="/bds/invoices/list" element={<InvoiceList_BDS />} />

                {/* contacts */}
                <Route path={ROUTE.contactList_BDS} element={<ContactList_BDS />} />

                {/* aitilen dien nuoc */}
                <Route path={ROUTE.aitilen_DienNuoc} element={<AitilenDienNuoc />} />

                {/* so quy */}
                <Route path={ROUTE.aitilen_soQuy} element={<SoQuyList />} />

                {/* common settings */}
                <Route path="/setting/:tableName" element={<CommonSettingList />} />

                {/* menu */}
                <Route path={ROUTE.menuManagement} element={<MenuList />} />
                <Route path={ROUTE.newsManagement} element={<NewsList />} />
                <Route path={ROUTE.productManagement} element={<ProductsList />} />

                {/* cong no */}
                <Route path={ROUTE.congNoManagement} element={<CongNoList />} />

                {/* Purchase Management */}
                <Route path={ROUTE.supplierManagement} element={<SupplierList />} />
                <Route path={ROUTE.purchaseOrderManagement} element={<PurchaseOrderList />} />
                <Route path={ROUTE.stockReceiptManagement} element={<StockReceiptList />} />
                <Route path={ROUTE.supplierPaymentManagement} element={<SupplierPaymentList />} />
                <Route path={ROUTE.purchaseReportManagement} element={<PurchaseReport />} />

                {/* WHMCS */}
                <Route path={ROUTE.whmcs_dashboard} element={<WhmcsDashboard />} />
                <Route path={ROUTE.whmcs_clients} element={<ClientList />} />
                <Route path={ROUTE.whmcs_products} element={<ProductList_WHMCS />} />
                <Route path={ROUTE.whmcs_orders} element={<OrderList />} />
                <Route path={ROUTE.whmcs_services} element={<ServiceList />} />
                <Route path={ROUTE.whmcs_invoices} element={<InvoiceList_WHMCS />} />
                <Route path={ROUTE.whmcs_domains} element={<DomainList />} />
                <Route path={ROUTE.whmcs_tickets} element={<TicketList />} />
                <Route path={ROUTE.whmcs_reports} element={<ReportPage />} />
                <Route path={ROUTE.whmcs_settings} element={<SettingPage />} />
                <Route path={ROUTE.whmcs_server_management} element={<ServerManagement />} />
                <Route path={ROUTE.whmcs_hosting_products} element={<HostingProducts />} />

                {/* customer */}
                <Route path={ROUTE.customerList} element={<CustomerList />} />

                {/* meeting */}
                <Route path={ROUTE.meeting} element={<MeetingList />} />

                {/* Tài chính dashboard */}
                <Route path={ROUTE.taiChinhDashboard} element={<TaiChinh />} />
            </Routes>
        </AppLayout>
    </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('react-root')!).render(<App />);
