import AdminLayout from '@/layouts/AdminLayout';

export default function Dashboard(props) {

    return (
        <AdminLayout
            auth={props.auth}
            header='Trang chủ'
            tables={props.tables}
            content={
                <div>
                    <p>Đường dẫn bạn truy cập không tồn tại hoặc đã bị xóa, vui lòng kiểm tra lại.</p>
                    <p>Hoăc<a href={route('dashboard')}> click để về trang chủ</a></p>
                </div>
            }
        />
    );
}
