# QuickAddSetting Component

Component "Thêm nhanh" cho các bảng settings common, sử dụng API CommonSettingController.

## Tính năng

- ✅ Tái sử dụng cho nhiều bảng settings khác nhau
- ✅ Tích hợp CommonSettingController API
- ✅ Tự động cập nhật danh sách sau khi thêm
- ✅ Hỗ trợ chọn màu (ColorPicker)
- ✅ Callback sau khi thêm thành công
- ✅ Hiển thị dạng button hoặc tag

## Sử dụng

### 1. Import component

```tsx
import QuickAddSetting from '../../components/QuickAddSetting';
```

### 2. Sử dụng trong Form

#### Ví dụ 1: Thêm nhanh "Phân loại hàng hóa"

```tsx
const [loaiHangHoaList, setLoaiHangHoaList] = useState<any[]>([]);
const [form] = Form.useForm();

const handleQuickAddSuccess = (newItem: any) => {
  // Thêm item mới vào danh sách
  setLoaiHangHoaList(prev => [...prev, newItem]);
  
  // Tự động chọn item vừa thêm
  form.setFieldsValue({
    loai_hang_hoa_id: newItem.id
  });
  
  message.success('Đã thêm và chọn phân loại mới');
};

// Trong Form
<Form.Item
  label={
    <span>
      Phân loại{' '}
      <QuickAddSetting
        tableName="loai_hang_hoa"
        buttonText="Thêm nhanh"
        showAsTag={true}
        onSuccess={handleQuickAddSuccess}
        modalTitle="Thêm phân loại hàng hóa"
        placeholder="Nhập tên phân loại..."
        hasColor={true}
      />
    </span>
  }
  name="loai_hang_hoa_id"
>
  <Select placeholder="Chọn phân loại" allowClear>
    {loaiHangHoaList.map(loai => (
      <Select.Option key={loai.id} value={loai.id}>
        <Tag color={loai.color}>{loai.name}</Tag>
      </Select.Option>
    ))}
  </Select>
</Form.Item>
```

#### Ví dụ 2: Thêm nhanh "Trạng thái đơn hàng"

```tsx
const handleStatusQuickAdd = (newStatus: any) => {
  setStatusList(prev => [...prev, newStatus]);
  form.setFieldsValue({ status: newStatus.value });
};

<Form.Item
  label={
    <span>
      Trạng thái{' '}
      <QuickAddSetting
        tableName="purchase_order_statuses"
        buttonText="Thêm trạng thái"
        showAsTag={true}
        onSuccess={handleStatusQuickAdd}
        hasColor={true}
      />
    </span>
  }
  name="status"
>
  <Select placeholder="Chọn trạng thái">
    {statusList.map(status => (
      <Select.Option key={status.value} value={status.value}>
        <Tag color={status.color}>{status.label}</Tag>
      </Select.Option>
    ))}
  </Select>
</Form.Item>
```

#### Ví dụ 3: Dạng button thông thường

```tsx
<QuickAddSetting
  tableName="task_priority"
  buttonText="Thêm mức độ ưu tiên"
  buttonType="primary"
  buttonSize="middle"
  showAsTag={false}
  onSuccess={(newItem) => {
    loadTaskPriorities();
    message.success('Đã thêm mới!');
  }}
  hasColor={true}
/>
```

## Props

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `tableName` | `string` | **required** | Tên bảng trong database (phải có trong `allowed_setting_tables`) |
| `buttonText` | `string` | `'Thêm nhanh'` | Text hiển thị trên button |
| `buttonType` | `'link' \| 'text' \| 'default' \| 'primary' \| 'dashed'` | `'link'` | Loại button |
| `buttonSize` | `'small' \| 'middle' \| 'large'` | `'small'` | Kích thước button |
| `showAsTag` | `boolean` | `false` | Hiển thị dạng tag nhỏ (dùng trong label) |
| `onSuccess` | `(newItem: any) => void` | `undefined` | Callback sau khi thêm thành công |
| `modalTitle` | `string` | Auto-generated | Tiêu đề modal |
| `hasColor` | `boolean` | `true` | Hiển thị ColorPicker để chọn màu |
| `placeholder` | `string` | `'Nhập tên...'` | Placeholder cho input tên |

## Yêu cầu Backend

Bảng phải được thêm vào `config/constant.php`:

```php
'allowed_setting_tables' => [
    'loai_hang_hoa',
    'purchase_order_statuses',
    'task_status',
    'task_priority',
    // ... các bảng khác
]
```

Bảng cần có cấu trúc:
- `id` (auto increment)
- `name` (varchar) - **required**
- `color` (varchar) - optional, mặc định '#1890ff'
- `sort_order` (int) - optional
- `created_at`, `updated_at` (timestamps)

## API Endpoints

Component sử dụng `CommonSettingController`:

- **POST** `/aio/api/setting/{tableName}/add`
- **POST** `/aio/api/setting/{tableName}/list`

## Lưu ý

1. Component tự động cập nhật danh sách qua callback `onSuccess`
2. Item mới có thể tự động được chọn trong Select (thông qua `form.setFieldsValue`)
3. Hỗ trợ validation backend từ CommonSettingController
4. ColorPicker có thể tắt bằng `hasColor={false}`
