# 🧘‍♀️ SPA MANAGEMENT SYSTEM - IMPLEMENTATION GUIDE

## 🎯 TỔNG QUAN DỰ ÁN

**Quy mô:** Enterprise-level SPA Management System  
**Công nghệ:** Laravel 11 + React 18 + TypeScript + Ant Design 5  
**Số lượng code:**
- 40+ Database Tables
- 40+ Models (Laravel Eloquent)
- 30+ Controllers với 150+ API endpoints  
- 30+ React Pages (15,000+ lines TypeScript)
- 50+ React Components

**Ước tính thời gian:** 6-8 tuần phát triển đầy đủ

---

## 📋 ROADMAP CHI TIẾT

### ✅ Phase 1: Database Design (HOÀN THÀNH)
**Thời gian:** 1 ngày  
**Files:** 9 migration files

```bash
# Chạy migrations
php artisan migrate

# Kiểm tra tables
php artisan db:table spa_khach_hang
```

### 🔄 Phase 2: Backend Development (4-5 tuần)

#### Week 1: Core Models & Controllers
**Ưu tiên cao:**
1. KhachHangController - Customer CRUD
2. DichVuController - Service management
3. SanPhamController - Product management
4. BookingController - Appointment booking

**Models cần tạo:**
```php
// app/Models/Spa/KhachHang.php
class KhachHang extends Model {
    // Relationships
    public function hoSoSucKhoe()
    public function hoSoDa()
    public function bookings()
    public function hoaDons()
    public function membershipCard()
    
    // Scopes
    public function scopeVIP($query)
    public function scopeActive($query)
    
    // Helpers
    public function updateTier() // Auto upgrade membership
    public function addPoints($points, $reason)
}
```

#### Week 2: Booking & POS System
1. BookingController - Complex logic
2. HoaDonController - POS checkout
3. KTVController - Staff management

#### Week 3: Membership & Marketing
1. MembershipController
2. VoucherController
3. CampaignController

#### Week 4: Analytics & Reports
1. DashboardController
2. ReportController
3. AnalyticsController

---

### 🎨 Phase 3: Frontend Development (2-3 tuần)

#### Priority 1: Customer & Booking (Week 1)
**Files to create:**

1. **resources/js/pages/spa/SpaCustomerList.tsx** (800+ lines)
```typescript
// Customer List with CRM features
- Search/Filter customers
- Customer segments (VIP, Loyal, New, At Risk)
- Quick actions: Book, View profile, Send SMS
- RFM Analysis dashboard
- Export to Excel
```

2. **resources/js/pages/spa/CustomerProfile.tsx** (1200+ lines)
```typescript
// Comprehensive customer profile
<Tabs>
  <TabPane tab="Thông tin" />     // Personal info + Membership card
  <TabPane tab="Hồ sơ sức khỏe" /> // Health profile with allergy warnings
  <TabPane tab="Hồ sơ da" />       // Skin analysis + Before/After photos
  <TabPane tab="Lịch sử" />        // Service + Purchase history
  <TabPane tab="Liệu trình" />     // Active packages + Progress
</Tabs>
```

3. **resources/js/pages/spa/SpaBookingCalendar.tsx** (1500+ lines)
```typescript
// Advanced booking calendar
- Calendar view (day/week/month)
- Drag & drop to reschedule
- Color-coded by status
- Real-time KTV availability
- Multi-service booking
- Deposit payment integration
```

4. **resources/js/pages/spa/BookingForm.tsx** (900+ lines)
```typescript
// Step-by-step booking form
<Steps current={step}>
  <Step title="Chọn dịch vụ" />
  <Step title="Chọn KTV" />
  <Step title="Chọn thời gian" />
  <Step title="Thông tin KH" />
  <Step title="Thanh toán cọc" />
</Steps>
```

#### Priority 2: POS & Sales (Week 1)
5. **resources/js/pages/spa/SpaPOSScreen.tsx** (1800+ lines)
```typescript
// Full-featured POS
<Row gutter={16}>
  <Col span={16}>
    <Tabs>
      <TabPane tab="Dịch vụ">
        <ServiceGrid /> // Click to add to cart
      </TabPane>
      <TabPane tab="Sản phẩm">
        <ProductGrid />
      </TabPane>
      <TabPane tab="Liệu trình">
        <PackageGrid />
      </TabPane>
    </Tabs>
  </Col>
  
  <Col span={8}>
    <CustomerSearch /> // Scan card or search
    <Cart items={cartItems} />
    <DiscountSection /> // Voucher + Points
    <PaymentMethod />
    <TotalSummary />
    <CheckoutButton />
  </Col>
</Row>
```

#### Priority 3: Service & Product (Week 2)
6. **SpaServiceList.tsx** (700+ lines)
7. **TreatmentPackageList.tsx** (600+ lines)
8. **SpaProductList.tsx** (800+ lines)
9. **SpaInventoryList.tsx** (700+ lines)

#### Priority 4: Staff & Membership (Week 2)
10. **SpaStaffList.tsx** (600+ lines)
11. **StaffSchedule.tsx** (900+ lines)
12. **SpaMembershipList.tsx** (500+ lines)
13. **LoyaltyPointsPage.tsx** (600+ lines)

#### Priority 5: Analytics & Marketing (Week 3)
14. **SpaAnalyticsDashboard.tsx** (1200+ lines)
```typescript
// Comprehensive dashboard
<Row gutter={16}>
  <Col span={6}>
    <StatisticCard title="Hôm nay" data={todayStats} />
  </Col>
  {/* More cards */}
</Row>

<Tabs>
  <TabPane tab="Doanh thu">
    <LineChart data={revenueData} />
  </TabPane>
  <TabPane tab="Khách hàng">
    <RFMSegmentChart />
  </TabPane>
  <TabPane tab="Dịch vụ">
    <ServiceAnalytics />
  </TabPane>
</Tabs>
```

15. **SpaReportPage.tsx** (800+ lines)
16. **SpaMarketingCampaign.tsx** (700+ lines)
17. **VoucherList.tsx** (500+ lines)

#### Priority 6: System Settings (Week 3)
18. **SpaBranchList.tsx** (400+ lines)
19. **SpaRoomList.tsx** (400+ lines)
20. **SpaSettings.tsx** (600+ lines)

---

## 🔧 TECHNICAL IMPLEMENTATION

### Backend APIs Structure

```php
// routes/spa_route.php

Route::group(['prefix' => 'spa', 'middleware' => ['auth']], function () {
    
    // Customer APIs
    Route::post('/api/spa/customer/list', [KhachHangController::class, 'apiList']);
    Route::post('/api/spa/customer/add', [KhachHangController::class, 'apiAdd']);
    Route::post('/api/spa/customer/update', [KhachHangController::class, 'apiUpdate']);
    Route::post('/api/spa/customer/delete', [KhachHangController::class, 'apiDelete']);
    Route::post('/api/spa/customer/profile/{id}', [KhachHangController::class, 'apiProfile']);
    Route::post('/api/spa/customer/health-record/{id}', [KhachHangController::class, 'apiHealthRecord']);
    Route::post('/api/spa/customer/skin-profile/{id}', [KhachHangController::class, 'apiSkinProfile']);
    Route::post('/api/spa/customer/upload-photo', [KhachHangController::class, 'apiUploadPhoto']);
    
    // Booking APIs
    Route::post('/api/spa/booking/list', [BookingController::class, 'apiList']);
    Route::post('/api/spa/booking/calendar', [BookingController::class, 'apiCalendar']);
    Route::post('/api/spa/booking/available-slots', [BookingController::class, 'apiAvailableSlots']);
    Route::post('/api/spa/booking/available-staff', [BookingController::class, 'apiAvailableStaff']);
    Route::post('/api/spa/booking/create', [BookingController::class, 'apiCreate']);
    Route::post('/api/spa/booking/update-status', [BookingController::class, 'apiUpdateStatus']);
    Route::post('/api/spa/booking/cancel', [BookingController::class, 'apiCancel']);
    Route::post('/api/spa/booking/send-reminder', [BookingController::class, 'apiSendReminder']);
    
    // Service APIs
    Route::post('/api/spa/service/list', [DichVuController::class, 'apiList']);
    Route::post('/api/spa/service/by-category', [DichVuController::class, 'apiByCategory']);
    Route::post('/api/spa/service/add', [DichVuController::class, 'apiAdd']);
    Route::post('/api/spa/service/update', [DichVuController::class, 'apiUpdate']);
    
    // Treatment Package APIs
    Route::post('/api/spa/package/list', [LieuTrinhController::class, 'apiList']);
    Route::post('/api/spa/package/customer-packages/{customerId}', [LieuTrinhController::class, 'apiCustomerPackages']);
    Route::post('/api/spa/package/use-session', [LieuTrinhController::class, 'apiUseSession']);
    
    // Product APIs
    Route::post('/api/spa/product/list', [SanPhamController::class, 'apiList']);
    Route::post('/api/spa/product/inventory-alert', [SanPhamController::class, 'apiInventoryAlert']);
    Route::post('/api/spa/product/stock-in', [SanPhamController::class, 'apiStockIn']);
    
    // POS APIs
    Route::post('/api/spa/pos/search-customer', [POSController::class, 'apiSearchCustomer']);
    Route::post('/api/spa/pos/checkout', [POSController::class, 'apiCheckout']);
    Route::post('/api/spa/pos/apply-voucher', [POSController::class, 'apiApplyVoucher']);
    Route::post('/api/spa/pos/calculate-points', [POSController::class, 'apiCalculatePoints']);
    
    // Staff APIs
    Route::post('/api/spa/staff/list', [KTVController::class, 'apiList']);
    Route::post('/api/spa/staff/schedule/{staffId}', [KTVController::class, 'apiSchedule']);
    Route::post('/api/spa/staff/commission/{staffId}', [KTVController::class, 'apiCommission']);
    Route::post('/api/spa/staff/leave-request', [KTVController::class, 'apiLeaveRequest']);
    
    // Membership APIs
    Route::post('/api/spa/membership/tiers', [MembershipController::class, 'apiTiers']);
    Route::post('/api/spa/membership/card-info/{customerId}', [MembershipController::class, 'apiCardInfo']);
    Route::post('/api/spa/membership/add-points', [MembershipController::class, 'apiAddPoints']);
    Route::post('/api/spa/membership/redeem-gift', [MembershipController::class, 'apiRedeemGift']);
    
    // Analytics APIs
    Route::post('/api/spa/analytics/dashboard', [AnalyticsController::class, 'apiDashboard']);
    Route::post('/api/spa/analytics/revenue', [AnalyticsController::class, 'apiRevenue']);
    Route::post('/api/spa/analytics/customer-segment', [AnalyticsController::class, 'apiCustomerSegment']);
    Route::post('/api/spa/analytics/top-services', [AnalyticsController::class, 'apiTopServices']);
    Route::post('/api/spa/analytics/staff-performance', [AnalyticsController::class, 'apiStaffPerformance']);
    
    // Marketing APIs
    Route::post('/api/spa/marketing/campaign/list', [CampaignController::class, 'apiList']);
    Route::post('/api/spa/marketing/campaign/create', [CampaignController::class, 'apiCreate']);
    Route::post('/api/spa/marketing/campaign/send', [CampaignController::class, 'apiSend']);
    Route::post('/api/spa/marketing/voucher/generate', [VoucherController::class, 'apiGenerate']);
    Route::post('/api/spa/marketing/voucher/validate', [VoucherController::class, 'apiValidate']);
    
    // System APIs
    Route::post('/api/spa/branch/list', [ChiNhanhController::class, 'apiList']);
    Route::post('/api/spa/room/list', [PhongController::class, 'apiList']);
    Route::post('/api/spa/room/status', [PhongController::class, 'apiUpdateStatus']);
    Route::post('/api/spa/settings/get', [SettingsController::class, 'apiGet']);
    Route::post('/api/spa/settings/update', [SettingsController::class, 'apiUpdate']);
});

// View routes
Route::get('/spa/customers', function() {
    return view('admin.spa.customer_list');
})->name('spa.customers');

Route::get('/spa/booking', function() {
    return view('admin.spa.booking_calendar');
})->name('spa.booking');

Route::get('/spa/pos', function() {
    return view('admin.spa.pos');
})->name('spa.pos');

// ... more view routes
```

### Frontend Route Configuration

```typescript
// resources/js/common/route.tsx
export default {
    // ... existing routes
    
    // SPA Module Routes
    spaCustomers: '/spa/customers',
    spaCustomerProfile: '/spa/customer/:id',
    spaBookingCalendar: '/spa/booking/calendar',
    spaBookingList: '/spa/booking/list',
    spaPOS: '/spa/pos',
    spaInvoices: '/spa/invoices',
    spaServices: '/spa/services',
    spaPackages: '/spa/packages',
    spaProducts: '/spa/products',
    spaInventory: '/spa/inventory',
    spaStaff: '/spa/staff',
    spaStaffSchedule: '/spa/staff/schedule',
    spaMembership: '/spa/membership',
    spaLoyalty: '/spa/loyalty',
    spaAnalytics: '/spa/analytics',
    spaReports: '/spa/reports',
    spaMarketing: '/spa/marketing',
    spaVouchers: '/spa/vouchers',
    spaBranches: '/spa/branches',
    spaRooms: '/spa/rooms',
    spaSettings: '/spa/settings',
};
```

### API Endpoints Configuration

```typescript
// resources/js/common/api.tsx
export default {
    // ... existing APIs
    
    // SPA Customer APIs
    spaCustomerList: '/aio/api/spa/customer/list',
    spaCustomerAdd: '/aio/api/spa/customer/add',
    spaCustomerUpdate: '/aio/api/spa/customer/update',
    spaCustomerDelete: '/aio/api/spa/customer/delete',
    spaCustomerProfile: '/aio/api/spa/customer/profile',
    spaCustomerHealthRecord: '/aio/api/spa/customer/health-record',
    spaCustomerSkinProfile: '/aio/api/spa/customer/skin-profile',
    
    // SPA Booking APIs
    spaBookingList: '/aio/api/spa/booking/list',
    spaBookingCalendar: '/aio/api/spa/booking/calendar',
    spaBookingAvailableSlots: '/aio/api/spa/booking/available-slots',
    spaBookingAvailableStaff: '/aio/api/spa/booking/available-staff',
    spaBookingCreate: '/aio/api/spa/booking/create',
    spaBookingUpdateStatus: '/aio/api/spa/booking/update-status',
    spaBookingCancel: '/aio/api/spa/booking/cancel',
    
    // SPA Service APIs
    spaServiceList: '/aio/api/spa/service/list',
    spaServiceByCategory: '/aio/api/spa/service/by-category',
    spaServiceAdd: '/aio/api/spa/service/add',
    
    // SPA Product APIs
    spaProductList: '/aio/api/spa/product/list',
    spaProductInventoryAlert: '/aio/api/spa/product/inventory-alert',
    spaProductStockIn: '/aio/api/spa/product/stock-in',
    
    // SPA POS APIs
    spaPOSSearchCustomer: '/aio/api/spa/pos/search-customer',
    spaPOSCheckout: '/aio/api/spa/pos/checkout',
    spaPOSApplyVoucher: '/aio/api/spa/pos/apply-voucher',
    
    // SPA Staff APIs
    spaStaffList: '/aio/api/spa/staff/list',
    spaStaffSchedule: '/aio/api/spa/staff/schedule',
    spaStaffCommission: '/aio/api/spa/staff/commission',
    
    // SPA Membership APIs
    spaMembershipTiers: '/aio/api/spa/membership/tiers',
    spaMembershipCardInfo: '/aio/api/spa/membership/card-info',
    spaMembershipAddPoints: '/aio/api/spa/membership/add-points',
    
    // SPA Analytics APIs
    spaAnalyticsDashboard: '/aio/api/spa/analytics/dashboard',
    spaAnalyticsRevenue: '/aio/api/spa/analytics/revenue',
    spaAnalyticsCustomerSegment: '/aio/api/spa/analytics/customer-segment',
    
    // SPA Marketing APIs
    spaMarketingCampaignList: '/aio/api/spa/marketing/campaign/list',
    spaMarketingVoucherGenerate: '/aio/api/spa/marketing/voucher/generate',
    
    // SPA System APIs
    spaBranchList: '/aio/api/spa/branch/list',
    spaRoomList: '/aio/api/spa/room/list',
    spaSettingsGet: '/aio/api/spa/settings/get',
};
```

---

## 📱 MENU STRUCTURE

```jsx
// resources/js/common/menu.jsx
{
    parent: {
        link: '#',
        display_name: '🧘‍♀️ Quản lý Spa',
        key: key++,
        icon: <SkinOutlined />
    },
    sub: [
        {
            link: route('spa.analytics'),
            display_name: 'Dashboard',
            key: key++,
            icon: <DashboardOutlined />
        },
        {
            link: route('spa.booking'),
            display_name: 'Lịch hẹn',
            key: key++,
            icon: <CalendarOutlined />
        },
        {
            link: route('spa.pos'),
            display_name: 'Bán hàng (POS)',
            key: key++,
            icon: <ShoppingCartOutlined />
        },
        {
            link: route('spa.customers'),
            display_name: 'Khách hàng',
            key: key++,
            icon: <UserOutlined />
        },
        {
            link: route('spa.services'),
            display_name: 'Dịch vụ',
            key: key++,
            icon: <ScissorOutlined />
        },
        {
            link: route('spa.products'),
            display_name: 'Sản phẩm',
            key: key++,
            icon: <GiftOutlined />
        },
        {
            link: route('spa.staff'),
            display_name: 'Kỹ thuật viên',
            key: key++,
            icon: <TeamOutlined />
        },
        {
            link: route('spa.membership'),
            display_name: 'Thẻ thành viên',
            key: key++,
            icon: <CreditCardOutlined />
        },
        {
            link: route('spa.marketing'),
            display_name: 'Marketing',
            key: key++,
            icon: <NotificationOutlined />
        },
        {
            link: route('spa.reports'),
            display_name: 'Báo cáo',
            key: key++,
            icon: <BarChartOutlined />
        },
        {
            link: route('spa.settings'),
            display_name: 'Cài đặt',
            key: key++,
            icon: <SettingOutlined />
        }
    ]
}
```

---

## 🎨 UI/UX DESIGN GUIDELINES

### Color Palette
```css
:root {
    --spa-primary: #E8B4B8;      /* Soft pink */
    --spa-secondary: #A8D5BA;    /* Mint green */
    --spa-accent: #F7DC6F;       /* Gold */
    --spa-dark: #34495E;         /* Dark gray */
    --spa-light: #F8F9FA;        /* Light cream */
}
```

### Component Styling
```tsx
// ServiceCard.tsx
<Card
    hoverable
    style={{
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(232, 180, 184, 0.15)'
    }}
>
    <Badge.Ribbon text="Bestseller" color="pink">
        <Image src={service.image} height={200} />
    </Badge.Ribbon>
    <Space direction="vertical" size="small">
        <Title level={4}>{service.name}</Title>
        <Text type="secondary">{service.duration} phút</Text>
        <Text strong style={{ color: '#E8B4B8', fontSize: '18px' }}>
            {formatCurrency(service.price)}
        </Text>
        <Rate disabled defaultValue={service.rating} />
    </Space>
    <Button type="primary" block style={{ background: '#E8B4B8', borderColor: '#E8B4B8' }}>
        Đặt lịch ngay
    </Button>
</Card>
```

---

## 🧪 TESTING CHECKLIST

### Unit Tests
- [ ] Model relationships
- [ ] Scopes & helpers
- [ ] Business logic methods

### Integration Tests
- [ ] Booking workflow end-to-end
- [ ] POS checkout process
- [ ] Point system calculation
- [ ] Membership tier upgrade
- [ ] Commission calculation

### Manual Testing
- [ ] Create customer with health record
- [ ] Book appointment with multiple services
- [ ] Assign staff to services
- [ ] Complete service & checkout
- [ ] Apply voucher & use points
- [ ] Check staff commission calculated
- [ ] Test membership upgrade
- [ ] Send SMS/Email campaigns

---

## 📚 DOCUMENTATION FILES

Create these documentation files:
1. **SPA_USER_GUIDE.md** - Hướng dẫn sử dụng cho staff
2. **SPA_ADMIN_GUIDE.md** - Hướng dẫn quản trị hệ thống
3. **SPA_API_DOCS.md** - API documentation
4. **SPA_DEPLOYMENT.md** - Deployment guide

---

## 🚀 DEPLOYMENT STEPS

```bash
# 1. Run migrations
php artisan migrate

# 2. Seed default data (membership tiers, settings)
php artisan db:seed --class=SpaMembershipSeeder
php artisan db:seed --class=SpaSettingsSeeder

# 3. Build frontend
npm run build

# 4. Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# 5. Set permissions (Linux/Mac)
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# 6. Test
php artisan test --testsuite=Spa
```

---

## 💡 BUSINESS LOGIC HIGHLIGHTS

### Auto Membership Tier Upgrade
```php
// KhachHang Model
public function updateTier()
{
    $chiTieu = $this->tong_chi_tieu;
    
    $tier = MembershipTier::where('chi_tieu_toi_thieu', '<=', $chiTieu)
        ->orderBy('chi_tieu_toi_thieu', 'desc')
        ->first();
        
    if ($tier && $this->membershipCard->membership_tier_id != $tier->id) {
        $this->membershipCard->update([
            'membership_tier_id' => $tier->id
        ]);
        
        // Send upgrade notification
        Notification::send($this, new MembershipUpgradeNotification($tier));
    }
}
```

### Commission Calculation
```php
// After invoice is created
public function calculateCommission($invoice)
{
    foreach ($invoice->chiTiets as $item) {
        if ($item->loai === 'dich_vu' && $item->ktv_id) {
            $ktv = KTV::find($item->ktv_id);
            
            KTVHoaHong::create([
                'ktv_id' => $ktv->id,
                'hoa_don_id' => $invoice->id,
                'loai' => 'dich_vu',
                'gia_tri_goc' => $item->thanh_tien,
                'phan_tram' => $ktv->phan_tram_hoa_hong,
                'tien_hoa_hong' => $item->thanh_tien * $ktv->phan_tram_hoa_hong / 100,
                'thang' => now()->startOfMonth()
            ]);
        }
    }
    
    // Tip commission (100% to staff)
    if ($invoice->tien_tip > 0) {
        // Logic to distribute tip
    }
}
```

### Point System
```php
// Calculate points on checkout
public function calculatePoints($invoice, $customer)
{
    $tier = $customer->membershipCard->tier;
    $basePoints = floor($invoice->tong_thanh_toan / 10000); // 1 point per 10K
    $earnedPoints = $basePoints * $tier->he_so_tich_diem;
    
    $customer->addPoints($earnedPoints, 'Mua hàng #' . $invoice->ma_hoa_don);
    
    return $earnedPoints;
}
```

---

**Status:** ✅ Database Complete - Ready for Backend & Frontend Development

**Next Action:** Sếp quyết định approach:
1. **Full Implementation** - Em code toàn bộ (6-8 tuần)
2. **MVP First** - Làm 5 modules ưu tiên trước (3-4 tuần)
3. **Step by Step** - Làm từng module, test kỹ rồi làm tiếp

Sếp muốn em làm theo hướng nào ạ? 🚀
