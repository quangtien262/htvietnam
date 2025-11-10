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
import HangHoaList from './pages/purchase/HangHoaList';
import HuongDanPurchasePage from './pages/purchase/HuongDanPurchasePage';

// ERP - Bank Management
import BankAccountList from './pages/bank/BankAccountList';
import BankTransactionList from './pages/bank/BankTransactionList';

// ERP - Dashboard
import ERPDashboard from './pages/erp/ERPDashboard';

// HR
import ChamCongPage from './pages/hr/ChamCongPage';
import BangLuongPage from './pages/hr/BangLuongPage';
import NghiPhepPage from './pages/hr/NghiPhepPage';
import BaoCaoPage from './pages/hr/BaoCaoPage';
import HuongDanHRPage from './pages/hr/HuongDanHRPage';

// Sales
import KhachHangPage from './pages/sales/KhachHangPage';
import DonHangPage from './pages/sales/DonHangPage';
import BaoCaoSalesPage from './pages/sales/BaoCaoSalesPage';
import HuongDanSalesPage from './pages/sales/HuongDanSalesPage';

// Business
import CoHoiKinhDoanhPage from './pages/business/CoHoiKinhDoanhPage';
import BaoGiaPage from './pages/business/BaoGiaPage';
import BaoCaoBusinessPage from './pages/business/BaoCaoBusinessPage';
import HuongDanBusinessPage from './pages/business/HuongDanBusinessPage';

// Telesale
import DataKhachHangPage from './pages/telesale/DataKhachHangPage';
import CuocGoiPage from './pages/telesale/CuocGoiPage';
import DonHangTelesalePage from './pages/telesale/DonHangTelesalePage';
import BaoCaoTelesalePage from './pages/telesale/BaoCaoTelesalePage';
import HuongDanTelesalePage from './pages/telesale/HuongDanTelesalePage';

// Document Management
import DocumentExplorerPage from './pages/document/DocumentExplorerPage';
import StarredPage from './pages/document/StarredPage';
import RecentPage from './pages/document/RecentPage';
import TrashPage from './pages/document/TrashPage';
import SettingsPage from './pages/document/SettingsPage';
import ShareLinkPage from './pages/document/ShareLinkPage';
import UserGuidePage from './pages/document/UserGuidePage';

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
                <Route path={ROUTE.hangHoaManagement} element={<HangHoaList />} />
                <Route path={ROUTE.purchaseOrderManagement} element={<PurchaseOrderList />} />
                <Route path={ROUTE.stockReceiptManagement} element={<StockReceiptList />} />
                <Route path={ROUTE.supplierPaymentManagement} element={<SupplierPaymentList />} />
                <Route path={ROUTE.purchaseReportManagement} element={<PurchaseReport />} />
                <Route path={ROUTE.purchaseHuongDan} element={<HuongDanPurchasePage />} />

                {/* customer */}
                <Route path={ROUTE.customerList} element={<CustomerList />} />

                {/* meeting */}
                <Route path={ROUTE.meeting} element={<MeetingList />} />

                {/* Tài chính dashboard */}
                <Route path={ROUTE.taiChinhDashboard} element={<TaiChinh />} />

                {/* ERP - Bank Management */}
                <Route path={ROUTE.bankAccount} element={<BankAccountList />} />
                <Route path={ROUTE.bankTransaction} element={<BankTransactionList />} />

                {/* ERP - Dashboard */}
                <Route path={ROUTE.erpDashboard} element={<ERPDashboard />} />

                {/* HR */}
                <Route path={ROUTE.hrChamCong} element={<ChamCongPage />} />
                <Route path={ROUTE.hrBangLuong} element={<BangLuongPage />} />
                <Route path={ROUTE.hrNghiPhep} element={<NghiPhepPage />} />
                <Route path={ROUTE.hrBaoCao} element={<BaoCaoPage />} />
                <Route path={ROUTE.hrHuongDan} element={<HuongDanHRPage />} />

                {/* Sales */}
                <Route path={ROUTE.salesKhachHang} element={<KhachHangPage />} />
                <Route path={ROUTE.salesDonHang} element={<DonHangPage />} />
                <Route path={ROUTE.salesBaoCao} element={<BaoCaoSalesPage />} />
                <Route path={ROUTE.salesHuongDan} element={<HuongDanSalesPage />} />

                {/* Business */}
                <Route path={ROUTE.businessCoHoi} element={<CoHoiKinhDoanhPage />} />
                <Route path={ROUTE.businessBaoGia} element={<BaoGiaPage />} />
                <Route path={ROUTE.businessBaoCao} element={<BaoCaoBusinessPage />} />
                <Route path={ROUTE.businessHuongDan} element={<HuongDanBusinessPage />} />

                {/* Telesale */}
                <Route path={ROUTE.telesaleData} element={<DataKhachHangPage />} />
                <Route path={ROUTE.telesaleCuocGoi} element={<CuocGoiPage />} />
                <Route path={ROUTE.telesaleDonHang} element={<DonHangTelesalePage />} />
                <Route path={ROUTE.telesaleBaoCao} element={<BaoCaoTelesalePage />} />
                <Route path={ROUTE.telesaleHuongDan} element={<HuongDanTelesalePage />} />

                {/* Document Management */}
                <Route path={ROUTE.documentsExplorer} element={<DocumentExplorerPage />} />
                <Route path={ROUTE.documentsStarred} element={<StarredPage />} />
                <Route path={ROUTE.documentsRecent} element={<RecentPage />} />
                <Route path={ROUTE.documentsTrash} element={<TrashPage />} />
                <Route path={ROUTE.documentsSettings} element={<SettingsPage />} />
                <Route path={ROUTE.documentsUserGuide} element={<UserGuidePage />} />
                <Route path="/share/:hash" element={<ShareLinkPage />} />
            </Routes>
        </AppLayout>
    </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('react-root')!).render(<App />);
