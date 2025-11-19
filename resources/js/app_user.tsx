import React from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

// css
import '../css/user.css';

import ROUTE from "./common/route_user";

// data
// import layout
import AppLayout from './components/LayoutUser';

// import pages
import AitilenDashboard from './pages_user/home/AitilenDashboard';
import AitilenInvoices from './pages_user/invoice/AitilenInvoices';
import AitilenContracts from './pages_user/contract/AitilenContracts';
import AitilenProfile from './pages_user/profile/AitilenProfile';
import AitilenSupport from './pages_user/support/AitilenSupport';

// Aitilen

const App: React.FC = () => (
    <BrowserRouter basename="/user">
        <AppLayout>
            <Routes>
                <Route path="/" element={<AitilenDashboard />} />
                <Route path="aitilen/invoices" element={<AitilenInvoices />} />
                <Route path="aitilen/contracts" element={<AitilenContracts />} />
                <Route path="aitilen/profile" element={<AitilenProfile />} />
                <Route path="aitilen/support" element={<AitilenSupport />} />
            </Routes>
        </AppLayout>
    </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('react-root')!).render(<App />);
