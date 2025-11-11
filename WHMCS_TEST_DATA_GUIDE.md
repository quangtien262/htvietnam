# WHMCS Test Data Guide

## Tổng quan
File này hướng dẫn cách tạo data test đầy đủ cho module WHMCS để phục vụ testing và demo.

## Cấu trúc Data Test

Seeder `WhmcsCompleteTestDataSeeder` sẽ tạo data test hoàn chỉnh bao gồm:

### 1. **Test Clients (5 users)**
- **Client 1**: Nguyễn Văn A (client1@test.com)
  - Công ty: TNHH ABC
  - Services: Hosting Basic + Domain .com
  - Status: Active, đã thanh toán đầy đủ
  
- **Client 2**: Trần Thị B (client2@test.com)
  - Công ty: CP XYZ
  - Services: Hosting Standard + VPS Starter
  - Status: Active, có 1 invoice chưa thanh toán hết
  
- **Client 3**: Lê Văn C (client3@test.com)
  - Services: Hosting Premium
  - Status: Active, khách hàng lâu năm
  
- **Client 4**: Phạm Thị D (client4@test.com)
  - Công ty: Startup Digital
  - Services: VPS Business (suspended do chưa thanh toán)
  - Status: Có invoice quá hạn
  
- **Client 5**: Hoàng Văn E (client5@test.com)
  - Services: Domain .vn + SSL Certificate
  - Status: Active, invoice mới pending

### 2. **Product Groups (4 groups)**
- **Shared Hosting**: Gói hosting chia sẻ
- **VPS Hosting**: Máy chủ ảo VPS
- **Domain Names**: Đăng ký tên miền
- **SSL Certificates**: Chứng chỉ SSL

### 3. **Products (9 products)**
- **Hosting Basic**: 50k/tháng - 450k/năm
- **Hosting Standard**: 100k/tháng - 900k/năm
- **Hosting Premium**: 200k/tháng - 1.8M/năm
- **VPS Starter**: 300k/tháng (setup: 100k)
- **VPS Business**: 600k/tháng (setup: 100k)
- **Domain .com**: 300k/năm
- **Domain .vn**: 400k/năm
- **SSL Basic**: 500k/năm

Mỗi product có đầy đủ:
- Product pricing với nhiều billing cycles
- Config (disk, bandwidth, email accounts...)
- Module name (cpanel, virtualizor)

### 4. **Servers (4 servers)**
- **Server cPanel 01**: cp1.hosting.vn (103.56.158.10)
- **Server cPanel 02**: cp2.hosting.vn (103.56.158.11)
- **Server VPS 01**: vps1.hosting.vn (103.56.158.20)
- **Server Backup**: backup.hosting.vn (103.56.158.30)

### 5. **Services (9 services)**
Các service đang active và suspended cho các clients, bao gồm:
- Hosting services với domain, username
- VPS services
- Domain registrations
- SSL certificates

### 6. **Invoices (5 invoices)**
- **INV-001**: Client 1 - Paid (825k)
- **INV-002**: Client 2 - Partially paid (528k, còn nợ 228k)
- **INV-003**: Client 3 - Paid (1.98M)
- **INV-004**: Client 4 - Unpaid, overdue (660k)
- **INV-005**: Client 5 - Pending (990k)

Mỗi invoice có:
- Invoice items chi tiết
- Tính toán tax (10% VAT)
- Subtotal, tax, total, balance

### 7. **Transactions (3 transactions)**
- Thanh toán chuyển khoản (bank_transfer)
- Thanh toán VNPay (vnpay)
- Thanh toán một phần

### 8. **Support Tickets (5 tickets)**
- **Ticket 1**: Không thể truy cập email (Open, Medium)
- **Ticket 2**: Website bị chậm (In Progress, High)
- **Ticket 3**: Hỏi về hóa đơn (Closed, Low)
- **Ticket 4**: Dịch vụ bị suspend (Open, High)
- **Ticket 5**: Tư vấn nâng cấp hosting (Answered, Low)

Mỗi ticket có:
- Multiple ticket replies (từ client và admin)
- Department, priority, status
- Conversation thực tế

### 9. **API Keys (4 keys)**
- **Mobile App API**: Client 1, full permissions
- **Website Integration**: Client 2, limited IPs
- **Admin Full Access**: Admin user, unlimited
- **Old Integration**: Client 3, expired

## Cách sử dụng

### Option 1: Chạy seeder riêng lẻ
```bash
# Tạo data test WHMCS
php artisan db:seed --class=WhmcsCompleteTestDataSeeder

# Hoặc cùng với Phase 3 data (currency, tax, knowledge base)
php artisan db:seed --class=WhmcsPhase3Seeder
php artisan db:seed --class=WhmcsCompleteTestDataSeeder
```

### Option 2: Thêm vào DatabaseSeeder
Uncomment dòng trong `database/seeders/DatabaseSeeder.php`:
```php
// Uncomment to seed WHMCS test data
$this->call(WhmcsCompleteTestDataSeeder::class);
```

Sau đó chạy:
```bash
php artisan db:seed
```

### Option 3: Fresh migration + seed
```bash
# Reset database và seed tất cả
php artisan migrate:fresh --seed

# Hoặc chỉ reset và seed WHMCS
php artisan migrate:fresh
php artisan db:seed --class=WhmcsPhase3Seeder
php artisan db:seed --class=WhmcsCompleteTestDataSeeder
```

## Test Login Credentials

### Admin Access
- **Email**: admin@test.com
- **Password**: password
- **Access**: Full system access

### Client Access
- **Client 1**: client1@test.com / password
- **Client 2**: client2@test.com / password
- **Client 3**: client3@test.com / password
- **Client 4**: client4@test.com / password (có service bị suspend)
- **Client 5**: client5@test.com / password

## Scenarios để Test

### 1. Invoice Management
- ✅ Xem invoice đã thanh toán (Client 1, 3)
- ✅ Xem invoice chưa thanh toán (Client 2, 4, 5)
- ✅ Xem invoice overdue (Client 4)
- ✅ Record payment cho invoice chưa thanh toán
- ✅ Cancel invoice

### 2. Service Management
- ✅ Xem active services
- ✅ Xem suspended service (Client 4)
- ✅ Suspend/Unsuspend service
- ✅ Terminate service
- ✅ Tạo service mới cho client

### 3. Support Tickets
- ✅ Xem tickets theo status (Open, In Progress, Answered, Closed)
- ✅ Reply ticket
- ✅ Change priority/status
- ✅ Tạo ticket mới

### 4. Product Management
- ✅ Xem products theo group
- ✅ Xem pricing của products
- ✅ Tạo product mới
- ✅ Update product pricing

### 5. API Testing
- ✅ Test API với valid key
- ✅ Test API với expired key
- ✅ Test IP restriction
- ✅ Test permissions

### 6. Reports & Analytics
- ✅ Revenue by product
- ✅ Service status distribution
- ✅ Ticket statistics
- ✅ Client list với số service/invoice

## Data Statistics

Sau khi seed, bạn sẽ có:
- 📊 **5 Clients** (users)
- 📦 **9 Products** (3 hosting, 2 VPS, 2 domains, 1 SSL, với đầy đủ pricing)
- 🖥️ **4 Servers** (2 cPanel, 1 VPS, 1 Backup)
- ⚙️ **9 Services** (8 active, 1 suspended)
- 🧾 **5 Invoices** (2 paid, 1 partial, 1 unpaid, 1 pending)
- 💰 **3 Transactions** (2 successful, 1 partial)
- 🎫 **5 Support Tickets** với multiple replies
- 🔑 **4 API Keys** (3 active, 1 expired)

## Lưu ý

1. **Foreign Keys**: Seeder đã được cập nhật để dùng `users` table thay vì `whmcs_clients` (theo migrations mới nhất)

2. **Password**: Tất cả user đều dùng password: `password` (đã hash)

3. **Idempotent**: Seeder sử dụng `firstOrCreate()` nên có thể chạy nhiều lần mà không tạo duplicate

4. **Dependencies**: Đảm bảo đã chạy migrations trước:
   ```bash
   php artisan migrate
   ```

5. **Currency**: Tất cả giá đều tính bằng VND

6. **Realistic Data**: Data được thiết kế để giống tình huống thực tế:
   - Có khách đã thanh toán đầy đủ
   - Có khách nợ tiền
   - Có service bị suspend
   - Có ticket đang open và closed
   - Có API key expired

## Troubleshooting

### Lỗi Foreign Key
Nếu gặp lỗi foreign key constraint, chạy lại migrations:
```bash
php artisan migrate:fresh
php artisan db:seed --class=WhmcsPhase3Seeder
php artisan db:seed --class=WhmcsCompleteTestDataSeeder
```

### Lỗi Duplicate Entry
Nếu data đã tồn tại, seeder sẽ skip. Để tạo lại từ đầu:
```bash
php artisan migrate:fresh --seed
```

### Test API Keys
Để test API keys, sử dụng các key được tạo:
```bash
# Lấy API keys từ database
php artisan tinker
>>> \App\Models\Whmcs\ApiKey::all()->pluck('key', 'name');
```

## Next Steps

Sau khi seed data, bạn có thể:
1. Test các tính năng WHMCS trên UI
2. Chạy integration tests với data có sẵn
3. Demo hệ thống cho khách hàng
4. Develop thêm features dựa trên data test

---
**Updated**: 11/11/2025
**Version**: 1.0
**Author**: AI Coding Agent
