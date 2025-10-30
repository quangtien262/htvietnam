import React from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

// css
import '../css/admin.css';

// table

// data

// import pages
import Dashboard from './pages/home/Dashboard';

// import products
import ProductList from './pages/products/list';

// Aitilen

// Tasks
import TaskKanban from './pages/task/TaskKanban';
import TaskList from './pages/task/TaskList';

// Projects

// import layout
import AppLayout from './components/Layout';

const App: React.FC = () => (
    <BrowserRouter basename="/aio">
        <AppLayout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products/:id" element={<ProductList />} />
                {/* tasks */}
                <Route path="/tasks/:parent/kanban/:pid" element={<TaskKanban />} />
                <Route path="/tasks/:parent/list/:pid" element={<TaskList />} />
            </Routes>
        </AppLayout>
    </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('react-root')!).render(<App />);
