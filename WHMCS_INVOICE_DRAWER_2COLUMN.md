# WHMCS Invoice - New 2-Column Drawer for Creating Invoices

## Tóm tắt
Chuyển từ Modal/Form truyền thống sang Drawer layout 2 cột với trải nghiệm tốt hơn:
- **Trái**: Danh sách sản phẩm/dịch vụ có search
- **Phải**: Thông tin đơn hàng + giỏ hàng + tổng tiền

## Layout Mới

```
┌─────────────────────────────────────────────────────────────┐
│  Tạo hóa đơn mới                          [Hủy] [Tạo HĐ]   │
├────────────────────────────┬────────────────────────────────┤
│  DANH SÁCH SẢN PHẨM (60%) │  THÔNG TIN ĐƠN (40%)          │
├────────────────────────────┼────────────────────────────────┤
│  🔍 Tìm kiếm sản phẩm...   │  👤 Khách hàng: [Select]      │
│                            │  📅 Hạn TT: [DatePicker]      │
│  📦 Hosting Cloud          │  📝 Ghi chú: [TextArea]       │
│     ├─ Hàng tháng: 100K   │                                │
│     │  + Setup: 50K [+]   │  🛒 SẢN PHẨM ĐÃ CHỌN (2)      │
│     ├─ Hàng năm: 1000K    │  ┌──────────────────────────┐ │
│     │  + Setup: 0đ   [+]  │  │ Hosting Cloud            │ │
│                            │  │ └─ Hàng tháng            │ │
│  📦 VPS Standard           │  │ Đơn giá: 100,000         │ │
│     ├─ Tháng: 500K   [+]  │  │ Setup: 50,000            │ │
│     ├─ Năm: 5000K    [+]  │  │ SL: [2] ▼                │ │
│                            │  │ Thành tiền: 250,000 VNĐ  │ │
│  📦 Domain .com            │  │                     [Xóa] │ │
│     ├─ 1 năm: 300K   [+]  │  └──────────────────────────┘ │
│                            │  ┌──────────────────────────┐ │
│                            │  │ VPS Standard             │ │
│                            │  │ └─ Hàng năm              │ │
│                            │  │ Đơn giá: 5,000,000       │ │
│                            │  │ SL: [1] ▼                │ │
│                            │  │ Thành tiền: 5,000,000    │ │
│                            │  │                     [Xóa] │ │
│                            │  └──────────────────────────┘ │
│                            │                                │
│                            │  💰 TÓM TẮT ĐƠN HÀNG         │
│                            │  ─────────────────────────── │
│                            │  Tạm tính:      5,250,000 đ │
│                            │  ═══════════════════════════ │
│                            │  TỔNG CỘNG:     5,250,000 đ │
└────────────────────────────┴────────────────────────────────┘
```

## Key Features

### 1. **Drawer 90% Width**
```tsx
<Drawer
  placement="right"
  width={isMobile ? '100%' : '90%'}
  title="Tạo hóa đơn mới"
>
```

### 2. **2-Column Layout**
```tsx
<Row gutter={16}>
  <Col xs={24} lg={14}>  {/* Product List 60% */}
  <Col xs={24} lg={10}>  {/* Order Info 40% */}
</Row>
```

### 3. **Product Search**
```tsx
<Input
  placeholder="Tìm kiếm sản phẩm..."
  prefix={<SearchOutlined />}
  value={productSearchText}
  onChange={(e) => setProductSearchText(e.target.value)}
/>
```

### 4. **Shopping Cart Pattern**
```tsx
const [cart, setCart] = useState<CartItem[]>([]);

const addToCart = (product, pricing) => {
  // Check if exists, increase qty
  // Else add new item
};
```

### 5. **Real-time Total Calculation**
```tsx
const calculateTotal = () => {
  return cart.reduce((sum, item) => 
    sum + (item.unit_price * item.qty) + item.setup_fee, 0
  );
};
```

## Component Structure

### State Management
```tsx
// Drawer state
const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

// Product filter
const [filteredProducts, setFilteredProducts] = useState([]);
const [productSearchText, setProductSearchText] = useState('');

// Shopping cart
const [cart, setCart] = useState<CartItem[]>([]);

// Order info
const [selectedUserId, setSelectedUserId] = useState(null);
const [dueDate, setDueDate] = useState(null);
const [notes, setNotes] = useState('');
```

### Cart Item Interface
```tsx
interface CartItem {
  product_id: number;
  product_name: string;
  product_type: string;
  billing_cycle: string;
  billing_cycle_display: string;
  unit_price: number;
  setup_fee: number;
  qty: number;
  description: string;
}
```

## User Flow

1. **Click "Tạo hóa đơn mới"** → Drawer opens 90% width
2. **Select Customer** (required) → Enable product adding
3. **Search Products** → Filter list real-time
4. **Click [+] on pricing** → Add to cart
5. **Adjust quantity** → Update cart item
6. **Remove items** → Click [Xóa]
7. **Set due date & notes** → Optional
8. **View total** → Auto-calculated
9. **Click "Tạo hóa đơn"** → Submit

## Left Column - Product List

### Features
- ✅ Search by product name/type
- ✅ Display all products with pricings
- ✅ Each pricing has [+] button
- ✅ Show price + setup fee
- ✅ Responsive card layout
- ✅ Scrollable list

### Code
```tsx
<List
  dataSource={filteredProducts}
  renderItem={(product) => (
    <Card title={product.name}>
      <List
        dataSource={product.pricings}
        renderItem={(pricing) => (
          <List.Item
            actions={[
              <Button 
                icon={<PlusOutlined />}
                onClick={() => addToCart(product, pricing)}
              >
                Thêm
              </Button>
            ]}
          >
            <List.Item.Meta
              title={pricing.cycle_display}
              description={`${pricing.price.toLocaleString()} VNĐ`}
            />
          </List.Item>
        )}
      />
    </Card>
  )}
/>
```

## Right Column - Order Info

### Sections

#### 1. Customer & Date
```tsx
<Card>
  <Select 
    placeholder="Chọn khách hàng"
    value={selectedUserId}
    onChange={setSelectedUserId}
  />
  <DatePicker 
    value={dueDate}
    onChange={setDueDate}
  />
  <TextArea 
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
  />
</Card>
```

#### 2. Cart Items
```tsx
<Card title="Sản phẩm đã chọn">
  {cart.map((item, index) => (
    <List.Item
      actions={[
        <Button danger onClick={() => removeFromCart(index)}>
          Xóa
        </Button>
      ]}
    >
      <Meta
        title={item.product_name}
        description={
          <>
            Đơn giá: {item.unit_price.toLocaleString()}
            SL: <InputNumber value={item.qty} onChange={...} />
            Thành tiền: {(item.unit_price * item.qty + item.setup_fee).toLocaleString()}
          </>
        }
      />
    </List.Item>
  ))}
</Card>
```

#### 3. Total Summary
```tsx
<Card style={{ backgroundColor: '#f5f5f5' }}>
  <div>Tạm tính: {calculateSubtotal().toLocaleString()}</div>
  <Divider />
  <Title level={4}>
    Tổng cộng: {calculateTotal().toLocaleString()} VNĐ
  </Title>
</Card>
```

## Helper Functions

### addToCart
```tsx
const addToCart = (product: any, pricing: any) => {
  const existingItem = cart.find(
    item => item.product_id === product.id && 
            item.billing_cycle === pricing.cycle
  );

  if (existingItem) {
    // Increase quantity
    setCart(cart.map(item =>
      item.product_id === product.id && 
      item.billing_cycle === pricing.cycle
        ? { ...item, qty: item.qty + 1 }
        : item
    ));
  } else {
    // Add new item
    const newItem: CartItem = {
      product_id: product.id,
      product_name: product.name,
      product_type: product.type,
      billing_cycle: pricing.cycle,
      billing_cycle_display: pricing.cycle_display,
      unit_price: pricing.price,
      setup_fee: pricing.setup_fee || 0,
      qty: 1,
      description: `${product.name} - ${pricing.cycle_display}`,
    };
    setCart([...cart, newItem]);
  }
  message.success('Đã thêm vào giỏ hàng');
};
```

### removeFromCart
```tsx
const removeFromCart = (index: number) => {
  setCart(cart.filter((_, i) => i !== index));
};
```

### updateCartItemQty
```tsx
const updateCartItemQty = (index: number, qty: number) => {
  if (qty < 1) return;
  setCart(cart.map((item, i) => 
    i === index ? { ...item, qty } : item
  ));
};
```

### calculateSubtotal & calculateTotal
```tsx
const calculateSubtotal = () => {
  return cart.reduce((sum, item) => 
    sum + (item.unit_price * item.qty) + item.setup_fee, 0
  );
};

const calculateTotal = () => {
  return calculateSubtotal(); // Can add tax here
};
```

### resetCreateForm
```tsx
const resetCreateForm = () => {
  setCart([]);
  setSelectedUserId(null);
  setDueDate(null);
  setNotes('');
  setProductSearchText('');
};
```

## Submit Handler

```tsx
const handleCreateInvoice = async () => {
  try {
    const items = cart.map(item => ({
      product_id: item.product_id,
      description: item.description,
      type: 'product',
      billing_cycle: item.billing_cycle,
      qty: item.qty,
      unit_price: item.unit_price,
      setup_fee: item.setup_fee || 0,
    }));

    const payload = {
      user_id: selectedUserId,
      items: items,
      due_date: dueDate ? dayjs(dueDate).format('YYYY-MM-DD') : null,
      notes: notes || null,
    };

    await axios.post('/aio/api/whmcs/invoices', payload);
    message.success('Tạo hóa đơn thành công');
    setIsCreateDrawerOpen(false);
    resetCreateForm();
    fetchInvoices();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Không thể tạo hóa đơn');
  }
};
```

## Responsive Behavior

### Desktop (≥ 992px)
- Drawer width: 90%
- 2 columns: 60% products / 40% order
- Both columns scrollable

### Tablet (768px - 991px)
- Drawer width: 90%
- 2 columns stacked
- Vertical scroll

### Mobile (< 768px)
- Drawer width: 100%
- 1 column layout
- Products first, order info below

```tsx
<Col xs={24} lg={14}>  {/* xs=24 stacks on mobile, lg=14 is 60% on desktop */}
<Col xs={24} lg={10}>  {/* xs=24 stacks on mobile, lg=10 is 40% on desktop */}
```

## UX Improvements

### Before (Old Form)
- ❌ Select product from dropdown (hard to browse)
- ❌ Manual input pricing
- ❌ No preview of total
- ❌ Can't see all products at once
- ❌ Confusing form layout

### After (New Drawer)
- ✅ Browse all products visually
- ✅ Search products easily
- ✅ Click to add (shopping cart pattern)
- ✅ Real-time total calculation
- ✅ Clear 2-column separation
- ✅ Professional POS-like interface

## Performance

### Optimizations
- Product filter with useMemo
- Debounced search (optional)
- Virtual scroll for long product lists (optional)
- Lazy load product images (future)

## Files Changed

1. `resources/js/pages/whmcs/InvoiceList.tsx`
   - Added CartItem interface
   - Added cart state management
   - Added addToCart, removeFromCart, updateCartItemQty
   - Added calculateSubtotal, calculateTotal
   - Replaced Modal/Form with new Drawer layout

## Related Docs

- WHMCS_INVOICE_MOBILE_OPTIMIZATION.md
- WHMCS_INVOICE_ACTIONS_DROPDOWN.md
- WHMCS_INVOICE_EDIT_FEATURE.md

---
**Updated**: 12/11/2025  
**Type**: Major UX Improvement - Shopping Cart Pattern  
**Width**: 90% Drawer  
**Layout**: 60% Products / 40% Order Info
