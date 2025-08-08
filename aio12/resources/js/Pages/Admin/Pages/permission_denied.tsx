import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/inertia-react';

export default function Dashboard(props) {

    return (
        <AdminLayout
            auth={props.auth}
            header='Trang chủ'
            tables={props.tables}
            content={
                <div>
                    <p>Bạn Không có quyền truy cập đường dẫn này.</p>
                    <p><a href={route('dashboard')}>Click để về trang chủ</a></p>
                </div>
            }
        />
    );
}
