import React from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

// css
import '../css/admin.css';

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

// import layout
import AppLayout from './components/Layout';

const App: React.FC = () => (
    <BrowserRouter basename="/aio">
        <AppLayout>
            <Routes>
                <Route path="/" element={<Dashboard />} />

                {/* Aitilen */}
                <Route path="/bds/dashboard" element={<DashboardAitilen />} />

                {/* products */}
                <Route path="/products/:id" element={<ProductList />} />

                {/* tasks */}
                <Route path="/tasks/:parent/kanban/:pid" element={<TaskKanban />} />
                <Route path="/tasks/:parent/list/:pid" element={<TaskList />} />

                {/* projects */}
                <Route path="/projects/dashboard" element={<DashboardProject />} />
                <Route path="/p/:parentName/list" element={<ProjectList />} />

                {/* invoice */}
                <Route path="/bds/invoices/list" element={<InvoiceList_BDS />} />

                {/* contacts */}
                <Route path="/bds/contacts/list" element={<ContactList_BDS />} />

                {/* aitilen dien nuoc */}
                <Route path="/aitilen/chot-dien-nuoc" element={<AitilenDienNuoc />} />

            </Routes>
        </AppLayout>
    </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('react-root')!).render(<App />);
