# MODULE TÀI CHÍNH - HOÀN THIỆN

## ✅ ĐÃ HOÀN THÀNH:

### 1. QUẢN LÝ NGÂN HÀNG
✅ **Backend:**
- Migration: `tai_khoan_ngan_hang`, `giao_dich_ngan_hang`, `doi_soat_ngan_hang`
- Models: `TaiKhoanNganHang`, `GiaoDichNganHang`, `DoiSoatNganHang`
- Controllers: `TaiKhoanNganHangController`, `GiaoDichNganHangController`

✅ **API Endpoints:** Đã thêm vào `resources/js/common/api.tsx`
✅ **Routes:** Đã thêm vào `resources/js/common/route.tsx`
✅ **Menu:** Đã cập nhật `resources/js/common/menu.jsx`

### 2. HÓA ĐƠN
✅ **Backend:**
- Migration: `hoa_don`, `hoa_don_chi_tiet`

---

## ⏳ CẦN HOÀN THIỆN:

### BƯỚC 1: Chạy Migration
```bash
cd E:\Project\web-aio
php artisan migrate
```

### BƯỚC 2: Tạo Models cho Hóa đơn

**File: `app/Models/HoaDon.php`**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HoaDon extends Model
{
    protected $table = 'hoa_don';

    protected $fillable = [
        'ma_hoa_don',
        'ngay_hoa_don',
        'ngay_het_han',
        'khach_hang_id',
        'ten_khach_hang',
        'dia_chi',
        'so_dien_thoai',
        'ma_so_thue',
        'tong_tien_hang',
        'tien_giam_gia',
        'tien_thue',
        'tong_tien',
        'da_thanh_toan',
        'con_lai',
        'trang_thai',
        'ghi_chu',
        'created_by',
    ];

    protected $casts = [
        'ngay_hoa_don' => 'date',
        'ngay_het_han' => 'date',
        'tong_tien_hang' => 'decimal:2',
        'tien_giam_gia' => 'decimal:2',
        'tien_thue' => 'decimal:2',
        'tong_tien' => 'decimal:2',
        'da_thanh_toan' => 'decimal:2',
        'con_lai' => 'decimal:2',
    ];

    // Relationships
    public function chiTiet()
    {
        return $this->hasMany(HoaDonChiTiet::class, 'hoa_don_id');
    }

    public function khachHang()
    {
        return $this->belongsTo(\App\Models\Web\KhachHang::class, 'khach_hang_id');
    }

    public function nguoiTao()
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'created_by');
    }

    // Scopes
    public function scopeChuaThanhToan($query)
    {
        return $query->where('trang_thai', 'chua_thanh_toan');
    }

    public function scopeQuaHan($query)
    {
        return $query->where('trang_thai', 'qua_han');
    }
}
```

**File: `app/Models/HoaDonChiTiet.php`**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HoaDonChiTiet extends Model
{
    protected $table = 'hoa_don_chi_tiet';

    protected $fillable = [
        'hoa_don_id',
        'hang_hoa_id',
        'ten_hang_hoa',
        'don_vi',
        'so_luong',
        'don_gia',
        'thanh_tien',
        'tien_giam_gia',
        'tien_thue',
        'tong_tien',
        'ghi_chu',
        'sort_order',
    ];

    protected $casts = [
        'so_luong' => 'decimal:2',
        'don_gia' => 'decimal:2',
        'thanh_tien' => 'decimal:2',
        'tien_giam_gia' => 'decimal:2',
        'tien_thue' => 'decimal:2',
        'tong_tien' => 'decimal:2',
    ];

    // Relationships
    public function hoaDon()
    {
        return $this->belongsTo(HoaDon::class, 'hoa_don_id');
    }

    public function hangHoa()
    {
        return $this->belongsTo(\App\Models\HangHoa::class, 'hang_hoa_id');
    }
}
```

### BƯỚC 3: Thêm Routes vào Laravel

**File: `routes/admin_route.php` - Thêm vào cuối file:**
```php
use App\Http\Controllers\Admin\TaiKhoanNganHangController;
use App\Http\Controllers\Admin\GiaoDichNganHangController;
use App\Http\Controllers\Admin\HoaDonController;

// Ngân hàng - Tài khoản
Route::get('/bank/account', [TaiKhoanNganHangController::class, 'index'])->name('bank.account');
Route::post('/api/bank/account/list', [TaiKhoanNganHangController::class, 'apiList']);
Route::post('/api/bank/account/add', [TaiKhoanNganHangController::class, 'apiAdd']);
Route::post('/api/bank/account/update', [TaiKhoanNganHangController::class, 'apiUpdate']);
Route::post('/api/bank/account/delete', [TaiKhoanNganHangController::class, 'apiDelete']);
Route::post('/api/bank/account/update-sort-order', [TaiKhoanNganHangController::class, 'apiUpdateSortOrder']);

// Ngân hàng - Giao dịch
Route::get('/bank/transaction', [GiaoDichNganHangController::class, 'index'])->name('bank.transaction');
Route::post('/api/bank/transaction/list', [GiaoDichNganHangController::class, 'apiList']);
Route::post('/api/bank/transaction/add', [GiaoDichNganHangController::class, 'apiAdd']);
Route::post('/api/bank/transaction/update', [GiaoDichNganHangController::class, 'apiUpdate']);
Route::post('/api/bank/transaction/delete', [GiaoDichNganHangController::class, 'apiDelete']);
Route::post('/api/bank/transaction/tai-khoan-list', [GiaoDichNganHangController::class, 'apiTaiKhoanList']);

// Hóa đơn - TẠO SAU
// Route::get('/erp/invoice', [HoaDonController::class, 'index'])->name('invoice');
// Route::post('/api/invoice/list', [HoaDonController::class, 'apiList']);
```

### BƯỚC 4: Tạo Blade Views

**File: `resources/views/admin/bank/account_list.blade.php`**
```blade
@extends('admin.layout')

@section('title', 'Quản lý tài khoản ngân hàng')

@section('content')
<div id="bank-account-root"></div>
@endsection

@push('scripts')
@viteReactRefresh
@vite('resources/js/pages/bank/BankAccountList.tsx')
@endpush
```

**File: `resources/views/admin/bank/transaction_list.blade.php`**
```blade
@extends('admin.layout')

@section('title', 'Giao dịch ngân hàng')

@section('content')
<div id="bank-transaction-root"></div>
@endsection

@push('scripts')
@viteReactRefresh
@vite('resources/js/pages/bank/BankTransactionList.tsx')
@endpush
```

### BƯỚC 5: Tạo Frontend React (Sample)

**File: `resources/js/pages/bank/BankAccountList.tsx`**
```tsx
import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import API from '../../common/api';

const BankAccountList: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.post(API.bankAccountList, {
                searchData: { page: 1, per_page: 20 }
            });
            if (res?.data?.status_code === 200) {
                setDataSource(res.data.data.datas || []);
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: 'Tên ngân hàng', dataIndex: 'ten_ngan_hang', key: 'ten_ngan_hang' },
        { title: 'Số tài khoản', dataIndex: 'so_tai_khoan', key: 'so_tai_khoan' },
        { title: 'Chủ tài khoản', dataIndex: 'chu_tai_khoan', key: 'chu_tai_khoan' },
        {
            title: 'Số dư',
            dataIndex: 'so_du_hien_tai',
            key: 'so_du_hien_tai',
            render: (val: number) => val?.toLocaleString('vi-VN') + ' đ'
        },
    ];

    return (
        <Card title="Tài khoản ngân hàng" extra={<Button type="primary" icon={<PlusOutlined />}>Thêm mới</Button>}>
            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="id"
                loading={loading}
            />
        </Card>
    );
};

export default BankAccountList;
```

---

## 📋 CHECKLIST HOÀN THIỆN:

### Backend:
- [ ] Tạo `app/Models/HoaDon.php`
- [ ] Tạo `app/Models/HoaDonChiTiet.php`
- [ ] Tạo `app/Http/Controllers/Admin/HoaDonController.php`
- [ ] Thêm routes vào `routes/admin_route.php`
- [ ] Chạy `php artisan migrate`

### Frontend:
- [ ] Tạo `resources/views/admin/bank/account_list.blade.php`
- [ ] Tạo `resources/views/admin/bank/transaction_list.blade.php`
- [ ] Tạo `resources/js/pages/bank/BankAccountList.tsx`
- [ ] Tạo `resources/js/pages/bank/BankTransactionList.tsx`
- [ ] Tạo `resources/js/pages/erp/InvoiceList.tsx`
- [ ] Tạo `resources/js/pages/erp/ERPDashboard.tsx`

### Testing:
- [ ] Test CRUD tài khoản ngân hàng
- [ ] Test giao dịch ngân hàng (tự động cập nhật số dư)
- [ ] Test hóa đơn (tự động tạo công nợ)
- [ ] Test dashboard hiển thị báo cáo

---

## 🚀 HƯỚNG DẪN TIẾP THEO:

1. **Chạy migration**: `php artisan migrate`
2. **Test API**: Dùng Postman test các endpoint đã tạo
3. **Tạo frontend**: Code từng trang theo mẫu BankAccountList
4. **Tích hợp**: Liên kết với module công nợ hiện có

Xem file `docs/ERP_MODULE_COMPLETION_GUIDE.js` để biết chi tiết API endpoints!
