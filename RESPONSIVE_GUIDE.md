# Hướng dẫn tối ưu Responsive cho các màn hình

## Đã hoàn thành ✅
- **CongNoList.tsx** - Đã tối ưu đầy đủ với Filter Drawer, Dropdown Actions, Responsive Statistics

## Cần áp dụng cho:
1. NewsList.tsx
2. ProductsList.tsx  
3. MenuList.tsx
4. SoQuyList.tsx

---

## BƯỚC 1: Import các component cần thiết

```typescript
// Thêm vào import antd
import {
  ...existing imports,
  Drawer,
  Dropdown,
  Row,
  Col
} from 'antd';
import type { MenuProps } from 'antd';

// Thêm icons
import {
  ...existing icons,
  FilterOutlined,
  MoreOutlined
} from '@ant-design/icons';

// Import components và CSS
import { ActionDropdown } from '../../components/ActionDropdown';
import '../../../css/common-responsive.css';
```

---

## BƯỚC 2: Thêm state cho Filter Drawer

```typescript
// Trong component, thêm state:
const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
```

---

## BƯỚC 3: Thay đổi cấu trúc return()

### 3.1. Thêm class và mobile filter button

```tsx
return (
  <div className="page-container" style={{ padding: 24 }}>
    <Divider orientation="left" style={{ fontSize: 20, fontWeight: 'bold', marginTop: 0 }}>
      Tên màn hình
    </Divider>

    {/* Mobile Filter Button */}
    <div className="mobile-only" style={{ marginBottom: 16 }}>
      <Button 
        icon={<FilterOutlined />} 
        onClick={() => setFilterDrawerVisible(true)}
        block
        size="large"
      >
        Bộ lọc & Tìm kiếm
      </Button>
    </div>

    <div style={{ display: 'flex', gap: 16 }}>
      {/* Desktop Filter Panel */}
      <div className="desktop-only" style={{ width: 280, flexShrink: 0 }}>
        {/* Filter content */}
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        title="Bộ lọc & Tìm kiếm"
        placement="left"
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        width={300}
        footer={
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button block type="primary" onClick={() => setFilterDrawerVisible(false)}>
              Áp dụng
            </Button>
            <Button block onClick={handleClearFilters}>
              Xóa bộ lọc
            </Button>
          </Space>
        }
      >
        {/* Copy nội dung filter từ desktop panel */}
      </Drawer>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Table và actions */}
      </div>
    </div>
  </div>
);
```

---

## BƯỚC 4: Tối ưu Action Column với Dropdown

### Thay thế:
```tsx
// CŨ:
{
  title: 'Thao tác',
  width: 200,
  render: (_, record) => (
    <Space>
      <Button onClick={() => handleEdit(record)}>Sửa</Button>
      <Popconfirm onConfirm={() => handleDelete(record.id)}>
        <Button>Xóa</Button>
      </Popconfirm>
    </Space>
  )
}

// MỚI:
{
  title: 'Thao tác',
  width: 120,
  fixed: 'right',
  render: (_, record) => (
    <ActionDropdown
      onEdit={() => handleEdit(record)}
      onDelete={() => handleDelete([record.id])}
      deleteConfirmContent={`Bạn có chắc muốn xóa "${record.name}"?`}
    />
  )
}
```

---

## BƯỚC 5: Tối ưu Modal Form với Row/Col

```tsx
<Modal width={900} ...>
  <Form layout="vertical">
    <Row gutter={16}>
      <Col xs={24} sm={12}>
        <Form.Item label="Field 1" name="field1">
          <Input />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item label="Field 2" name="field2">
          <Input />
        </Form.Item>
      </Col>
      {/* Full width field */}
      <Col xs={24}>
        <Form.Item label="Description" name="desc">
          <TextArea rows={3} />
        </Form.Item>
      </Col>
    </Row>
  </Form>
</Modal>
```

---

## BƯỚC 6: Tối ưu Action Buttons

```tsx
<div className="action-buttons-mobile" style={{ 
  marginBottom: 16, 
  display: 'flex', 
  justifyContent: 'space-between',
  gap: 8,
  flexWrap: 'wrap'
}}>
  <Space wrap>
    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
      <span className="hide-on-mobile">Thêm mới</span>
    </Button>
    <Button icon={<DownloadOutlined />} onClick={handleExport}>
      <span className="hide-on-mobile">Export</span>
    </Button>
  </Space>
</div>
```

---

## CSS Classes đã có sẵn (common-responsive.css)

- `.page-container` - Container chính
- `.desktop-only` - Chỉ hiện desktop (>768px)
- `.mobile-only` - Chỉ hiện mobile (≤768px)
- `.hide-on-mobile` - Ẩn text trên mobile
- `.action-buttons-mobile` - Responsive buttons

---

## Component đã có sẵn

### 1. ActionDropdown
```tsx
import { ActionDropdown } from '../../components/ActionDropdown';

<ActionDropdown
  onEdit={() => handleEdit(record)}
  onDelete={() => handleDelete(record.id)}
  deleteConfirmTitle="Xác nhận xóa"
  deleteConfirmContent="Bạn có chắc chắn?"
  extraActions={[
    {
      key: 'custom',
      icon: <Icon />,
      label: 'Custom Action',
      onClick: () => handleCustom(record)
    }
  ]}
/>
```

### 2. FilterDrawer
```tsx
import FilterDrawer from '../../components/FilterDrawer';

<FilterDrawer
  visible={filterDrawerVisible}
  onClose={() => setFilterDrawerVisible(false)}
  onClear={handleClearFilters}
  title="Bộ lọc"
>
  {/* Filter content */}
</FilterDrawer>
```

---

## Checklist cho mỗi màn hình

- [ ] Import Drawer, Dropdown, Row, Col, FilterOutlined, MoreOutlined
- [ ] Import ActionDropdown và common-responsive.css
- [ ] Thêm state filterDrawerVisible
- [ ] Thêm className="page-container" cho div chính
- [ ] Thêm mobile filter button với className="mobile-only"
- [ ] Thêm className="desktop-only" cho filter panel
- [ ] Tạo Drawer với filter content
- [ ] Thay action column bằng ActionDropdown (width: 200 → 120)
- [ ] Wrap form fields với Row/Col (xs={24} sm={12})
- [ ] Thêm className cho action buttons
- [ ] Test responsive: resize browser 768px, 480px

---

## Breakpoints

- **Mobile**: ≤ 768px
- **Small Mobile**: ≤ 480px  
- **Tablet**: 769px - 1024px
- **Desktop**: > 1024px
