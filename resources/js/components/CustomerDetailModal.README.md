# CustomerDetailModal Component

Component hiển thị thông tin chi tiết khách hàng trong Modal popup.

## Import

```tsx
import CustomerDetailModal from '../../components/CustomerDetailModal';
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `visible` | boolean | Yes | Điều khiển hiển thị/ẩn modal |
| `customerId` | number \| null | Yes | ID của khách hàng cần hiển thị |
| `onClose` | () => void | Yes | Callback khi đóng modal |
| `onEdit` | (customerId: number) => void | No | Callback khi click nút "Cập nhật thông tin" |
| `onLogin` | (customerId: number) => void | No | Callback khi click nút "Login" |

## Sử dụng

### Ví dụ cơ bản

```tsx
import React, { useState } from 'react';
import CustomerDetailModal from '../../components/CustomerDetailModal';
import { Button } from 'antd';

const MyComponent = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

    const handleShowCustomer = (customerId: number) => {
        setSelectedCustomerId(customerId);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedCustomerId(null);
    };

    return (
        <>
            <Button onClick={() => handleShowCustomer(123)}>
                Xem thông tin khách hàng
            </Button>

            <CustomerDetailModal
                visible={modalVisible}
                customerId={selectedCustomerId}
                onClose={handleCloseModal}
            />
        </>
    );
};
```

### Ví dụ với callbacks

```tsx
import React, { useState } from 'react';
import CustomerDetailModal from '../../components/CustomerDetailModal';
import { message } from 'antd';

const ContractList = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

    const handleShowCustomer = (customerId: number) => {
        setSelectedCustomerId(customerId);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedCustomerId(null);
    };

    const handleEditCustomer = (customerId: number) => {
        // Xử lý chỉnh sửa thông tin khách hàng
        console.log('Edit customer:', customerId);
        setModalVisible(false);
        // Navigate to edit page hoặc mở modal edit
    };

    const handleLoginCustomer = (customerId: number) => {
        // Xử lý login với tài khoản khách hàng
        console.log('Login as customer:', customerId);
        message.success('Đang đăng nhập...');
    };

    return (
        <>
            {/* Danh sách hợp đồng */}
            <Table
                dataSource={contracts}
                columns={[
                    {
                        title: 'Khách hàng',
                        dataIndex: 'customer_name',
                        render: (text, record) => (
                            <a onClick={() => handleShowCustomer(record.customer_id)}>
                                {text}
                            </a>
                        )
                    },
                    // ... other columns
                ]}
            />

            <CustomerDetailModal
                visible={modalVisible}
                customerId={selectedCustomerId}
                onClose={handleCloseModal}
                onEdit={handleEditCustomer}
                onLogin={handleLoginCustomer}
            />
        </>
    );
};
```

### Ví dụ trong bảng với expandable row

```tsx
const expandedRowRender = (record: any) => {
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    return (
        <div>
            <Button onClick={() => setDetailModalVisible(true)}>
                Xem chi tiết khách hàng
            </Button>

            <CustomerDetailModal
                visible={detailModalVisible}
                customerId={record.customer_id}
                onClose={() => setDetailModalVisible(false)}
            />
        </div>
    );
};
```

## Tính năng

- ✅ Hiển thị đầy đủ thông tin khách hàng (cơ bản, tài chính, bổ sung)
- ✅ Lịch sử hóa đơn với chi tiết dịch vụ (expandable)
- ✅ Tự động load dữ liệu khi mở modal
- ✅ Responsive design (desktop + mobile)
- ✅ Loading state khi fetch data
- ✅ Error handling với message notification
- ✅ Tùy chỉnh buttons trong footer (onEdit, onLogin)

## API Endpoint

Component sử dụng endpoint: `API.customerDetail`

Request body:
```json
{
    "id": 123
}
```

Response expected:
```json
{
    "status_code": 200,
    "data": {
        "khachHang": {
            "id": 123,
            "code": "KH00123",
            "name": "Nguyễn Văn A",
            "phone": "0123456789",
            "email": "example@email.com",
            // ... other customer fields
        },
        "hoaDon": [
            {
                "id": 1,
                "code": "AHD00001",
                "month": 11,
                "year": 2025,
                "total": 4260668,
                "services": [
                    // ... service details
                ]
            }
        ]
    }
}
```

## Notes

- Component tự động reset data khi đóng modal
- Chỉ load data khi modal visible và có customerId
- Nếu không truyền `onEdit` hoặc `onLogin`, các nút tương ứng sẽ không hiển thị
- Hỗ trợ hiển thị tối đa 5 hóa đơn/trang trong tab "Lịch sử hóa đơn"
